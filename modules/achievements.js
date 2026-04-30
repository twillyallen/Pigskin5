export const ACHIEVEMENTS = [
  {
    id: "first_blood",
    emoji: "🏈",
    name: "First Down",
    desc: "Complete your first quiz",
    check: ({ totalQuizzes }) => totalQuizzes >= 1,
  },
  {
    id: "touchdown",
    emoji: "🟩",
    name: "Touchdown",
    desc: "Score your first 5/5",
    check: ({ totalPerfect }) => totalPerfect >= 1,
  },
  {
    id: "on_fire",
    emoji: "🔥",
    name: "On Fire",
    desc: "Reach a 7-day streak",
    check: ({ currentStreak }) => currentStreak >= 7,
  },
  {
    id: "grinder",
    emoji: "📅",
    name: "Grinder",
    desc: "Play 30 quizzes",
    check: ({ totalQuizzes }) => totalQuizzes >= 30,
  },
  {
    id: "gunslinger",
    emoji: "🔫",
    name: "Gunslinger",
    desc: "Answer all 5 correctly in under 2 seconds each",
    check: ({ hasGunslinger }) => !!hasGunslinger,
  },
  {
    id: "triple_crown",
    emoji: "👑",
    name: "Triple Crown",
    desc: "Score 5/5 three days in a row",
    check: ({ tdStreak }) => tdStreak >= 3,
  },
  {
    id: "field_general",
    emoji: "🫡",
    name: "Field General",
    desc: "Score 5/5 ten times",
    check: ({ totalPerfect }) => totalPerfect >= 10,
  },
  {
    id: "century",
    emoji: "💯",
    name: "Century",
    desc: "Play 100 quizzes",
    check: ({ totalQuizzes }) => totalQuizzes >= 100,
  },
  {
    id: "perfect_season",
    emoji: "🌟",
    name: "Perfect Season",
    desc: "Score 5/5 seven days in a row",
    check: ({ tdStreak }) => tdStreak >= 7,
  },
  {
    id: "franchise_qb",
    emoji: "🎖️",
    name: "Franchise QB",
    desc: "Score 5/5 twenty-five times",
    check: ({ totalPerfect }) => totalPerfect >= 25,
  },
  {
    id: "pick_six",
    emoji: "😬",
    name: "Pick Six",
    desc: "Score 0/5",
    check: ({ hasPickSix }) => !!hasPickSix,
  },
  {
    id: "iron_man",
    emoji: "🦾",
    name: "Iron Man",
    desc: "Reach a 30-day streak",
    check: ({ currentStreak }) => currentStreak >= 30,
  },
  {
    id: "comeback_player",
    emoji: "📈",
    name: "Comeback Player of the Year",
    desc: "Score 5/5 the day after scoring 2 or less",
    check: ({ hasComeback }) => !!hasComeback,
  },
  {
    id: "unbreakable",
    emoji: "💪",
    name: "Unbreakable",
    desc: "Rebuild a 3+ day streak after breaking one of 10+ days",
    check: ({ hasUnbreakable }) => !!hasUnbreakable,
  },
  {
    id: "daily_bread",
    emoji: "🥇",
    name: "Daily Bread",
    desc: "Win a daily leaderboard for the first time",
    check: ({ dailyWins }) => dailyWins >= 1,
  },
  {
    id: "brady_mode",
    emoji: "🐐",
    name: "Brady Mode",
    desc: "Win 7 daily leaderboards",
    check: ({ dailyWins }) => dailyWins >= 7,
  },
  {
    id: "bridesmaid",
    emoji: "💍",
    name: "Always the Bridesmaid...",
    desc: "Finish 2nd or 3rd on a daily leaderboard 5 different times",
    check: ({ dailyTop3NotFirst }) => dailyTop3NotFirst >= 5,
  },
  {
    id: "weekly_warrior",
    emoji: "🏆",
    name: "Weekly Warrior",
    desc: "Win a weekly leaderboard",
    check: ({ weeklyWins }) => weeklyWins >= 1,
  },
  {
    id: "dynasty_talks",
    emoji: "🏛️",
    name: "Dynasty Talks",
    desc: "Win the weekly leaderboard 3 times",
    check: ({ weeklyWins }) => weeklyWins >= 3,
  },
];

/**
 * Returns IDs of achievements newly earned that weren't already in alreadyEarned.
 * @param {{ totalQuizzes: number, totalPerfect: number, currentStreak: number, tdStreak: number, hasGunslinger: boolean, hasTwoMinuteDrill: boolean, hasPickSix: boolean }} stats
 * @param {string[]} alreadyEarned
 * @returns {string[]}
 */
export function computeNewAchievements(stats, alreadyEarned = []) {
  const earned = new Set(alreadyEarned);
  return ACHIEVEMENTS
    .filter(a => !earned.has(a.id) && a.check(stats))
    .map(a => a.id);
}
