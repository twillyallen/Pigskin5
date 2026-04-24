// modules/leaderboard.js
import { supabase, getCurrentUser } from "./supabase-client.js";
import { computeNewAchievements } from "./achievements.js";

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
      display_name_used: entry.name,
      time_taken_seconds: Math.round(entry.avgTime || 0),
      answer_data: {
        points: entry.points,
        emojiScore: entry.emojiScore,
        dailyStreak: entry.dailyStreak,
        avgTime: entry.avgTime,
        picks: entry.picks,  // <-- NEW
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
  supabase.rpc("update_streaks_on_submit", { did_perfect: score === 5 }).catch(() => {});

  // Check and award achievements (best-effort, non-blocking)
  checkAndAwardAchievements(user.id, score, entry.picks).catch(() => {});

  return { success: true };
}

// Call on page load for signed-in users to retroactively award earned badges
export async function checkAchievementsNow() {
  const user = await getCurrentUser();
  if (!user) return;
  checkAndAwardAchievements(user.id, null, null).catch(() => {});
}

async function checkAndAwardAchievements(userId, score, picks) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, current_td_streak, total_touchdowns, achievements")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return;

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("score")
    .eq("user_id", userId);
  if (!attempts) return;

  const currentStreak = profile.current_streak ?? 0;
  const tdStreak = profile.current_td_streak ?? 0;
  const totalQuizzes = Math.max(attempts.length, currentStreak);
  const picksArr = picks || [];
  const avgTime = picksArr.length > 0 ? picksArr.reduce((s, p) => s + (p.elapsed ?? 0), 0) / picksArr.length : 15;
  const hasGunslinger = score === 5 && picksArr.every(p => (p.elapsed ?? Infinity) < 1.2);
  const hasTwoMinuteDrill = score === 5 && avgTime < 4;
  const hasPickSix = score === 0 || attempts.some(a => a.score === 0);

  // Use DB ground truth for perfect count — dbPerfect already includes any newly inserted attempt
  const dbPerfect = attempts.filter(a => a.score === 5).length;
  const storedTDs = profile.total_touchdowns ?? 0;
  const newTDCount = Math.max(storedTDs, dbPerfect);

  const profileUpdates = { achievements: null }; // filled below
  if (newTDCount !== storedTDs) profileUpdates.total_touchdowns = newTDCount;

  const stats = {
    totalQuizzes,
    totalPerfect: newTDCount,
    currentStreak,
    tdStreak,
    hasGunslinger,
    hasTwoMinuteDrill,
    hasPickSix,
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
  supabase.rpc("update_streaks_on_submit", { did_perfect: score === 5 }).catch(() => {});
  checkAndAwardAchievements(user.id, score, entry.picks).catch(() => {});

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
      .select("display_name_used, score, time_taken_seconds, submitted_at, answer_data, user_id, profiles!inner(username)")
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
    points: a.answer_data?.points || 0,
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
    .select("id, created_at, favorite_team, achievements, current_streak, current_td_streak, total_touchdowns")
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