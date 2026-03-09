// Game settings
export const TIME_LIMIT = 15;
export const PROD_HOSTS = ["twillyallen.github.io", "pigskin5.com"];

// LocalStorage keys
export const STORAGE_KEYS = {
  ATTEMPT: "ft5_attempt_",
  RESULT: "ft5_result_",
  LEADERBOARD: "ps5_leaderboard_v1",
  LB_SUBMIT: "ps5_leaderboard_submit_",
  DAILY_STREAK: "dailyStreak",
  DAILY_LAST: "dailyLastDate",
  TD_STREAK: "tdStreak",
  TD_LAST: "tdLastDate",
};

// APIs
export const LEADERBOARD_API_URL = "https://script.google.com/macros/s/AKfycbzLIkEvrtXNYc0zgtvpMYqma8YngyvMfmhfr2k2-xC6_po-rC5unN2KxLbqnJo4JraLwA/exec";

// Event logos
export const EVENT_LOGOS = {
    "college": "logos/pigskin5collegelogo.png",
    "Thanksgiving": "logos/pigskin5thanksgiving.png",
    //"packers": "logos/pigskin5packerlogo.png",
    "Christmas": "logos/pigskin5christmaslogo.png",
    "NYE": "logos/pigskin5NYElogo.png",
    "2025Wrapped": "logos/2025Wrapped.png",
    "RamsPanthers": "logos/RamsPanthers.png",
    "BillsJaguars": "logos/BillsJaguars.png",
    "49ersEagles": "logos/49ersEagles.png",
    "PackersBears": "logos/PackersBears.png",
    "ChargersPatriots": "logos/ChargersPatriots.png",
    "SteelersTexans": "logos/SteelersTexans.png",
    "49ersSeahawks": "logos/49ersSeahawks.png",
    "BillsBroncos": "logos/BillsBroncos.png",
    "TexansPatriots": "logos/TexansPatriots.png",
    "RamsBears": "logos/RamsBears.png",
    "PatriotsBroncos": "logos/PatriotsBroncos.png",
    "RamsSeahawks": "logos/RamsSeahawks.png",
    "SuperBowlWeek": "logos/SuperBowlWeek.png",
    "PatriotsEdition": "logos/PatriotsEdition.png",
    "SeahawksEdition": "logos/SeahawksEdition.png",
    "NFLHonorsEdition": "logos/NFLHonorsEdition.png",
    "SUPERBOWL": "logos/SUPERBOWL.png",
    "ValentinesDay": "logos/ValentinesDay.png",
  // ... etc
};

// Streak tiers
export const STREAK_TIERS = [
  { name: "Rookie", minDays: 0, emoji: "🫡", color: "#95a5a6" },
  { name: "Starter", minDays: 7, emoji: "🏈", color: "#3498db" },
  { name: "Pro", minDays: 14, emoji: "🔥", color: "#9b59b6" },
  { name: "All-Pro", minDays: 30, emoji: "⭐", color: "#f39c12" },
  { name: "Hall of Fame", minDays: 50, emoji: "🏆", color: "#e67e22" },
  { name: "Legend", minDays: 100, emoji: "👑", color: "#e74c3c" }
];

// Banned words for leaderboard name validation
export const BANNED_WORDS = [
  "Nigger", "Cunt", "Hitler", "Faggot", "Fag", "Shit", "Fuck", "Bitch",
];