// modules/rivalry.js
// Core data layer for the Rivalry feature.
// All Supabase calls live here; UI lives in rivalry-ui.js.

import { supabase, getCurrentUser } from "./supabase-client.js";
import { RIVALRY_QUESTIONS } from "../rivalry-questions.js";
import { computeNewAchievements } from "./achievements.js";

const MAX_ACTIVE_RIVALRIES = 5;

// Returns "YYYY-MM-DD" in local time (matches getRunDateISO in date-utils.js).
// Using local date avoids a bug where evening plays (after midnight UTC) get
// stored as the next UTC day, blocking the player from playing "tomorrow."
export function getTodayUTC() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Next midnight UTC as an ISO timestamp (= challenge expiry)
export function nextMidnightUTC() {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

// ── Challenge / invitation ────────────────────────────────

export async function createRivalryChallenge() {
  const user = await getCurrentUser();
  if (!user) return { error: "sign_in_required" };

  // Count active rivalries + pending outgoing invites together so a user
  // can't bypass the cap by creating many links before anyone accepts.
  const now = new Date().toISOString();
  const [{ count: activeCount }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("rivalries")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`),
    supabase
      .from("rivalry_challenges")
      .select("*", { count: "exact", head: true })
      .eq("challenger_id", user.id)
      .eq("status", "pending")
      .gt("expires_at", now),
  ]);

  if ((activeCount + pendingCount) >= MAX_ACTIVE_RIVALRIES) return { error: "slots_full" };

  const { data, error } = await supabase
    .from("rivalry_challenges")
    .insert({
      challenger_id: user.id,
      expires_at: nextMidnightUTC(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { challengeId: data.id };
}

export async function getRivalryChallenge(challengeId) {
  const { data, error } = await supabase
    .from("rivalry_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (error) return { error: error.message };

  // Fetch challenger profile separately (no direct FK to profiles in schema)
  if (data?.challenger_id) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.challenger_id)
      .maybeSingle();
    if (profileErr) console.error("getRivalryChallenge profile fetch:", profileErr);
    console.log("challenger profile:", profile, "for id:", data.challenger_id);
    data.challenger = profile || null;
  }

  return { challenge: data };
}

export async function acceptChallenge(challengeId) {
  const user = await getCurrentUser();
  if (!user) return { error: "sign_in_required" };

  const { data, error } = await supabase.rpc("accept_rivalry_challenge", {
    p_challenge_id: challengeId,
    p_acceptor_id:  user.id,
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("challenge_not_found"))   return { error: "challenge_not_found" };
    if (msg.includes("challenge_not_pending")) return { error: "challenge_not_pending" };
    if (msg.includes("challenge_expired"))     return { error: "challenge_expired" };
    if (msg.includes("self_challenge"))        return { error: "self_challenge" };
    if (msg.includes("slots_full"))            return { error: "slots_full" };
    if (msg.includes("challenger_slots_full")) return { error: "challenger_slots_full" };
    return { error: error.message };
  }

  return { rivalryId: data };
}

export async function declineChallenge(challengeId) {
  const user = await getCurrentUser();
  if (!user) return { error: "sign_in_required" };

  const { error } = await supabase
    .from("rivalry_challenges")
    .update({ status: "declined" })
    .eq("id", challengeId)
    .eq("status", "pending");

  if (error) return { error: error.message };
  return { success: true };
}

// ── Active Rivalries ──────────────────────────────────────

export async function getUserRivalries(userId) {
  const uid = userId || (await getCurrentUser())?.id;
  if (!uid) return { rivalries: [] };

  const { data, error } = await supabase
    .from("rivalries")
    .select(`*, games:rivalry_games(game_date, player1_score, player2_score, day_winner, player1_played_at, player2_played_at)`)
    .or(`player1_id.eq.${uid},player2_id.eq.${uid}`)
    .order("started_at", { ascending: false });

  if (error) return { error: error.message, rivalries: [] };

  await attachProfiles(data || []);
  return { rivalries: data || [] };
}

export async function getRivalry(rivalryId) {
  const { data, error } = await supabase
    .from("rivalries")
    .select(`*, games:rivalry_games(game_date, player1_score, player2_score, player1_time_secs, player2_time_secs, day_winner, player1_played_at, player2_played_at, player1_picks, player2_picks)`)
    .eq("id", rivalryId)
    .single();

  if (error) return { error: error.message };

  await attachProfiles([data]);
  return { rivalry: data };
}

// Fetch profiles for both players and attach as p1/p2 on each rivalry row
async function attachProfiles(rivalries) {
  if (!rivalries?.length) return;
  const ids = [...new Set(rivalries.flatMap(r => [r.player1_id, r.player2_id]).filter(Boolean))];
  if (!ids.length) return;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", ids);

  const map = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  for (const r of rivalries) {
    r.p1 = map[r.player1_id] || null;
    r.p2 = map[r.player2_id] || null;
  }
}

export async function getRivalryAlltime(player1Id, player2Id) {
  const [a, b] = [player1Id, player2Id].sort();
  const { data } = await supabase
    .from("rivalry_alltime")
    .select("*")
    .eq("player_a_id", a)
    .eq("player_b_id", b)
    .maybeSingle();

  return data || { player_a_id: a, player_b_id: b, a_series_won: 0, b_series_won: 0, total_series: 0 };
}

// ── Question Selection ────────────────────────────────────

export async function getTodayRivalryQuestions(rivalryId) {
  const today = getTodayUTC();

  // Already assigned today → return immediately
  const { data: existing } = await supabase
    .from("rivalry_daily_questions")
    .select("question_indices")
    .eq("rivalry_id", rivalryId)
    .eq("question_date", today)
    .maybeSingle();

  if (existing) return existing.question_indices.map(i => RIVALRY_QUESTIONS[i]);

  const [{ rivalry }, uid] = await Promise.all([
    getRivalry(rivalryId),
    getCurrentUser().then(u => u?.id),
  ]);
  if (!rivalry) return null;

  const otherPlayer = rivalry.player1_id === uid ? rivalry.player2_id : rivalry.player1_id;

  // Run both history queries in parallel
  const [{ data: rivalryHistory }, { data: todayRows }] = await Promise.all([
    // Every question this rivalry has ever used (all past days) — never repeat within a rivalry
    supabase
      .from("rivalry_daily_questions")
      .select("question_indices")
      .eq("rivalry_id", rivalryId),
    // Questions used TODAY in other rivalries involving either player — no same-day overlap
    supabase
      .from("rivalry_daily_questions")
      .select("question_indices, rivalry:rivalry_id(player1_id, player2_id)")
      .eq("question_date", today)
      .neq("rivalry_id", rivalryId),
  ]);

  const usedByThisRivalry = new Set();
  for (const row of rivalryHistory || []) {
    for (const i of row.question_indices) usedByThisRivalry.add(i);
  }

  const usedTodayByEitherPlayer = new Set();
  for (const row of todayRows || []) {
    const r = row.rivalry;
    if (r && (r.player1_id === uid || r.player2_id === uid ||
              r.player1_id === otherPlayer || r.player2_id === otherPlayer)) {
      for (const i of row.question_indices) usedTodayByEitherPlayer.add(i);
    }
  }

  const allIndices = Array.from({ length: RIVALRY_QUESTIONS.length }, (_, i) => i);

  // Primary pool: exclude all questions this rivalry has used + today's cross-rivalry overlap
  let pool = allIndices.filter(i => !usedByThisRivalry.has(i) && !usedTodayByEitherPlayer.has(i));

  if (pool.length < 5) {
    // Fallback 1: drop the cross-rivalry constraint, keep within-rivalry uniqueness
    pool = allIndices.filter(i => !usedByThisRivalry.has(i));
  }

  if (pool.length < 5) {
    // Fallback 2: question pool exhausted for this rivalry — allow any question
    pool = [...allIndices];
  }

  shuffle(pool);
  const chosen = pool.slice(0, 5);

  const { error } = await supabase
    .from("rivalry_daily_questions")
    .insert({ rivalry_id: rivalryId, question_date: today, question_indices: chosen })
    .select()
    .single();

  if (error?.code === "23505") {
    // Race condition: other player wrote first — re-fetch their assignment
    const { data: raced } = await supabase
      .from("rivalry_daily_questions")
      .select("question_indices")
      .eq("rivalry_id", rivalryId)
      .eq("question_date", today)
      .single();
    return raced.question_indices.map(i => RIVALRY_QUESTIONS[i]);
  }

  return chosen.map(i => RIVALRY_QUESTIONS[i]);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ── Score Submission ──────────────────────────────────────

export async function submitRivalryScore(rivalryId, { score, timeSecs, picks }) {
  const user = await getCurrentUser();
  if (!user) return { error: "sign_in_required" };
  const today = getTodayUTC();

  const { rivalry } = await getRivalry(rivalryId);
  if (!rivalry) return { error: "rivalry_not_found" };
  if (rivalry.status !== "active") return { error: "rivalry_not_active" };

  const isP1 = rivalry.player1_id === user.id;
  const isP2 = rivalry.player2_id === user.id;
  if (!isP1 && !isP2) return { error: "not_in_rivalry" };

  const scoreCol  = isP1 ? "player1_score" : "player2_score";
  const timeCol   = isP1 ? "player1_time_secs" : "player2_time_secs";
  const picksCol  = isP1 ? "player1_picks" : "player2_picks";
  const playedCol = isP1 ? "player1_played_at" : "player2_played_at";

  // Check not already played today
  const { data: existing } = await supabase
    .from("rivalry_games")
    .select(scoreCol)
    .eq("rivalry_id", rivalryId)
    .eq("game_date", today)
    .maybeSingle();

  if (existing?.[scoreCol] !== null && existing?.[scoreCol] !== undefined) {
    return { error: "already_played" };
  }

  // Upsert the game row
  const upsertData = {
    rivalry_id: rivalryId,
    game_date: today,
    [scoreCol]: score,
    [timeCol]: timeSecs,
    [picksCol]: picks,
    [playedCol]: new Date().toISOString(),
  };

  const { data: game, error: upsertErr } = await supabase
    .from("rivalry_games")
    .upsert(upsertData, { onConflict: "rivalry_id,game_date" })
    .select()
    .single();

  if (upsertErr) return { error: upsertErr.message };

  // If both players have now played and the day is not yet settled, settle it
  const otherScoreCol = isP1 ? "player2_score" : "player1_score";
  if (game[otherScoreCol] !== null && game[otherScoreCol] !== undefined && game.day_winner === null) {
    await supabase.rpc("settle_rivalry_day", {
      p_rivalry_id: rivalryId,
      p_for_date: today,
    });
  }

  return { success: true, game };
}

// ── Fetch questions for a specific date (no assignment) ───

export async function getRivalryQuestionsForDate(rivalryId, date) {
  const { data } = await supabase
    .from("rivalry_daily_questions")
    .select("question_indices")
    .eq("rivalry_id", rivalryId)
    .eq("question_date", date)
    .maybeSingle();

  if (!data) return [];
  return data.question_indices.map(i => RIVALRY_QUESTIONS[i]);
}

// ── Check if user has played today's rivalry quiz ─────────

export async function hasPlayedToday(rivalryId) {
  const user = await getCurrentUser();
  if (!user) return false;
  const today = getTodayUTC();

  const { rivalry } = await getRivalry(rivalryId);
  if (!rivalry) return false;

  const isP1 = rivalry.player1_id === user.id;
  const col = isP1 ? "player1_score" : "player2_score";

  const { data } = await supabase
    .from("rivalry_games")
    .select(col)
    .eq("rivalry_id", rivalryId)
    .eq("game_date", today)
    .maybeSingle();

  return data?.[col] !== null && data?.[col] !== undefined;
}

// ── Forfeit ───────────────────────────────────────────────

export async function forfeitRivalry(rivalryId) {
  const user = await getCurrentUser();
  if (!user) return { error: "sign_in_required" };

  const { error } = await supabase.rpc("forfeit_rivalry", {
    p_rivalry_id:   rivalryId,
    p_forfeiter_id: user.id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

// ── Helpers: derive UI-friendly shape from a rivalry row ──

export function getRivalryViewModel(rivalry, myUserId) {
  const iAm1 = rivalry.player1_id === myUserId;
  const me     = iAm1 ? rivalry.p1 : rivalry.p2;
  const them   = iAm1 ? rivalry.p2 : rivalry.p1;
  const myWins = iAm1 ? rivalry.player1_wins : rivalry.player2_wins;
  const theirWins = iAm1 ? rivalry.player2_wins : rivalry.player1_wins;

  const games = (rivalry.games || []).slice().sort((a, b) => a.game_date.localeCompare(b.game_date));
  const tracker = buildTracker(games, iAm1);

  const hasPlayedToday = games.some(g => {
    const today = getTodayUTC();
    if (g.game_date !== today) return false;
    return iAm1 ? g.player1_score !== null : g.player2_score !== null;
  });

  let statusText, statusClass;
  const isOver = rivalry.status === "complete" || rivalry.status === "forfeit";
  if (isOver) {
    const iWon = rivalry.winner_id === myUserId;
    statusText  = iWon ? "You won!" : "You lost";
    statusClass = iWon ? "winning" : "losing";
  } else if (myWins > theirWins)      { statusText = "You lead";  statusClass = "winning"; }
  else if (theirWins > myWins)         { statusText = "They lead"; statusClass = "losing"; }
  else                                  { statusText = "Tied";       statusClass = "tied"; }

  return {
    id: rivalry.id,
    status: rivalry.status,
    me,
    them,
    myWins,
    theirWins,
    tracker,
    statusText,
    statusClass,
    hasPlayedToday,
    iAm1,
  };
}

function buildTracker(games, iAm1) {
  const slots = Array(7).fill("upcoming");
  let gameIdx = 0;
  for (let i = 0; i < 7 && gameIdx < games.length; i++) {
    const g = games[gameIdx];
    if (g.day_winner === null || g.day_winner === undefined) {
      slots[i] = "upcoming";
    } else {
      const iWon = iAm1 ? g.day_winner === 1 : g.day_winner === 2;
      slots[i] = iWon ? "win" : "loss";
      gameIdx++;
    }
  }
  return slots;
}

export function trackerToEmoji(tracker) {
  return tracker.map(s => s === "win" ? "🟩" : s === "loss" ? "🟥" : "⬜").join("");
}

// ── Post-Series Side Effects ──────────────────────────────

export async function triggerRecapGeneration(rivalryId) {
  try {
    await supabase.functions.invoke("generate-rivalry-recap", {
      body: { rivalry_id: rivalryId },
    });
  } catch {}
}

export async function checkRivalryAchievements(userId, rivalry) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("achievements, rivalries_won, rivalries_challenged")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return;

  const iAm1 = rivalry.player1_id === userId;
  const myWins    = iAm1 ? rivalry.player1_wins : rivalry.player2_wins;
  const theirWins = iAm1 ? rivalry.player2_wins : rivalry.player1_wins;

  const hasGame7Win = rivalry.winner_id === userId && myWins === 4 && theirWins === 3;
  const hasSweep    = rivalry.winner_id === userId && myWins === 4 && theirWins === 0 && rivalry.status === "complete";

  // Detect LeBroning: won the series after trailing 1-3
  let hasLeBroning = false;
  if (rivalry.winner_id === userId && rivalry.games?.length) {
    const sorted = [...rivalry.games].sort((a, b) => a.game_date.localeCompare(b.game_date));
    let myW = 0, theirW = 0;
    for (const g of sorted) {
      if (g.day_winner === null || g.day_winner === undefined) continue;
      const iWon = (iAm1 && g.day_winner === 1) || (!iAm1 && g.day_winner === 2);
      if (iWon) myW++; else theirW++;
      if (myW === 1 && theirW === 3) { hasLeBroning = true; break; }
    }
  }

  const stats = {
    rivalriesWon:        profile.rivalries_won       || 0,
    rivalriesChallenged: profile.rivalries_challenged || 0,
    hasGame7Win,
    hasLeBroning,
    hasSweep,
  };

  const existing = profile.achievements || [];
  const newBadges = computeNewAchievements(stats, existing);
  if (newBadges.length > 0) {
    await supabase
      .from("profiles")
      .update({ achievements: [...existing, ...newBadges] })
      .eq("id", userId);
  }
}
