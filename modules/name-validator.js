import { BANNED_WORDS } from "./config.js";

// Validate and clean up a player name before submitting to leaderboard
export function sanitizeName(raw) {
  if (!raw) return null;
  let name = String(raw).trim();
  if (!name) return null;

  // Reject names with spaces
  if (name.includes(" ")) {
    return null;
  }

  // Limit length to 27 characters
  if (name.length > 27) {
    name = name.slice(0, 27);
  }

  // Check against banned words list (case-insensitive)
  const lower = name.toLowerCase();
  for (const bad of BANNED_WORDS) {
    if (!bad) continue;
    if (lower.includes(String(bad).toLowerCase())) {
      return null;
    }
  }

  return name;
}