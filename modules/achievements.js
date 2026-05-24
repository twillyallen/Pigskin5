export const ACHIEVEMENT_CATEGORIES = [
  { id: "quiz",        label: "Quiz" },
  { id: "streak",      label: "Streaks" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "rivalry",     label: "Rivalries" },
];

export const ACHIEVEMENTS = [
  // ── Quiz ──
  {
    id: "first_blood",
    category: "quiz",
    emoji: "🏈",
    name: "First Down",
    desc: "Complete your first quiz",
    check: ({ totalQuizzes }) => totalQuizzes >= 1,
  },
  {
    id: "touchdown",
    category: "quiz",
    emoji: "🟩",
    name: "Touchdown",
    desc: "Score your first 5/5",
    check: ({ totalPerfect }) => totalPerfect >= 1,
  },
  {
    id: "grinder",
    category: "quiz",
    emoji: "📅",
    name: "Grinder",
    desc: "Play 30 quizzes",
    check: ({ totalQuizzes }) => totalQuizzes >= 30,
  },
  {
    id: "century",
    category: "quiz",
    emoji: "💯",
    name: "Century",
    desc: "Play 100 quizzes",
    check: ({ totalQuizzes }) => totalQuizzes >= 100,
  },
  {
    id: "field_general",
    category: "quiz",
    emoji: "🫡",
    name: "Field General",
    desc: "Score 5/5 ten times",
    check: ({ totalPerfect }) => totalPerfect >= 10,
  },
  {
    id: "franchise_qb",
    category: "quiz",
    emoji: "🎖️",
    name: "Franchise QB",
    desc: "Score 5/5 twenty-five times",
    check: ({ totalPerfect }) => totalPerfect >= 25,
  },
  {
    id: "pick_six",
    category: "quiz",
    emoji: "😬",
    name: "Pick Six",
    desc: "Score 0/5",
    check: ({ hasPickSix }) => !!hasPickSix,
  },
  {
    id: "gunslinger",
    category: "quiz",
    emoji: "🔫",
    name: "Gunslinger",
    desc: "Answer all 5 correctly in under 2 seconds each",
    check: ({ hasGunslinger }) => !!hasGunslinger,
  },

  // ── Streaks ──
  {
    id: "on_fire",
    category: "streak",
    emoji: "🔥",
    name: "On Fire",
    desc: "Reach a 7-day streak",
    check: ({ currentStreak }) => currentStreak >= 7,
  },
  {
    id: "triple_crown",
    category: "streak",
    emoji: "👑",
    name: "Triple Crown",
    desc: "Score 5/5 three days in a row",
    check: ({ tdStreak }) => tdStreak >= 3,
  },
  {
    id: "perfect_season",
    category: "streak",
    emoji: "🌟",
    name: "Perfect Season",
    desc: "Score 5/5 seven days in a row",
    check: ({ tdStreak }) => tdStreak >= 7,
  },
  {
    id: "iron_man",
    category: "streak",
    emoji: "🦾",
    name: "Iron Man",
    desc: "Reach a 30-day streak",
    check: ({ currentStreak }) => currentStreak >= 30,
  },
  {
    id: "comeback_player",
    category: "streak",
    emoji: "📈",
    name: "Comeback Player of the Year",
    desc: "Score 5/5 the day after scoring 2 or less",
    check: ({ hasComeback }) => !!hasComeback,
  },
  {
    id: "unbreakable",
    category: "streak",
    emoji: "💪",
    name: "Unbreakable",
    desc: "Rebuild a 3+ day streak after breaking one of 10+ days",
    check: ({ hasUnbreakable }) => !!hasUnbreakable,
  },

  // ── Leaderboard ──
  {
    id: "daily_bread",
    category: "leaderboard",
    emoji: "🥇",
    name: "Daily Bread",
    desc: "Win a daily leaderboard for the first time",
    check: ({ dailyWins }) => dailyWins >= 1,
  },
  {
    id: "brady_mode",
    category: "leaderboard",
    emoji: "🐐",
    name: "Brady Mode",
    desc: "Win 7 daily leaderboards",
    check: ({ dailyWins }) => dailyWins >= 7,
  },
  {
    id: "bridesmaid",
    category: "leaderboard",
    emoji: "💍",
    name: "Always the Bridesmaid...",
    desc: "Finish 2nd or 3rd on a daily leaderboard 5 different times",
    check: ({ dailyTop3NotFirst }) => dailyTop3NotFirst >= 5,
  },
  {
    id: "weekly_warrior",
    category: "leaderboard",
    emoji: "🏆",
    name: "Weekly Warrior",
    desc: "Win a weekly leaderboard",
    check: ({ weeklyWins }) => weeklyWins >= 1,
  },
  {
    id: "dynasty_talks",
    category: "leaderboard",
    emoji: "🏛️",
    name: "Dynasty Talks",
    desc: "Win the weekly leaderboard 3 times",
    check: ({ weeklyWins }) => weeklyWins >= 3,
  },

  // ── Rivalries ──
  {
    id: "i_got_opps",
    category: "rivalry",
    emoji: "🗡️",
    name: "I Got Opps",
    desc: "Win your first rivalry series",
    check: ({ rivalriesWon }) => (rivalriesWon || 0) >= 1,
  },
  {
    id: "body_count",
    category: "rivalry",
    emoji: "💀",
    name: "Body Count",
    desc: "Win 5 rivalry series",
    check: ({ rivalriesWon }) => (rivalriesWon || 0) >= 5,
  },
  {
    id: "untouchable",
    category: "rivalry",
    emoji: "🛡️",
    name: "Untouchable",
    desc: "Win 10 rivalry series",
    check: ({ rivalriesWon }) => (rivalriesWon || 0) >= 10,
  },
  {
    id: "game_7_built_diffy",
    category: "rivalry",
    emoji: "7️⃣",
    name: "Game 7 Built Diffy",
    desc: "Win a rivalry series in Game 7 (4-3 final)",
    check: ({ hasGame7Win }) => !!hasGame7Win,
  },
  {
    id: "lebroning",
    category: "rivalry",
    emoji: "👑",
    name: "LeBroning",
    desc: "Win a rivalry series after being down 1-3",
    check: ({ hasLeBroning }) => !!hasLeBroning,
  },
  {
    id: "want_the_smoke",
    category: "rivalry",
    emoji: "💨",
    name: "Want the Smoke",
    desc: "Challenge 10 friends to rivalries",
    check: ({ rivalriesChallenged }) => (rivalriesChallenged || 0) >= 10,
  },
  {
    id: "sweep",
    category: "rivalry",
    emoji: "🧹",
    name: "Sweep",
    desc: "Win a rivalry series 4-0 without any forfeits",
    check: ({ hasSweep }) => !!hasSweep,
  },
];

/**
 * Returns IDs of achievements newly earned that weren't already in alreadyEarned.
 * Rivalry stats: rivalriesWon, rivalriesChallenged, hasGame7Win, hasLeBroning, hasSweep
 */
export function computeNewAchievements(stats, alreadyEarned = []) {
  const earned = new Set(alreadyEarned);
  return ACHIEVEMENTS
    .filter(a => !earned.has(a.id) && a.check(stats))
    .map(a => a.id);
}
