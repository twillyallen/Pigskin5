import { STREAK_TIERS } from "./config.js";
import { storage } from "./storage.js";
import { yesterdayOf } from "./date-utils.js";

// Get tier information based on streak length
export function getTierForStreak(streakDays) {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_TIERS[i].minDays) {
      return STREAK_TIERS[i];
    }
  }
  return STREAK_TIERS[0];
}

// Calculate and save the user's daily play streak
export function computeAndSaveStreak(dateStr) {
  let streak = storage.getStreak();
  const last = storage.getLastStreakDate();

  if (last === dateStr) return streak;

  const yest = yesterdayOf(dateStr);

  if (!last) {
    streak = 1;
  } else if (last === yest) {
    streak = streak + 1;
  } else {
    streak = 1;
  }

  storage.setStreak(streak);
  storage.setLastStreakDate(dateStr);
  return streak;
}

// Update the "perfect score" streak (only counts days with 5/5 correct)
export function updateTouchdownStreak(dateStr, didPerfect) {
  let streak = storage.getTDStreak();
  const last = storage.getLastTDDate();

  if (!didPerfect) {
    storage.setTDStreak(0);
    return 0;
  }

  if (last === dateStr) return streak;

  const yest = yesterdayOf(dateStr);

  if (!last) {
    streak = 1;
  } else if (last === yest) {
    streak = streak + 1;
  } else {
    streak = 1;
  }

  storage.setTDStreak(streak);
  storage.setLastTDDate(dateStr);
  return streak;
}