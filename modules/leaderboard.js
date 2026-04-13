// modules/leaderboard.js
import { supabase, getCurrentUser } from "./supabase-client.js";

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
      },
    });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already submitted today." };
    }
    console.error("Submit failed:", error);
    return { error: "Could not submit. Try again." };
  }

  // Update server-side streaks
  const didPerfect = score === 5;
  const { error: streakError } = await supabase.rpc("update_streaks_on_submit", {
    did_perfect: didPerfect,
  });
  if (streakError) {
    console.warn("Streak update failed (non-fatal):", streakError);
  }

  return { success: true };
}

// Fetch top 100 entries for a date, ordered by points (then earliest submission)
export async function fetchLeaderboard(dateStr) {
  if (!dateStr) {
    console.warn("fetchLeaderboard called without a date");
    return [];
  }

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("display_name_used, score, time_taken_seconds, submitted_at, answer_data, user_id, profiles!inner(username)")
    .eq("quiz_date", dateStr)
    .order("submitted_at", { ascending: true })
    .limit(500);

  if (error) {
    console.error("Fetch failed:", error);
    return [];
  }

  const entries = (data || []).map(a => ({
    name: a.display_name_used,
    username: a.profiles?.username || null,
    points: a.answer_data?.points || 0,
    avgTime: a.answer_data?.avgTime ?? a.time_taken_seconds ?? 0,
    emojiScore: a.answer_data?.emojiScore || "",
    dailyStreak: a.answer_data?.dailyStreak || 0,
    createdAt: new Date(a.submitted_at).getTime(),
    date: (() => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toISOString();
    })(),
  }));

  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.createdAt - b.createdAt;
  });

  return entries.slice(0, 100);
}

// Streak cache
let _cachedDailyStreak = null;
let _cachedTDStreak = null;

export async function refreshStreakCache() {
  const user = await getCurrentUser();
  if (!user) {
    _cachedDailyStreak = parseInt(localStorage.getItem("dailyStreak") || "0", 10);
    _cachedTDStreak = parseInt(localStorage.getItem("tdStreak") || "0", 10);
    return;
  }
  const { data } = await supabase
    .from("profiles")
    .select("current_streak, current_td_streak")
    .eq("id", user.id)
    .maybeSingle();
  _cachedDailyStreak = data?.current_streak ?? 0;
  _cachedTDStreak = data?.current_td_streak ?? 0;
}

export function getCachedDailyStreak() {
  if (_cachedDailyStreak !== null) return _cachedDailyStreak;
  return parseInt(localStorage.getItem("dailyStreak") || "0", 10);
}

export function getCachedTDStreak() {
  if (_cachedTDStreak !== null) return _cachedTDStreak;
  return parseInt(localStorage.getItem("tdStreak") || "0", 10);
}