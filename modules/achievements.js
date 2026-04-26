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
