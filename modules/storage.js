import { STORAGE_KEYS } from "./config.js";

export const storage = {
  // Attempts
  hasAttempt(dateStr) {
    return localStorage.getItem(STORAGE_KEYS.ATTEMPT + dateStr) === "1";
  },

  setAttempt(dateStr) {
    localStorage.setItem(STORAGE_KEYS.ATTEMPT + dateStr, "1");
  },

  // Results
  saveResult(dateStr, payload) {
    try {
      localStorage.setItem(STORAGE_KEYS.RESULT + dateStr, JSON.stringify(payload));
    } catch {}
  },

  loadResult(dateStr) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RESULT + dateStr);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Daily streak
  getStreak() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.DAILY_STREAK) || "0", 10);
  },

  setStreak(days) {
    localStorage.setItem(STORAGE_KEYS.DAILY_STREAK, String(days));
  },

  getLastStreakDate() {
    return localStorage.getItem(STORAGE_KEYS.DAILY_LAST);
  },

  setLastStreakDate(dateStr) {
    localStorage.setItem(STORAGE_KEYS.DAILY_LAST, dateStr);
  },

  // Touchdown streak
  getTDStreak() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.TD_STREAK) || "0", 10);
  },

  setTDStreak(days) {
    localStorage.setItem(STORAGE_KEYS.TD_STREAK, String(days));
  },

  getLastTDDate() {
    return localStorage.getItem(STORAGE_KEYS.TD_LAST);
  },

  setLastTDDate(dateStr) {
    localStorage.setItem(STORAGE_KEYS.TD_LAST, dateStr);
  },

  // Leaderboard submission
  hasSubmittedLeaderboard(dateStr) {
    try {
      return localStorage.getItem(STORAGE_KEYS.LB_SUBMIT + dateStr) === "1";
    } catch {
      return false;
    }
  },

  setSubmittedLeaderboard(dateStr) {
    try {
      localStorage.setItem(STORAGE_KEYS.LB_SUBMIT + dateStr, "1");
    } catch {}
  },
};