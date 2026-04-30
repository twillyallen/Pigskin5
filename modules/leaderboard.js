// modules/leaderboard.js
import { supabase, getCurrentUser } from "./supabase-client.js";
import { computeNewAchievements } from "./achievements.js";
import { getRunDateISO } from "./date-utils.js";

// Submit a leaderboard entry for the logged-in user
export async function submitEntry(dateStr, entry) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You need to sign in to post to the leaderboard." };
  }

  // Score = number of green squares in emojiScore (correct answers, 0-5)
  const score = (entry.emojiScore?.match(/🟩/g) || []).length;

  const { error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_date: dateStr,
      score: score,
      points: entry.points || 0,
      display_name_used: entry.name,
      time_taken_seconds: Math.round(entry.avgTime || 0),
      answer_data: {
        points: entry.points,
        emojiScore: entry.emojiScore,
        dailyStreak: entry.dailyStreak,
        avgTime: entry.avgTime,
        picks: entry.picks,
      },
    });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already submitted today." };
    }
    console.error("Submit failed:", error);
    return { error: "Could not submit. Try again." };
  }

  // Update server-side streaks (non-blocking, best-effort)
  supabase.rpc("update_streaks_on_submit", { did_perfect: score === 5, p_user_id: user.id }).catch(() => {});

  // Check and award achievements (best-effort, non-blocking)
  checkAndAwardAchievements(user.id, score, entry.picks, true, dateStr).catch(() => {});

  return { success: true };
}

// Call on page load for signed-in users to retroactively award earned badges
export async function checkAchievementsNow() {
  const user = await getCurrentUser();
  if (!user) return;
  checkAndAwardAchievements(user.id, null, null).catch(() => {});
}

// Call immediately when a quiz finishes so time-sensitive achievements like
// Gunslinger are checked even if the user never submits to the leaderboard.
export async function checkAchievementsForScore(score, picks) {
  const user = await getCurrentUser();
  if (!user) return;
  // Pass false — the attempt isn't in quiz_attempts yet at quiz completion
  checkAndAwardAchievements(user.id, score, picks, false, getRunDateISO()).catch(() => {});
}

async function checkAndAwardAchievements(userId, score, picks, attemptAlreadyInDb = true, dateStr = null) {
  const [profileRes, attemptsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("current_streak, current_td_streak, total_touchdowns, achievements")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("quiz_attempts")
      .select("score, quiz_date, points, submitted_at")
      .eq("user_id", userId),
  ]);

  const { data: profile } = profileRes;
  const { data: attempts } = attemptsRes;
  if (!profile || !attempts) return;

  const currentStreak = profile.current_streak ?? 0;
  const tdStreak = profile.current_td_streak ?? 0;
  const picksArr = picks || [];
  const avgTime = picksArr.length > 0 ? picksArr.reduce((s, p) => s + (p.elapsed ?? 0), 0) / picksArr.length : 15;
  const hasGunslinger = score === 5 && picksArr.every(p => (p.elapsed ?? Infinity) < 2.4);
  const hasTwoMinuteDrill = score === 5 && avgTime < 4;
  const hasPickSix = score === 0 || attempts.some(a => a.score === 0);

  // When called at quiz completion the attempt isn't inserted yet — adjust counts by 1
  const pendingOffset = (!attemptAlreadyInDb && score !== null) ? 1 : 0;
  const totalQuizzes = Math.max(attempts.length + pendingOffset, currentStreak);

  // Use DB ground truth for perfect count; add current attempt if not yet in DB
  const dbPerfect = attempts.filter(a => a.score === 5).length + (pendingOffset && score === 5 ? 1 : 0);
  const storedTDs = profile.total_touchdowns ?? 0;
  const newTDCount = Math.max(storedTDs, dbPerfect);

  // --- Date helpers (local-time safe: avoids UTC midnight issues) ---
  function localParts(s) { return s.split('-').map(Number); }
  function localDate(s) { const [y, m, d] = localParts(s); return new Date(y, m - 1, d); }
  function daysDiff(s1, s2) { return Math.round((localDate(s2) - localDate(s1)) / 86400000); }
  function prevDay(s) {
    const dt = localDate(s);
    dt.setDate(dt.getDate() - 1);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }
  function weekStart(s) {
    const dt = localDate(s);
    const sun = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - dt.getDay());
    return `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;
  }
  function fmtDate(dt) {
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  // --- Comeback Player of the Year ---
  // Score 5/5 the day after scoring 2 or less
  const scoreByDate = {};
  for (const a of attempts) scoreByDate[a.quiz_date] = a.score;

  let hasComeback = false;
  const sortedAttemptDates = Object.keys(scoreByDate).sort();
  for (let i = 1; i < sortedAttemptDates.length; i++) {
    const prev = sortedAttemptDates[i - 1], curr = sortedAttemptDates[i];
    if (daysDiff(prev, curr) === 1 && scoreByDate[curr] === 5 && scoreByDate[prev] <= 2) {
      hasComeback = true;
      break;
    }
  }
  if (!hasComeback && pendingOffset && score === 5 && dateStr) {
    const prev = prevDay(dateStr);
    if (scoreByDate[prev] !== undefined && scoreByDate[prev] <= 2) hasComeback = true;
  }

  // --- Unbreakable ---
  // Rebuild a 3+ day streak after breaking one of 10+ days
  const allUserDates = [...new Set(attempts.map(a => a.quiz_date))].sort();
  if (pendingOffset && dateStr && !allUserDates.includes(dateStr)) {
    allUserDates.push(dateStr);
    allUserDates.sort();
  }
  const streakRuns = [];
  if (allUserDates.length > 0) {
    let run = 1;
    for (let i = 1; i < allUserDates.length; i++) {
      if (daysDiff(allUserDates[i - 1], allUserDates[i]) === 1) {
        run++;
      } else {
        streakRuns.push(run);
        run = 1;
      }
    }
    streakRuns.push(run);
  }
  const hasUnbreakable = streakRuns.length >= 2 &&
    streakRuns.slice(0, -1).some(r => r >= 10) &&
    streakRuns[streakRuns.length - 1] >= 3;

  // --- Leaderboard-based achievements ---
  // Daily Bread, Brady Mode, Bridesmaid, Weekly Warrior, Dynasty Talks
  // Fetch all attempts on dates in weeks the user has played (for daily + weekly rankings)
  const userDates = [...new Set(attempts.map(a => a.quiz_date))];
  let dailyWins = 0, dailyTop3NotFirst = 0, weeklyWins = 0;

  if (userDates.length > 0) {
    // Expand each user play date to its full Sun-Sat week so weekly totals are accurate
    const allRelevantDatesSet = new Set();
    for (const d of userDates) {
      const dt = localDate(d);
      const dow = dt.getDay();
      for (let offset = -dow; offset < 7 - dow; offset++) {
        const wd = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + offset);
        allRelevantDatesSet.add(fmtDate(wd));
      }
    }

    const { data: leaderboardData } = await supabase
      .from("quiz_attempts")
      .select("quiz_date, user_id, points, submitted_at")
      .in("quiz_date", [...allRelevantDatesSet])
      .limit(5000);

    if (leaderboardData) {
      // Group by date for daily rankings
      const byDate = {};
      for (const a of leaderboardData) {
        if (!byDate[a.quiz_date]) byDate[a.quiz_date] = [];
        byDate[a.quiz_date].push(a);
      }
      for (const date of userDates) {
        const entries = (byDate[date] || []).sort((a, b) =>
          b.points !== a.points ? b.points - a.points : new Date(a.submitted_at) - new Date(b.submitted_at)
        );
        const rank = entries.findIndex(e => e.user_id === userId) + 1;
        if (rank === 1) dailyWins++;
        else if (rank === 2 || rank === 3) dailyTop3NotFirst++;
      }

      // Aggregate weekly totals per user across all relevant dates
      const weekTotals = {}; // weekStart -> { userId -> totalPoints }
      for (const a of leaderboardData) {
        const wk = weekStart(a.quiz_date);
        if (!weekTotals[wk]) weekTotals[wk] = {};
        weekTotals[wk][a.user_id] = (weekTotals[wk][a.user_id] || 0) + (a.points || 0);
      }
      const userWeeks = new Set(userDates.map(weekStart));
      for (const wk of userWeeks) {
        const totals = weekTotals[wk] || {};
        const userPts = totals[userId] || 0;
        const maxPts = Math.max(...Object.values(totals), 0);
        if (userPts > 0 && userPts >= maxPts) weeklyWins++;
      }
    }
  }

  const profileUpdates = { achievements: null };
  if (newTDCount !== storedTDs) profileUpdates.total_touchdowns = newTDCount;

  const stats = {
    totalQuizzes,
    totalPerfect: newTDCount,
    currentStreak,
    tdStreak,
    hasGunslinger,
    hasTwoMinuteDrill,
    hasPickSix,
    hasComeback,
    hasUnbreakable,
    dailyWins,
    dailyTop3NotFirst,
    weeklyWins,
  };

  const existing = profile.achievements || [];
  const newBadges = computeNewAchievements(stats, existing);
  profileUpdates.achievements = newBadges.length > 0 ? [...existing, ...newBadges] : null;

  const update = Object.fromEntries(
    Object.entries(profileUpdates).filter(([, v]) => v !== null)
  );
  if (Object.keys(update).length > 0) {
    await supabase.from("profiles").update(update).eq("id", userId);
  }
}

// Automatically record a logged-in user's attempt the moment they finish,
// without requiring them to fill out the leaderboard form.
// Uses their profile username as the display name.
// Silently ignores duplicates (manual submit already beat us).
export async function autoRecordAttempt(dateStr, entry) {
  const user = await getCurrentUser();
  if (!user) return { wasNew: false, displayName: "" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.username || "Player";
  const score = (entry.emojiScore?.match(/🟩/g) || []).length;

  const { error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_date: dateStr,
      score,
      points: entry.points || 0,
      display_name_used: displayName,
      time_taken_seconds: Math.round(entry.avgTime || 0),
      answer_data: {
        points:      entry.points,
        emojiScore:  entry.emojiScore,
        dailyStreak: entry.dailyStreak,
        avgTime:     entry.avgTime,
        picks:       entry.picks,
      },
    });

  if (error?.code === "23505") {
    // Duplicate — manual submit already recorded today, nothing to do
    return { wasNew: false, displayName };
  }
  if (error) {
    console.warn("autoRecordAttempt failed:", error);
    return { wasNew: false, displayName };
  }

  // Fresh insert — update streaks and awards non-blocking
  supabase.rpc("update_streaks_on_submit", { did_perfect: score === 5, p_user_id: user.id }).catch(() => {});
  checkAndAwardAchievements(user.id, score, entry.picks, true, dateStr).catch(() => {});

  return { wasNew: true, displayName };
}

// Fetch weekly leaderboard — sums points Sun–Sat PT per logged-in player
export async function fetchWeeklyLeaderboard() {
  const { data, error } = await supabase.rpc('get_weekly_leaderboard');
  if (error) {
    console.error('fetchWeeklyLeaderboard error:', error);
    return [];
  }
  return data ?? [];
}

// Fetch top 100 entries for a date, ordered by points (then earliest submission)
export async function fetchLeaderboard(dateStr) {
  if (!dateStr) {
    console.warn("fetchLeaderboard called without a date");
    return [];
  }

  const dateISO = (() => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toISOString();
  })();

  const [playerRes, manualRes] = await Promise.all([
    supabase
      .from("quiz_attempts")
      .select("display_name_used, score, points, time_taken_seconds, submitted_at, answer_data, user_id, profiles!inner(username, twitter_handle)")
      .eq("quiz_date", dateStr)
      .order("submitted_at", { ascending: true })
      .limit(500),
    supabase
      .from("leaderboard_daily")
      .select("display_name, score, points, avg_time_seconds, emoji_score, daily_streak, created_at")
      .eq("quiz_date", dateStr)
      .order("created_at", { ascending: true }),
  ]);

  if (playerRes.error) {
    console.error("Fetch failed:", playerRes.error);
    return [];
  }

  const playerEntries = (playerRes.data || []).map(a => ({
    name: a.display_name_used,
    username: a.profiles?.username || null,
    twitterHandle: a.profiles?.twitter_handle || null,
    points: a.points ?? a.answer_data?.points ?? 0,
    avgTime: a.answer_data?.avgTime ?? a.time_taken_seconds ?? 0,
    emojiScore: a.answer_data?.emojiScore || "",
    dailyStreak: a.answer_data?.dailyStreak || 0,
    createdAt: new Date(a.submitted_at).getTime(),
    date: dateISO,
  }));

  const manualEntries = (manualRes.data || []).map(m => ({
    name: m.display_name || "Anonymous",
    username: null,
    points: m.points ?? 0,
    avgTime: m.avg_time_seconds ?? 0,
    emojiScore: m.emoji_score || "",
    dailyStreak: m.daily_streak ?? 0,
    createdAt: new Date(m.created_at).getTime(),
    date: dateISO,
  }));

  const entries = [...playerEntries, ...manualEntries];

  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.createdAt - b.createdAt;
  });

  return entries.slice(0, 100);
}

// Streak + profile cache
let _cachedDailyStreak = null;
let _cachedTDStreak = null;
let _cachedFavoriteTeam = null;

export async function refreshStreakCache() {
  const user = await getCurrentUser();
  if (!user) {
    _cachedDailyStreak = null;
    _cachedTDStreak = null;
    _cachedFavoriteTeam = null;
    return;
  }
  const { data } = await supabase
    .from("profiles")
    .select("current_streak, current_td_streak, favorite_team")
    .eq("id", user.id)
    .maybeSingle();
  _cachedDailyStreak = data?.current_streak ?? 0;
  _cachedTDStreak = data?.current_td_streak ?? 0;
  _cachedFavoriteTeam = data?.favorite_team ?? null;
}

export function getCachedFavoriteTeam() {
  return _cachedFavoriteTeam;
}

export function getCachedDailyStreak() {
  const local = parseInt(localStorage.getItem("dailyStreak") || "0", 10);
  if (_cachedDailyStreak !== null) return Math.max(_cachedDailyStreak, local);
  return local;
}

export function getCachedTDStreak() {
  const local = parseInt(localStorage.getItem("tdStreak") || "0", 10);
  if (_cachedTDStreak !== null) return Math.max(_cachedTDStreak, local);
  return local;
}

// Call immediately after local streak is computed so the cache doesn't serve
// a stale DB value (e.g. after a streak break) before the RPC finishes.
export function overrideCachedStreaks({ daily, td } = {}) {
  if (daily !== undefined) _cachedDailyStreak = daily;
  if (td !== undefined) _cachedTDStreak = td;
}

export async function hasPlayedToday(dateStr) {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await supabase
    .from("quiz_attempts")
    .select("id, answer_data, display_name_used, score, submitted_at")
    .eq("user_id", user.id)
    .eq("quiz_date", dateStr)
    .maybeSingle();
  return data || false;
}

/**
 * Fetch public profile stats for a given username (used by player card modal).
 * @param {string} username
 * @returns {Promise<{totalQuizzes:number, accuracyPct:number, totalPerfect:number,
 *   memberSince:string, favoriteTeam:string|null, achievements:string[]}|null>}
 */
export async function fetchPlayerStats(username) {
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, created_at, favorite_team, achievements, current_streak, current_td_streak, total_touchdowns, twitter_handle")
    .eq("username", username)
    .maybeSingle();

  if (profileErr || !profile) return null;

  const { data: attempts, error: attemptsErr } = await supabase
    .from("quiz_attempts")
    .select("score")
    .eq("user_id", profile.id);

  if (attemptsErr) return null;

  const currentStreak = profile.current_streak ?? 0;
  const totalQuizzes = Math.max(attempts.length, currentStreak);
  const totalPerfect = profile.total_touchdowns ?? 0;

  const totalCorrect = attempts.reduce((sum, a) => sum + (a.score ?? 0), 0);
  const totalPossible = attempts.length * 5;
  const accuracyPct = totalPossible > 0
    ? Math.round((totalCorrect / totalPossible) * 100)
    : 0;

  return {
    totalQuizzes,
    accuracyPct,
    totalPerfect,
    currentStreak,
    memberSince: profile.created_at,
    favoriteTeam: profile.favorite_team || null,
    achievements: profile.achievements || [],
    twitterHandle: profile.twitter_handle || null,
  };
}

// Check if signed-in user has already played today; returns the attempt data or null
export async function getTodaysAttempt(dateStr) {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("score, display_name_used, time_taken_seconds, submitted_at, answer_data")
    .eq("user_id", user.id)
    .eq("quiz_date", dateStr)
    .maybeSingle();
  
  if (error || !data) return null;
  
  // Reshape into the format main.js's renderPersistedResult() expects
return {
  score: data.score,
  picks: data.answer_data?.picks || [],
  totalPoints: data.answer_data?.points || 0,
  avgTime: data.answer_data?.avgTime ?? data.time_taken_seconds ?? 0,
  totalTime: (data.answer_data?.avgTime ?? data.time_taken_seconds ?? 0) * 5,
  emojiScore: data.answer_data?.emojiScore || null,  // <-- NEW
};
}