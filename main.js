// Import the CALENDAR object from questions.js which contains all quiz questions organized by date
import { CALENDAR } from "./questions.js?v=20250914c";

// ==============================
// Config - Global constants that control the game behavior
// ==============================
const TIME_LIMIT = 15; // Number of seconds the user has to answer each question

// LocalStorage key prefixes
const KEY_ATTEMPT_PREFIX = "ft5_attempt_";  // Tracks if user has played on a specific date
const KEY_RESULT_PREFIX  = "ft5_result_";   // Stores complete results for a date
const KEY_LEADERBOARD    = "ps5_leaderboard_v1"; // Stores leaderboard data locally (not currently used for display)
const KEY_LB_SUBMIT_PREFIX = "ps5_leaderboard_submit_"; // Tracks if user submitted score to leaderboard

const PROD_HOSTS = ["twillyallen.github.io", "pigskin5.com"];

// Google Apps Script
const LEADERBOARD_API_URL = "https://script.google.com/macros/s/AKfycbzLIkEvrtXNYc0zgtvpMYqma8YngyvMfmhfr2k2-xC6_po-rC5unN2KxLbqnJo4JraLwA/exec";


//SPECIAL EVENT DAYS --------------------------------------
const EVENT_LOGOS = {
  "college": "logos/pigskin5collegelogo.png",
  "Thanksgiving": "logos/pigskin5thanksgiving.png",
  //"packers": "logos/pigskin5packerlogo.png",
  "Christmas": "logos/pigskin5christmaslogo.png",
  "NYE": "logos/pigskin5NYElogo.png",
  // add more events here 
};


// ==============================
// STREAK TIER SYSTEM
// ==============================
const STREAK_TIERS = [
  { name: "Rookie", minDays: 0, emoji: "🎯", color: "#95a5a6" },
  { name: "Starter", minDays: 7, emoji: "⚡", color: "#3498db" },
  { name: "Pro", minDays: 14, emoji: "🔥", color: "#9b59b6" },
  { name: "All-Pro", minDays: 30, emoji: "⭐", color: "#f39c12" },
  { name: "Hall of Fame", minDays: 60, emoji: "🏆", color: "#e67e22" },
  { name: "Legend", minDays: 100, emoji: "👑", color: "#e74c3c" }
];

// Get tier information based on streak length
function getTierForStreak(streakDays) {
  // Start from the end and find the highest tier they qualify for
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_TIERS[i].minDays) {
      return STREAK_TIERS[i];
    }
  }
  // Default to Rookie if no streak
  return STREAK_TIERS[0];
}

function isProd() {

  return PROD_HOSTS.includes(location.hostname);
}

// Check if the user has already attempted the quiz for a specific date
function hasAttempt(dateStr) {
  return localStorage.getItem(KEY_ATTEMPT_PREFIX + dateStr) === "1";   // Returns "1" if played
}

// Mark that the user has attempted the quiz for this date
function setAttempt(dateStr) {
  localStorage.setItem(KEY_ATTEMPT_PREFIX + dateStr, "1");
}

// Save the complete results of a quiz attempt to local storage
function saveResult(dateStr, payload) {
  try {
    localStorage.setItem(KEY_RESULT_PREFIX + dateStr, JSON.stringify(payload));
  } catch {
  }
}

// Load previously saved results for a specific date
function loadResult(dateStr) {
  try {
    // Get the JSON string from storage
    const raw = localStorage.getItem(KEY_RESULT_PREFIX + dateStr);
    if (!raw) return null; 
    return JSON.parse(raw);
  } catch {
    // If parsing fails, return null
    return null;
  }
}

// --- State Variables ---
let RUN_DATE = null;        // The date string for the current quiz (YYYY-MM-DD format)
let QUESTIONS = [];         // Array of question objects for today's quiz
let current = 0;            // Index of the current question
let score = 0;              // Number of correct answers
let answered = false;       // Whether the current question has been answered
let picks = [];             // Array storing user's choices for each question
let timerId = null;         // Reference to the setInterval timer (so we can stop it)
let timeLeft = TIME_LIMIT;  // Seconds remaining on current question

// Timing & scoring variables
let questionStartTime = 0;  // Timestamp when current question started (using performance.now())
let questionTimes = [];     // Array storing how many seconds each question took
let totalPoints = 0;        // Total leaderboard points earned (based on speed)
let latestAvgTime = 0;      // Average time per question from most recent attempt

// --- DOM References - Store references to HTML elements ---
let startScreen, startBtn, cardSec, resultSec, questionEl, choicesEl;
let progressEl, timerEl, scoreText, reviewEl, restartBtn, headerEl;
let progressFillEl; // The inner element of the progress bar that animates
let leaderboardForm, playerNameInput, leaderboardWarningEl, leaderboardBody;

// ---------- Utilities ----------

// Get the current date in YYYY-MM-DD format (ISO 8601)
function getRunDateISO() {


  // === DEV DATE OVERRIDE - Uncomment to test specific dates ===
  // return "2026-01-01";   // Change this date to test
  // ====================



  // Check URL query parameters for a date override
  const p = new URLSearchParams(window.location.search);
  const allowOverride = !isProd(); // Only allow overrides when not on production
  if (allowOverride && p.has("date")) return p.get("date");

  // Get today's actual date
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Stop the countdown timer
function stopTimer() {
  if (timerId) clearInterval(timerId); // Clear the interval if it exists
  timerId = null; // Reset the timer ID
  // Remove the danger styling (red pulsing effect)
  if (timerEl) timerEl.classList.remove("timer-danger");
}

// Start a countdown timer for the current question
function startTimer(seconds) {
  stopTimer(); // Stop any existing timer first
  timeLeft = seconds; // Time remaining
  
  if (timerEl) {
    timerEl.textContent = `${timeLeft}s`; // Display initial time
    timerEl.classList.remove("timer-danger"); // Remove danger styling
  }

  // Mark when this question started (for calculating answer time)
  questionStartTime = performance.now(); // Timestamp in milliseconds

  // Create an interval that runs every 1000ms (1 second)
  timerId = setInterval(() => {
    timeLeft--; // Decrease time by 1 second
    
    if (timerEl) {
      timerEl.textContent = `${timeLeft}s`; // Update display

      // When 5 seconds or less remain, add danger styling (red pulsing)
      if (timeLeft <= 5 && timeLeft > 0) {
        timerEl.classList.add("timer-danger");
      }
    }

    // When time runs out, auto-submit with no answer
    if (timeLeft <= 0) {
      stopTimer();
      // pickAnswer(null, ...) means "no answer selected"
      pickAnswer(null, QUESTIONS[current].answer);
    }
  }, 1000); // Run this function every 1000 milliseconds
}

// ---------- Date helpers ----------

// Convert a date string (YYYY-MM-DD) into a Date object
function parseYMD(s) {
  // Split "2025-11-21" into ["2025", "11", "21"] and convert to numbers
  const [y, m, d] = s.split("-").map(Number);
  // JavaScript Date uses 0-indexed months, so subtract 1
  return new Date(y, m - 1, d);
}

// Convert a Date object into YYYY-MM-DD format
function formatYMD(d) {
  const y = d.getFullYear();
  // padStart(2, "0") ensures we get "03" instead of "3"
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Get the date string for the day before a given date
function yesterdayOf(dateStr) {
  const d = parseYMD(dateStr); // Convert string to Date object
  d.setDate(d.getDate() - 1);  // Subtract one day
  return formatYMD(d);         // Convert back to string
}

// ---------- Streak Counter (consecutive days played) ----------

// Calculate and save the user's daily play streak
function computeAndSaveStreak(dateStr) {
  const KEY_STREAK = "dailyStreak"; // Current streak count
  const KEY_LAST   = "dailyLastDate"; // Last date they played

  const last = localStorage.getItem(KEY_LAST);
  let streak = parseInt(localStorage.getItem(KEY_STREAK) || "0", 10);

  if (last === dateStr) return streak;

  const yest = yesterdayOf(dateStr);   // Get yesterday's date
  
  if (!last) {
    // First time playing - start streak at 1
    streak = 1;
  } else if (last === yest) {
    // They played yesterday - increment streak
    streak = streak + 1;
  } else {
    // They missed at least one day - reset streak to 1
    streak = 1;
  }

  // Save the new streak count and update last played date
  localStorage.setItem(KEY_STREAK, String(streak));
  localStorage.setItem(KEY_LAST, dateStr);
  return streak;
}

// ---------- Touchdown Streak (5/5 correct answers, consecutive days) ----------

// Update the "perfect score" streak (only counts days with 5/5 correct)
function updateTouchdownStreak(dateStr, didPerfect) {
  const KEY_TD_STREAK = "tdStreak";      // Touchdown streak count
  const KEY_TD_LAST   = "tdLastDate";    // Last date of perfect score

  let streak = parseInt(localStorage.getItem(KEY_TD_STREAK) || "0", 10);
  const last = localStorage.getItem(KEY_TD_LAST);

  // If they didn't get perfect score today, reset streak to 0
  if (!didPerfect) {
    localStorage.setItem(KEY_TD_STREAK, "0");
    return 0;
  }

  // If we already counted today's perfect score, return current streak
  if (last === dateStr) return streak;

  const yest = yesterdayOf(dateStr);
  
  if (!last) {
    // First ever perfect score
    streak = 1;
  } else if (last === yest) {
    // Perfect score yesterday too - increment streak
    streak = streak + 1;
  } else {
    // Missed at least one day - restart streak at 1
    streak = 1;
  }

  // Save the new touchdown streak
  localStorage.setItem(KEY_TD_STREAK, String(streak));
  localStorage.setItem(KEY_TD_LAST, dateStr);
  return streak;
}

// ---------- Leaderboard helpers ----------

// Validate and clean up a player name before submitting to leaderboard
function sanitizeName(raw) {
  if (!raw) return null; // Empty input
  let name = String(raw).trim(); // Remove leading/trailing whitespace
  if (!name) return null; // Still empty after trimming

  // Reject names with spaces (force single-word names)
  if (name.includes(" ")) {
    return null;
  }

  // Limit length to 27 characters
  if (name.length > 27) {
    name = name.slice(0, 27); // Truncate to first 27 chars
  }

// List of Restricted Words for player names in Leaderboard
const BANNED_WORDS = [
  "Nigger",
  "Cunt",
  "Hitler",
  "Faggot",
  "Fag",
  "Shit",
  "Fuck",
  "Bitch"
];
  // Check against banned words list (case-insensitive)
  const lower = name.toLowerCase();
  for (const bad of BANNED_WORDS) {
    if (!bad) continue; // Skip empty entries
    // If the name contains any banned word, reject it
    if (lower.includes(String(bad).toLowerCase())) {
      return null;
    }
  }
  
  return name; // Name passed all checks
}

// Load the local leaderboard cache from localStorage
// (Currently not used for display, but kept for potential future use)
function loadLeaderboardStore() {
  try {
    const raw = localStorage.getItem(KEY_LEADERBOARD);
    if (!raw) return {}; // No stored data
    const data = JSON.parse(raw);
    // Ensure we return an object, not some other type
    return (data && typeof data === "object") ? data : {};
  } catch {
    return {}; // If parsing fails, return empty object
  }
}

// Save leaderboard data to localStorage
function saveLeaderboardStore(store) {
  try {
    localStorage.setItem(KEY_LEADERBOARD, JSON.stringify(store));
  } catch {
    // Fail silently if storage fails
  }
}

// Get leaderboard entries for a specific date from local storage
function getLeaderboardForDate(dateStr) {
  const store = loadLeaderboardStore();
  // Return the array for this date, or empty array if doesn't exist
  return Array.isArray(store[dateStr]) ? store[dateStr] : [];
}

// Submit a leaderboard entry to Google Sheets via Apps Script
async function addLeaderboardEntry(dateStr, entry) {
  try {
    // Create form data to send to the server
    const body = new URLSearchParams();
    body.append("date", dateStr);
    body.append("name", entry.name);
    body.append("points", String(entry.points ?? 0)); // ?? is nullish coalescing (default to 0)
    body.append("avgTime", String(entry.avgTime ?? 0));

    body.append("dailyStreak", String(entry.dailyStreak ?? 0)); // NEW: Include streak
    // Send POST request to Google Apps Script
    await fetch(LEADERBOARD_API_URL, {
      method: "POST",
      mode: "no-cors", // Can't read response, but server will process the data
      body
    });

    // With no-cors mode, we can't check if it succeeded, but Apps Script will write the row
  } catch (err) {
    console.error("Failed to submit leaderboard entry:", err);
  }
}

// Fetch leaderboard data using JSONP (workaround for CORS restrictions)
function fetchLeaderboardJSONP() {
  return new Promise((resolve, reject) => {
    // Create a unique callback name to avoid collisions
    const callbackName = "ps5LbCallback_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

    // Create a global function that Apps Script will call with the data
    window[callbackName] = (data) => {
      try {
        delete window[callbackName]; // Clean up the global function
        script.remove(); // Remove the script tag

        // Check if the response indicates an error
        if (data && data.ok === false) {
          console.error("Leaderboard error:", data.error);
          reject(new Error(data.error || "Leaderboard error"));
        } else {
          resolve(data || []); // Return the data array
        }
      } catch (err) {
        reject(err);
      }
    };

    // Create a script tag that loads data from Apps Script
    const script = document.createElement("script");
    script.src =
      LEADERBOARD_API_URL +
      "?callback=" + encodeURIComponent(callbackName);

    // Handle script loading errors
    script.onerror = (err) => {
      delete window[callbackName];
      script.remove();
      reject(err);
    };

    // Add script to page, which triggers the request
    document.body.appendChild(script);
  });
}

// Render top 5 leaderboard on start screen
function renderStartLeaderboard(dateStr) {
  const startBody = document.getElementById("startLeaderboardBody");
  if (!startBody) return;

  startBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  fetchLeaderboardJSONP(dateStr)
    .then(entries => {
      startBody.innerHTML = "";

      if (!Array.isArray(entries)) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "No scores yet. Be the first!";
        tr.appendChild(td);
        startBody.appendChild(tr);
        return;
      }

      // Filter to today's entries
      const todaysEntries = entries.filter(e => {
        try {
          const entryDate = new Date(e.date);
          const [year, month, day] = dateStr.split('-').map(Number);
          const targetDate = new Date(year, month - 1, day);
          return entryDate.toDateString() === targetDate.toDateString();
        } catch {
          return e.date === dateStr;
        }
      });

      // Only show top 5
      const top5 = todaysEntries.slice(0, 5);

      if (!top5.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "No scores yet. Be the first!";
        tr.appendChild(td);
        startBody.appendChild(tr);
        return;
      }

      // Render top 5 entries
      top5.forEach((e, idx) => {
        const tr = document.createElement("tr");

        const rankTd = document.createElement("td");
        rankTd.textContent = String(idx + 1);

        const nameTd = document.createElement("td");
        
        // Add tier badge to name
        const streak = e.dailyStreak ?? 0;
        const tier = getTierForStreak(streak);
        
        const nameContainer = document.createElement("div");
        nameContainer.className = "name-with-tier";
        
        const tierBadge = document.createElement("span");
        tierBadge.className = "tier-badge";
        tierBadge.textContent = tier.emoji;
        tierBadge.title = `${tier.name} (${streak}-day streak)`;
        tierBadge.style.color = tier.color;
        tierBadge.style.cursor = "pointer";
        // Add click handler for mobile (title does not work on touch devices)
        const showTierInfo = (e) => {
          e.preventDefault();
          e.stopPropagation();
          alert(`${tier.emoji} ${tier.name}\n${streak}-day streak`);
        };
        tierBadge.addEventListener("click", showTierInfo);
        tierBadge.addEventListener("touchend", showTierInfo); // iOS Chrome fix
        
        const nameSpan = document.createElement("span");
        nameSpan.textContent = e.name || "Anonymous";
        
        nameContainer.appendChild(tierBadge);
        nameContainer.appendChild(nameSpan);
        nameTd.appendChild(nameContainer);

        const pointsTd = document.createElement("td");
        pointsTd.textContent = (e.points ?? 0).toLocaleString();

        const avgTd = document.createElement("td");
        if (typeof e.avgTime === "number" && !Number.isNaN(e.avgTime)) {
          avgTd.textContent = `${e.avgTime.toFixed(1)}s`;
        } else {
          avgTd.textContent = "-";
        }

        tr.append(rankTd, nameTd, pointsTd, avgTd);
        startBody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Failed to load start leaderboard:", err);
      startBody.innerHTML = "<tr><td colspan='4'>Error loading leaderboard.</td></tr>";
    });
}


// Render personal scorecard on start screen
function renderStartScorecard() {
  const scorecardEl = document.getElementById("startScorecard");
  const emojiEl = document.getElementById("scorecardEmoji");
  const dailyStreakEl = document.getElementById("scorecardDailyStreak");
  const tdStreakEl = document.getElementById("scorecardTDStreak");
  const yesterdayEl = document.getElementById("scorecardYesterday");
  
  if (!scorecardEl) return;

  // Get current streaks from localStorage (not computed yet for today)
  const dailyStreak = localStorage.getItem("dailyStreak") || "0";
  const tdStreak = localStorage.getItem("tdStreak") || "0";
  
  // Get yesterday's date
  const today = getRunDateISO();
  const yesterday = yesterdayOf(today);
  
  // Load yesterday's result
  const yesterdayResult = loadResult(yesterday);
  
  // If no data to show, hide the scorecard
  if (!yesterdayResult && dailyStreak === "0" && tdStreak === "0") {
    scorecardEl.classList.add("hidden");
    return;
  }
  
  // Show scorecard
  scorecardEl.classList.remove("hidden");
  
  // Update streaks - show actual streak values
  if (dailyStreakEl) dailyStreakEl.textContent = dailyStreak;
  if (tdStreakEl) tdStreakEl.textContent = tdStreak;
  
  // Update yesterday's data
  if (yesterdayResult && yesterdayResult.picks) {
    // Create emoji grid
    const squares = yesterdayResult.picks.map(p => 
      (p.pick === p.correct ? "🟩" : "⬜")
    ).join("");
    
    if (emojiEl) emojiEl.textContent = squares;
    
    // Show leaderboard points instead of correct answers
    const points = yesterdayResult.totalPoints || 0;
    if (yesterdayEl) yesterdayEl.textContent = points.toLocaleString();
  } else {
    // No data for yesterday
    if (emojiEl) emojiEl.textContent = "⬜⬜⬜⬜⬜";
    if (yesterdayEl) yesterdayEl.textContent = "-";
  }
}

// Display the leaderboard for a specific date
function renderLeaderboard(dateStr) {
  if (!leaderboardBody) return; // Exit if element doesn't exist

  // Show loading message while fetching
  leaderboardBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  // Fetch leaderboard data
  fetchLeaderboardJSONP(dateStr)
    .then(entries => {
      leaderboardBody.innerHTML = ""; // Clear loading message

      // Check if we got valid data
      if (!Array.isArray(entries)) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4; // Span all columns
        td.textContent = "No scores yet. Be the first!";
        tr.appendChild(td);
        leaderboardBody.appendChild(tr);
        return;
      }

      // Filter entries to only show today's scores
      // Apps Script may return dates in various formats, so we parse them carefully
      const todaysEntries = entries.filter(e => {
        try {
          const entryDate = new Date(e.date); // Parse the entry's date
          // Parse our target date (dateStr) as a local date, not UTC
          const [year, month, day] = dateStr.split('-').map(Number);
          const targetDate = new Date(year, month - 1, day);
          // Compare the date strings (ignoring time)
          return entryDate.toDateString() === targetDate.toDateString();
        } catch {
          // If parsing fails, fallback to direct string comparison
          return e.date === dateStr;
        }
      });

      const rowsToShow = todaysEntries.slice(0, 20);

      // If no entries for today, show placeholder message
      if (!rowsToShow.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "No scores yet. Be the first!"; //No Entries yet message!
        tr.appendChild(td);
        leaderboardBody.appendChild(tr);
        return;
      }

      // Create a table row for each entry
      rowsToShow.forEach((e, idx) => {
        const tr = document.createElement("tr");

        // Rank column (1st, 2nd, 3rd, etc.)
        const rankTd = document.createElement("td");
        rankTd.textContent = String(idx + 1);

        // Name column
        // Name column with tier badge
        const nameTd = document.createElement("td");
        
        const streak = e.dailyStreak ?? 0;
        const tier = getTierForStreak(streak);
        
        const nameContainer = document.createElement("div");
        nameContainer.className = "name-with-tier";
        
        const tierBadge = document.createElement("span");
        tierBadge.className = "tier-badge";
        tierBadge.textContent = tier.emoji;
        tierBadge.title = `${tier.name} (${streak}-day streak)`;
        tierBadge.style.color = tier.color;
        tierBadge.style.cursor = "pointer";
        // Add click handler for mobile (title does not work on touch devices)
        const showTierInfo = (e) => {
          e.preventDefault();
          e.stopPropagation();
          alert(`${tier.emoji} ${tier.name}\n${streak}-day streak`);
        };
        tierBadge.addEventListener("click", showTierInfo);
        tierBadge.addEventListener("touchend", showTierInfo); // iOS Chrome fix
        const nameSpan = document.createElement("span");
        nameSpan.textContent = e.name || "Anonymous";
        
        nameContainer.appendChild(tierBadge);
        nameContainer.appendChild(nameSpan);
        nameTd.appendChild(nameContainer);

        // Points column (format with thousands separator)
        const pointsTd = document.createElement("td");
        pointsTd.textContent = (e.points ?? 0).toLocaleString();

        // Average time column (show as seconds with 1 decimal place)
        const avgTd = document.createElement("td");
        if (typeof e.avgTime === "number" && !Number.isNaN(e.avgTime)) {
          avgTd.textContent = `${e.avgTime.toFixed(1)}s`;
        } else {
          avgTd.textContent = "-"; // No data
        }

        // Add all columns to the row
        tr.append(rankTd, nameTd, pointsTd, avgTd);
        leaderboardBody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Failed to load leaderboard:", err);
      leaderboardBody.innerHTML =
        "<tr><td colspan='4'>Error loading leaderboard.</td></tr>";
    });
}

// Handle leaderboard form submission
async function handleLeaderboardSubmit(evt) {
  evt.preventDefault(); // Prevent default form submission (page reload)
  if (!RUN_DATE) return; // Exit if we don't have a valid date

  // Disable submit button immediately to prevent spam/double-submissions
  const submitBtn = leaderboardForm?.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }

  // Check if user already submitted for today
  if (hasSubmittedLeaderboard(RUN_DATE) ||
      (leaderboardForm && leaderboardForm.classList.contains("submitted"))) {
    if (leaderboardWarningEl) {
      leaderboardWarningEl.textContent = "You've already submitted your score for today.";
    }
    return;
  }

  // Clear any previous warnings
  if (leaderboardWarningEl) leaderboardWarningEl.textContent = "";

  // Get and validate the player name
  const rawName = playerNameInput?.value || "";
  const name = sanitizeName(rawName);

  // If name is invalid, show error and re-enable button
  if (!name) {
    if (leaderboardWarningEl) {
      leaderboardWarningEl.textContent =
        "Invalid name. Must be 27 characters or less, no spaces, and no banned words.";
    }
    // Re-enable the button so they can try again
    const submitBtn = leaderboardForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Score";
    }
    return;
  }

  
  // Get current daily streak to include in submission
  const dailyStreak = parseInt(localStorage.getItem("dailyStreak") || "0", 10);
  // Create the entry object to submit
  const entry = {
    name,
    points: totalPoints,
    avgTime: latestAvgTime,
    dailyStreak: dailyStreak,
    createdAt: Date.now() // Timestamp of submission
  };
  // Submit to Google Sheets
  await addLeaderboardEntry(RUN_DATE, entry);

  // Refresh the leaderboard display to show the new entry
  renderLeaderboard(RUN_DATE);

  // Mark that this browser has submitted for today (prevent re-submission)
  setSubmittedLeaderboard(RUN_DATE);
  
  // Update form UI to show submission is complete
  if (leaderboardForm) {
    leaderboardForm.classList.add("submitted");
    const submitBtn = leaderboardForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Score Submitted";
    }
  }
  
  
  // Disable name input field but keep the name visible
  if (playerNameInput) {
    playerNameInput.value = name; // Keep the sanitized name in the box
    playerNameInput.disabled = true;
  }
}

// Check if user has already submitted to leaderboard for this date
function hasSubmittedLeaderboard(dateStr) {
  try {
    return localStorage.getItem(KEY_LB_SUBMIT_PREFIX + dateStr) === "1";
  } catch {
    return false;
  }
}

// Mark that user has submitted to leaderboard for this date
function setSubmittedLeaderboard(dateStr) {
  try {
    localStorage.setItem(KEY_LB_SUBMIT_PREFIX + dateStr, "1");
  } catch {
    // Fail silently
  }
}

// ---------- Locked Result (showing previously completed quiz) ----------

// Display a previously completed quiz's results
function renderPersistedResult(dateStr, persisted) {
  RUN_DATE = dateStr;
  QUESTIONS = getQuestionsForDate(RUN_DATE);
  
  // Restore the user's previous picks and score
  picks = Array.isArray(persisted?.picks) ? persisted.picks : [];
  score = Number.isFinite(persisted?.score)
    ? persisted.score
    : picks.filter(p => p && p.pick === p.correct).length; // Recalculate if needed

  // Update body classes to show results screen
  document.body.classList.remove("no-scroll");
  document.body.classList.remove("start-page");
  document.body.classList.remove("quiz-active");
  
  // Hide start and quiz screens, show results
  startScreen.classList.add("hidden");
  cardSec.classList.add("hidden");
  resultSec.classList.remove("hidden");
  headerEl?.classList.add("hidden");
  if (timerEl) timerEl.style.display = "none";

  // Display the score
  scoreText.textContent = `You got ${score} / ${QUESTIONS.length || 5} correct.`;

  // Render the review section (showing each question and answer)
  reviewEl.innerHTML = ""; // Clear previous content
  picks.forEach(({ idx, pick, correct }) => {
    // Get the question data (with fallbacks if data is missing)
    const q = (QUESTIONS && QUESTIONS[idx]) || {
      question: `Question ${idx + 1}`,
      choices: ["A","B","C","D"],
      explanation: ""
    };

    // Create container for this question review
    const div = document.createElement("div");
    div.className = "rev";

    // Question text
    const qEl = document.createElement("div");
    qEl.className = "q";
    qEl.textContent = q.question ?? `Question ${idx + 1}`;

    // User's answer text
    const yourAnswerText =
      (pick === null || pick === undefined)
        ? "No answer" // Time ran out
        : (q.choices?.[pick] ?? `Choice ${Number(pick) + 1}`);

    const you = document.createElement("div");
    you.innerHTML = `Your answer: <strong>${yourAnswerText}</strong>`;

    // Correct answer text
    const correctText = q.choices?.[correct] ?? `Choice ${Number(correct) + 1}`;
    const cor = document.createElement("div");
    cor.innerHTML = `Correct: <strong>${correctText}</strong>`;

    // Explanation text
    const ex = document.createElement("div");
    ex.className = "ex";
    ex.textContent = q.explanation ?? "";

    // Color-code the review based on correct/incorrect
    if (pick === correct) {
      // Correct answer - green styling
      you.style.color = "#28a745";
      div.style.background = "rgba(40, 167, 69, 0.22)";
      div.style.border = "1px solid rgba(40, 167, 69, 0.45)";
    } else {
      // Wrong answer - red styling
      you.style.color = "#ff4b6b";
      div.style.background = "rgba(255, 75, 107, 0.13)";
      div.style.border = "1px solid rgba(255, 75, 107, 0.4)";
    }

    // Add all elements to the review container
    div.append(qEl, you, cor, ex);
    reviewEl.appendChild(div);
  });

  // Restore performance metrics if available
  if (typeof persisted?.avgTime === "number" && typeof persisted?.totalPoints === "number") {
    latestAvgTime = persisted.avgTime;
    totalPoints = persisted.totalPoints;

    // Find or create the metrics display element
    let metricsEl = document.getElementById("metricsText");
    if (!metricsEl) {
      metricsEl = document.createElement("p");
      metricsEl.id = "metricsText";
      metricsEl.className = "metrics-text";
      // Insert after the score text
      scoreText.insertAdjacentElement("afterend", metricsEl);
    }
    metricsEl.innerHTML = `
    Avg. Answer Time: ${persisted.avgTime.toFixed(1)}s per question<br>
    Total points: ${persisted.totalPoints.toLocaleString()}
  `;
  }

  // Show the leaderboard
  renderLeaderboard(RUN_DATE);

  // Configure restart button (disabled - can't play again)
  if (restartBtn) {
    restartBtn.style.display = "inline-block";
    restartBtn.textContent = "COME BACK TOMORROW!";
    restartBtn.disabled = true;
    restartBtn.style.cursor = "default";
    restartBtn.style.opacity = "0.7";
  }

  // Add share functionality
  injectShareSummary();
}

// ---------- Locked Gate (user already played today) ----------

// Show message when user tries to play but already completed today's quiz
function showLockedGate(dateStr) {
  // First check if we have saved results to display
  const persisted = loadResult(dateStr);
  if (persisted) {
    // Show the actual results if we have them
    renderPersistedResult(dateStr, persisted);
    return;
  }

  // Otherwise, show generic "already played" message
  document.body.classList.remove("no-scroll");
  document.body.classList.remove("start-page");
  document.body.classList.remove("quiz-active");
  
  startScreen.classList.add("hidden");
  cardSec.classList.add("hidden");
  resultSec.classList.remove("hidden");
  headerEl?.classList.add("hidden");
  if (timerEl) timerEl.style.display = "none";
  
  scoreText.textContent = `You already played ${dateStr}. Come back tomorrow!`;
  reviewEl.innerHTML = "";
  
  renderLeaderboard(dateStr);
  
  if (restartBtn) {
    restartBtn.style.display = "inline-block";
    restartBtn.textContent = "COME BACK TOMORROW";
    restartBtn.disabled = true;
    restartBtn.style.cursor = "default";
    restartBtn.style.opacity = "0.7";
  }
}

// ---------- Screen Switchers ----------

// Function to swap logo on Saturdays for college edition
function setLogoForDay() {
  const titleLogo = document.querySelector('.title-logo');
  console.log('setLogoForDay called!', titleLogo);
  if (!titleLogo) return;
  
  const runDate = getRunDateISO();
  //const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if there's a special event for today
  const dayData = CALENDAR[runDate];
  if (dayData && typeof dayData === 'object' && dayData.event) {
    const eventName = dayData.event;
    const logoFile = EVENT_LOGOS[eventName];
    
    if (logoFile) {
      console.log(`Special event active: ${eventName}`);
      titleLogo.src = logoFile;
      titleLogo.alt = `Pigskin5 ${eventName} Logo`;
      return; // Exit early - special event overrides everything
    }
  }
  
  // No special event - check if it's Saturday (college edition)
console.log('Setting regular logo');
    titleLogo.src = 'logos/pigskin5logo.png';
    titleLogo.alt = 'Pigskin5 Logo';
}

// ---------- Snow Effect ----------

let snowInterval = null; // Store the interval ID so we can stop it

// Create a single snowflake
function createSnowflake() {
  const container = document.getElementById("startScreen");
  if (!container) return;
  
  const snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.textContent = "❄";
  
  // Random starting position across the width
  snowflake.style.left = Math.random() * 100 + "%";
  
  // Random animation duration (slower = more realistic)
  const duration = 5 + Math.random() * 10; // 5-15 seconds
  snowflake.style.animationDuration = duration + "s";
  
  // Random size
  const size = 10 + Math.random() * 20; // 10-30px
  snowflake.style.fontSize = size + "px";
  
  // Random horizontal drift
  const drift = -20 + Math.random() * 40; // -20px to +20px
  snowflake.style.setProperty('--drift', drift + 'px');
  
  container.appendChild(snowflake);
  
  // Remove snowflake after animation completes
  setTimeout(() => {
    snowflake.remove();
  }, (duration + 1) * 1000);
}

// Create falling snow animation (for Christmas event)
function startSnow() {
  // Stop any existing snow first
  stopSnow();
  
  // Create initial batch of snowflakes
  for (let i = 0; i < 30; i++) {
    setTimeout(() => createSnowflake(), i * 100);
  }
  
  // Continue creating snowflakes every 300ms to keep it snowing
  snowInterval = setInterval(() => {
    createSnowflake();
  }, 300);
}

// Stop and clear all snow
function stopSnow() {
  // Stop creating new snowflakes
  if (snowInterval) {
    clearInterval(snowInterval);
    snowInterval = null;
  }
  
  // Remove all existing snowflakes
  const snowflakes = document.querySelectorAll(".snowflake");
  snowflakes.forEach(flake => flake.remove());
}

// ---------- Confetti Effect (Canvas-Confetti Library) ----------

let confettiInterval = null; // Store the interval ID so we can stop it

// Create continuous confetti bursts (for New Year's event)
function startConfetti() {
  // Stop any existing confetti first
  stopConfetti();
  
  // Check if canvas-confetti library is loaded
  if (typeof confetti !== "function") {
    console.warn("canvas-confetti library not loaded");
    return;
  }
  
  // Function to create a confetti burst
  function burst() {
    // Left side burst
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
    });
    
    // Right side burst
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#98D8C8', '#F7DC6F', '#BB8FCE', '#FFD700', '#FF6B6B']
    });
  }
  
  // Create initial burst
  burst();
  
  // Continue creating confetti bursts every 400ms
  confettiInterval = setInterval(() => {
    burst();
  }, 400);
}

// Stop confetti animation
function stopConfetti() {
  // Stop creating new confetti bursts
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
}


// Display the start/home screen
function showStartScreen() {
  // Force scroll to top of page
  window.scrollTo(0,0);

  // Set body classes for start screen state
  document.body.classList.remove("no-scroll");
  document.body.classList.remove("hide-footer");
  document.body.classList.remove("quiz-active");
  document.body.classList.add("start-page");

  // Check if user already played today
  const runDate = getRunDateISO();
  if (hasAttempt(runDate)) {
    showLockedGate(runDate);
    return;
  }

  // --- Add College Edition badge on Saturdays ---
document.querySelector(".college-badge")?.remove();
document.querySelector(".title-wrap")?.classList.remove("title-wrap");

  // --- Show Start Screen ---
  startScreen.classList.remove("hidden");
  cardSec.classList.add("hidden");
  resultSec.classList.add("hidden");
  if (headerEl) headerEl.classList.add("hidden");
  if (timerEl) timerEl.style.display = "none";
  
  stopTimer(); // Ensure no timer is running

  // Reset start button state
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = "START";
  }

  // Load today's top 5 leaderboard
  renderStartScorecard();
  renderStartLeaderboard(runDate);
  
  // --- Start special effects for event days ---
  const dayData = CALENDAR[runDate];
  const eventName = (dayData && typeof dayData === 'object') ? dayData.event : null;
  
  // Clear any existing effects first
  stopSnow();
  stopConfetti();
  
  // Start appropriate effect based on event
  if (eventName === "Christmas") {
    startSnow();
  }
  else if (eventName === "NYE") {
    startConfetti();
  }
}


// Helper to get questions from CALENDAR (handles both array and object formats)
function getQuestionsForDate(dateStr) {
  const dayData = CALENDAR[dateStr];
  
  // If it's an object with questions property, return those
  if (dayData && typeof dayData === 'object' && Array.isArray(dayData.questions)) {
    return dayData.questions;
  }
  
  // Otherwise it's just an array of questions
  return Array.isArray(dayData) ? dayData : [];
}



// Start the quiz game
function startGame() {
  // Stop any snow effect when game starts
  stopSnow();
  stopConfetti();
  
  // Update body classes for quiz state
  document.body.classList.remove("start-page");
  document.body.classList.remove("no-scroll");
  document.body.classList.add("hide-footer");  // Hide footer during gameplay for cleaner UI
  document.body.classList.add("quiz-active");   // Shows the progress bar

  // Get today's date and check if already played
  RUN_DATE = getRunDateISO();
  if (hasAttempt(RUN_DATE)) {
    // User already played today - show locked screen
    showLockedGate(RUN_DATE);
    return;
  }

  // Load today's questions from the CALENDAR object
  QUESTIONS = getQuestionsForDate(RUN_DATE);

  // Reset all game state variables
  current = 0;          // Start at question 0
  score = 0;            // No correct answers yet
  answered = false;     // Current question not answered
  picks = [];           // Empty array to store user's choices

  // Reset performance metrics
  questionTimes = [];   // Clear timing data
  totalPoints = 0;      // Reset leaderboard points
  latestAvgTime = 0;    // Reset average time

  // Check if questions exist for today
  if (!Array.isArray(QUESTIONS) || QUESTIONS.length !== 5) {
    // No quiz available for today - show error message
    startScreen.classList.add("hidden");
    cardSec.classList.add("hidden");
    resultSec.classList.remove("hidden");
    headerEl?.classList.add("hidden");
    if (timerEl) timerEl.style.display = "none";
    scoreText.textContent = `No quiz scheduled for ${RUN_DATE}.`;
    reviewEl.innerHTML = `<div class="rev"><div class="q">Add a set for ${RUN_DATE} in questions.js</div></div>`;
    return;
  }

  // Show quiz screen, hide others
  startScreen.classList.add("hidden");
  resultSec.classList.add("hidden");
  cardSec.classList.remove("hidden");
  headerEl?.classList.remove("hidden");
  if (timerEl) timerEl.style.display = "block";

  // Mark that user has attempted today's quiz (one attempt per day)
  setAttempt(RUN_DATE);
  
  // Compute and save streak for today
  computeAndSaveStreak(RUN_DATE);
  
  // Display the first question
  renderQuestion();
  
  // Scroll to top for clean start
  window.scrollTo({ top: 0, behavior: "instant" });
}

// Display the results screen after completing the quiz
function showResult() {
  // Update body classes for results screen
  document.body.classList.remove("start-page");
  document.body.classList.remove("no-scroll");
  document.body.classList.remove("hide-footer");  // Show footer again
  document.body.classList.remove("quiz-active");   // Hide progress bar

  // Switch to results screen
  cardSec.classList.add("hidden");
  resultSec.classList.remove("hidden");
  headerEl?.classList.add("hidden");
  if (timerEl) timerEl.style.display = "none";

  // Force browser to recalculate layout, then scroll to top
  // This ensures nothing is hidden behind the footer
  void resultSec.offsetHeight;  // Reading offsetHeight forces layout calculation
  requestAnimationFrame(() => window.scrollTo(0, 0));

  // Check if user got perfect score
  if (score === QUESTIONS.length) {
    scoreText.textContent = `TOUCHDOWN! You got ${score} / ${QUESTIONS.length}!`;
    updateTouchdownStreak(RUN_DATE, true);  // Update perfect score streak

    // Trigger confetti animation (requires canvas-confetti library)
    if (typeof confetti === "function") {
      confetti({ 
        particleCount: 150,   // Number of confetti pieces
        spread: 70,           // How wide they spread
        origin: { y: 0.6 }    // Start position (0.6 = 60% down the screen)
      });
    }
  } else {
    // Regular score display
    scoreText.textContent = `You got ${score} / ${QUESTIONS.length} correct.`;
    updateTouchdownStreak(RUN_DATE, false);  // Reset perfect score streak
  }

  // Build the review section showing all questions and answers
  reviewEl.innerHTML = ""; // Clear any previous content
  
  // Loop through each question's pick
  picks.forEach(({ idx, pick, correct }) => {
    // Get question data with fallback values if missing
    const q = (QUESTIONS && QUESTIONS[idx]) || {
      question: `Question ${idx + 1}`,
      choices: ["A","B","C","D"],
      explanation: ""
    };

    // Create container div for this question review
    const div = document.createElement("div");
    div.className = "rev";

    // Question text element
    const qEl = document.createElement("div");
    qEl.className = "q";
    qEl.textContent = q.question ?? `Question ${idx + 1}`;

    // Determine what text to show for user's answer
    const yourAnswerText =
      (pick === null || pick === undefined)
        ? "No answer"  // Timer ran out
        : (q.choices?.[pick] ?? `Choice ${Number(pick) + 1}`);

    // Create "Your answer" element
    const you = document.createElement("div");
    you.innerHTML = `Your answer: <strong>${yourAnswerText}</strong>`;

    // Get correct answer text
    const correctText = q.choices?.[correct] ?? `Choice ${Number(correct) + 1}`;
    const cor = document.createElement("div");
    cor.innerHTML = `Correct: <strong>${correctText}</strong>`;

    // Explanation element
    const ex = document.createElement("div");
    ex.className = "ex";
    ex.textContent = q.explanation || "";

    // Apply color coding based on correct/incorrect
    if (pick === correct) {
      // Correct answer styling (green)
      you.style.color = "#28a745";
      div.style.background = "rgba(40, 167, 69, 0.22)";
      div.style.border = "1px solid rgba(40, 167, 69, 0.45)";
    } else {
      // Wrong answer styling (red)
      you.style.color = "#ff4b6b";
      div.style.background = "rgba(255, 75, 107, 0.13)";
      div.style.border = "1px solid rgba(255, 75, 107, 0.4)";
    }

    // Add all parts to the review container
    div.append(qEl, you, cor, ex);
    reviewEl.appendChild(div);
  });

  // ---- Calculate and display performance metrics ----
  
  // Sum all question times using reduce
  // reduce takes a function that accumulates values: (accumulator, currentValue) => newAccumulator
  const totalTime = questionTimes.reduce((sum, t) => sum + (t || 0), 0);
  
  // Calculate average time per question
  const avgTime = questionTimes.length ? totalTime / questionTimes.length : 0;
  latestAvgTime = avgTime;  // Store for leaderboard submission

  // Find or create the metrics display element
  let metricsEl = document.getElementById("metricsText");
  if (!metricsEl) {
    metricsEl = document.createElement("p");
    metricsEl.id = "metricsText";
    metricsEl.className = "metrics-text";
    // Insert right after the score text
    scoreText.insertAdjacentElement("afterend", metricsEl);
  }
  
  // Display metrics with formatting
  // toFixed(1) shows 1 decimal place
  // toLocaleString() adds comma separators to large numbers
  // NEW CODE:
  metricsEl.innerHTML = `
  Avg answer time: ${avgTime.toFixed(1)}s per question<br>
  Total points: ${totalPoints.toLocaleString()}
  `;

  // Save all results to localStorage for future reference
  saveResult(RUN_DATE, { score, picks, totalTime, avgTime, totalPoints });

  // Display the leaderboard
  renderLeaderboard(RUN_DATE);
  
  // Add share functionality and streak display
  injectShareSummary();

  // Configure restart button (disabled since you can only play once per day)
  if (restartBtn) {
    restartBtn.style.display = "inline-block";
    restartBtn.textContent = "COME BACK TOMORROW";
    restartBtn.disabled = true;
    restartBtn.style.cursor = "default";
    restartBtn.style.opacity = "0.7";
  }
}

// ---------- Quiz Functions ----------

// Display a question and its answer choices
function renderQuestion() {
  answered = false;  // Reset answered flag for this question
  const q = QUESTIONS[current];  // Get current question object
  
  // Display question text
  questionEl.textContent = q.question;
  questionEl.style.whiteSpace = 'pre-line';
  
  // Display progress (e.g., "Question 2 / 5")
  progressEl.textContent = `Question ${current + 1} / ${QUESTIONS.length}`;

  // Update progress bar at bottom of screen
  // Shows how many questions have been COMPLETED (not including current)
  if (progressFillEl && QUESTIONS.length > 0) {
    const completed = current; // 0 on Q1, 1 on Q2, etc.
    const ratio = completed / QUESTIONS.length;  // 0 to 1
    // scaleX transforms the width: 0 = no width, 1 = full width
    progressFillEl.style.transform = `scaleX(${ratio})`;
  }

  // Clear previous answer buttons
  choicesEl.innerHTML = "";
  
  // Create a button for each answer choice
  q.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.textContent = choice;  // Button text is the answer choice
    btn.addEventListener("click", () => pickAnswer(i, q.answer));
    choicesEl.appendChild(btn);
  });
  
  // Start the countdown timer
  startTimer(TIME_LIMIT);
}

// Handle when user picks an answer (or time runs out)
function pickAnswer(i, correct) {
  if (answered) return;  // Prevent answering twice
  answered = true;       // Mark as answered

  // --- Calculate how long this question took ---
  const now = performance.now();  // Current timestamp in milliseconds
  const MAX_TIME = TIME_LIMIT || 15;
  
  // Calculate elapsed time in seconds
  let elapsed = (now - questionStartTime) / 1000;
  
  // Safety checks for invalid elapsed times
  if (!Number.isFinite(elapsed) || elapsed < 0) elapsed = MAX_TIME;
  if (elapsed > MAX_TIME) elapsed = MAX_TIME;
  
  // Store this question's time
  questionTimes.push(elapsed);
  // ------------------------------------------

  stopTimer();  // Stop the countdown

  // Get all answer buttons and disable them
  const buttons = Array.from(choicesEl.querySelectorAll("button"));
  buttons.forEach(b => { b.disabled = true; });

  // Highlight the correct answer in green
  if (typeof correct === "number" && buttons[correct]) {
    buttons[correct].classList.add("correct");
  }
  
  // If user picked wrong answer, highlight it in red
  if (i !== null && i !== correct && typeof i === "number" && buttons[i]) {
    buttons[i].classList.add("wrong");
  }

  // Calculate points for this question
  // - score = total number of correct answers
  // - totalPoints = leaderboard points (reward speed: 100 points per second remaining)
  let questionPoints = 0;
  if (i === correct) {
    score++;  // Increment correct answer count
    const safeTimeLeft = Math.max(0, Number(timeLeft) || 0);
    questionPoints = 100 * safeTimeLeft;   // e.g., 7s left = 700 points
    totalPoints += questionPoints;         // Add to total
  }

  // Store detailed info about this question's attempt
  picks.push({ 
    idx: current,           // Question index
    pick: i,                // User's choice (or null if no answer)
    correct,                // Index of correct answer
    elapsed,                // Time taken
    points: questionPoints  // Points earned
  });

  // Wait 700ms to show the correct/wrong highlighting, then move on
  setTimeout(() => {
    current++;  // Move to next question
    
    if (current < QUESTIONS.length) {
      // More questions remain - show next question
      renderQuestion();
    } else {
      // All questions complete - show results
      showResult();
    }
  }, 700);
}

// Display a temporary toast notification message
function showToast(msg) {
  // Create toast element
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  
  // Wait one frame, then add "show" class to trigger CSS animation
  requestAnimationFrame(() => t.classList.add("show"));
  
  // After 1.6 seconds, hide the toast
  setTimeout(() => {
    t.classList.remove("show");  // Start fade-out animation
    // After animation completes, remove element from DOM
    setTimeout(() => t.remove(), 200);
  }, 1600);
}

// ---------- Share + Streak ----------

// Add share button and streak display to results screen
function injectShareSummary() {
  const resultTop = document.getElementById("result");
  if (!resultTop) return;  // Exit if results section doesn't exist

  // Remove any previous share/date elements (for when results refresh)
  resultTop.querySelectorAll(".share-header,.date-line").forEach(n => n.remove());

  // Create date line at top of results
  const dateLine = document.createElement("div");
  dateLine.className = "date-line";
  dateLine.textContent = `Pigskin 5 - ${RUN_DATE}`;
  resultTop.insertBefore(dateLine, resultTop.firstChild);  // Add at very top

  // Build share header container
  const headerWrap = document.createElement("div");
  headerWrap.className = "share-header under-score";

  // Left side: emoji grid + share button
  const leftRow = document.createElement("div");
  leftRow.className = "share-left-row";

  // Create visual grid of results using emojis
  // Green square = correct, white square = wrong
  const squares = picks.map(p => (p.pick === p.correct ? "🟩" : "⬜")).join("");
  const grid = document.createElement("div");
  grid.className = "share-grid";
  grid.textContent = squares;

  // Create share button
  const shareBtn = document.createElement("button");
  shareBtn.id = "shareBtn";
  shareBtn.className = "share-btn";
  shareBtn.textContent = "Share";
  
  // Handle share button click
  shareBtn.addEventListener("click", async () => {
    // Regenerate squares in case they changed
    const squaresNow = picks.map(p => (p.pick === p.correct ? "🟩" : "⬜")).join("");
    
    // Get current streaks
  const dailyStreak = computeAndSaveStreak(RUN_DATE);
  const tdStreak = localStorage.getItem("tdStreak") || 0;
  
  let shareText;
  
if (score === QUESTIONS.length) {
    // Perfect score - TOUCHDOWN!
    shareText = `TOUCHDOWN! ${RUN_DATE}
${squaresNow}
${latestAvgTime.toFixed(1)}s avg · ${totalPoints.toLocaleString()} pts
Daily Streak: 🔥 ${dailyStreak}
Touchdown Streak: 🏈 ${tdStreak}

pigskin5.com

@twillystakes`;
  } else if (score === 0) {
    // Zero correct - humorous message
    shareText = `Pigskin 5 ${RUN_DATE}
${squaresNow}
I do NOT know ball 🤦

Can you beat my score?
pigskin5.com

@twillystakes`;
  } else {
    // Regular score
    shareText = `Pigskin 5 ${RUN_DATE}
${squaresNow}
${latestAvgTime.toFixed(1)}s avg · ${totalPoints.toLocaleString()} pts
Daily Streak: 🔥 ${dailyStreak}

pigskin5.com

@twillystakes`;
  }
    
    try {
      // Try modern clipboard API first (more secure, requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers or non-HTTPS sites
        const ta = document.createElement("textarea");
        ta.value = shareText;
        ta.setAttribute("readonly", "");  // Prevent editing
        ta.style.position = "fixed";      // Position off-screen
        ta.style.opacity = "0";           // Make invisible
        document.body.appendChild(ta);
        ta.select();                      // Select all text
        document.execCommand("copy");     // Legacy copy command
        ta.remove();                      // Clean up
      }
      
      showToast("Copied to clipboard");
      
      // Try native share API if available (mobile devices)
      if (navigator.share) {
        navigator.share({ text: shareText }).catch(() => {});  // Ignore errors
      }
    } catch (e) {
      console.error("Share failed:", e);
      showToast("Could not copy. Try manual paste.");
    }
  });


  // Add grid and button to left side
  leftRow.append(grid, shareBtn);

  // Right side: Streak badges
  const rightCol = document.createElement("div");
  rightCol.className = "share-right";

  // Daily streak pill (days played in a row)
  const daily = document.createElement("div");
  daily.className = "pill";
  daily.textContent = `Daily Streak: ${computeAndSaveStreak(RUN_DATE)}`;

  // Touchdown streak pill (perfect scores in a row)
  const td = document.createElement("div");
  td.className = "pill";
  td.textContent = `Touchdown Streak: ${localStorage.getItem("tdStreak") || 0}`;

  // Add streaks to right side
  rightCol.append(daily, td);

  // Combine left and right sides
  headerWrap.append(leftRow, rightCol);

  // ---- Insert header directly under the "Your Score" line ----
  const anchor = document.getElementById("scoreText");
  if (anchor && anchor.parentNode) {
    // Insert after scoreText
    anchor.parentNode.insertBefore(headerWrap, anchor.nextSibling);
  } else {
    // Fallback: insert before review section
    const review = document.getElementById("review");
    if (review && review.parentNode) {
      review.parentNode.insertBefore(headerWrap, review);
    } else {
      // Last resort: append to results
      resultTop.appendChild(headerWrap);
    }
  }
}

// ---------- Initialization ----------

// Initialize the app when page loads
function init() {
  // Get references to all DOM elements we'll need
  startScreen  = document.getElementById("startScreen");
  startBtn     = document.getElementById("startBtn");
  cardSec      = document.getElementById("card");
  resultSec    = document.getElementById("result");
  questionEl   = document.getElementById("question");
  choicesEl    = document.getElementById("choices");
  progressEl   = document.getElementById("progress");
  timerEl      = document.getElementById("timer");
  scoreText    = document.getElementById("scoreText");
  reviewEl     = document.getElementById("review");
  restartBtn   = document.getElementById("restartBtn");
  headerEl     = document.querySelector(".header");
  
  setLogoForDay();
  setTimeout(() => setLogoForDay(), 100);
  showStartScreen();

  leaderboardForm      = document.getElementById("leaderboardForm");
  playerNameInput      = document.getElementById("playerName");
  leaderboardWarningEl = document.getElementById("leaderboardWarning");
  leaderboardBody      = document.getElementById("leaderboardBody");

  // Build bottom progress bar (only once)
  let bar = document.querySelector(".progress-bar");
  if (!bar) {
    // Progress bar doesn't exist - create it
    bar = document.createElement("div");
    bar.className = "progress-bar";

    // Create the inner fill element
    progressFillEl = document.createElement("div");
    progressFillEl.className = "progress-fill";
    bar.appendChild(progressFillEl);

    // Add to page
    document.body.appendChild(bar);
  } else {
    // Progress bar already exists - just get the fill element
    progressFillEl = bar.querySelector(".progress-fill");
  }

  // Attach event listeners
  // ?. is optional chaining - only calls addEventListener if element exists
  startBtn?.addEventListener("click", startGame);
  restartBtn?.addEventListener("click", showStartScreen);
  leaderboardForm?.addEventListener("submit", handleLeaderboardSubmit);

  // Show the start screen
  showStartScreen();

  // Ensure page starts at top
  window.scrollTo(0, 0);

  // Setup menu toggle (if it exists)
  const menuBtn = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  menuBtn?.addEventListener("click", () => {
    // Toggle "hidden" class on/off
    menu.classList.toggle("hidden");
  });
}

// Run init when DOM is ready
if (document.readyState === "loading") {
  // DOM still loading - wait for DOMContentLoaded event
  document.addEventListener("DOMContentLoaded", init);
} else {
  // DOM already loaded - run init immediately
  init();
}

// ---- Header controls (help/about) ----
// IIFE (Immediately Invoked Function Expression) to avoid polluting global scope
(function(){
  // Get references to header elements
  const helpBtn = document.getElementById('helpBtn');
  const menuBtn = document.getElementById('menuBtn');
  const howTo = document.getElementById('howTo');
  const menuDropdown = document.getElementById('menuDropdown');
  const result = document.getElementById('result');
  const topbar = document.getElementById('topbar');
  const restartBtn = document.getElementById('restartBtn');

  // Show or hide the topbar (header with help/about buttons)
  function showTopbar(show){
    if(!topbar) return;
    topbar.style.display = show ? 'flex' : 'none';
    // When hiding topbar, also hide the how-to panel and menu
    if(!show) {
      if(howTo) { 
        howTo.hidden = true; 
        helpBtn?.setAttribute('aria-expanded','false'); 
      }
      if(menuDropdown) {
        menuDropdown.hidden = true;
        menuBtn?.setAttribute('aria-expanded','false');
      }
    }
  }

  // Toggle the "How to play" panel when help button clicked
  helpBtn?.addEventListener('click', () => {
    if(!howTo) return;
    const isHidden = howTo.hidden;
    howTo.hidden = !isHidden;  // Toggle visibility
    helpBtn.setAttribute('aria-expanded', String(isHidden));
    // Close menu if open
    if(menuDropdown && !menuDropdown.hidden) {
      menuDropdown.hidden = true;
      menuBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  // Toggle the hamburger menu when menu button clicked
  menuBtn?.addEventListener('click', () => {
    if(!menuDropdown) return;
    const isHidden = menuDropdown.hidden;
    menuDropdown.hidden = !isHidden;  // Toggle visibility
    menuBtn.setAttribute('aria-expanded', String(isHidden));
    // Close how-to if open
    if(howTo && !howTo.hidden) {
      howTo.hidden = true;
      helpBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu/how-to when clicking outside
  document.addEventListener('click', (e) => {
    if(!menuDropdown && !howTo) return;
    
    // Check if click is outside both menus and their buttons
    const clickedMenuBtn = menuBtn && menuBtn.contains(e.target);
    const clickedHelpBtn = helpBtn && helpBtn.contains(e.target);
    const clickedMenu = menuDropdown && menuDropdown.contains(e.target);
    const clickedHowTo = howTo && howTo.contains(e.target);
    
    if(!clickedMenuBtn && !clickedMenu && !clickedHelpBtn && !clickedHowTo) {
      if(menuDropdown) {
        menuDropdown.hidden = true;
        menuBtn?.setAttribute('aria-expanded', 'false');
      }
      if(howTo) {
        howTo.hidden = true;
        helpBtn?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Hide header when game starts
  const startBtn = document.getElementById('startBtn');
  startBtn?.addEventListener('click', () => {
    showTopbar(false);
  });

  const mo = new MutationObserver(() => {
    if(result && !result.classList.contains('hidden')){
      showTopbar(true);
    }
  });
  // Start observing the result section's class attribute
  if(result) mo.observe(result, { 
    attributes: true,              // Watch for attribute changes
    attributeFilter: ['class']     // Only watch the class attribute
  });

  // When restart button clicked, make sure header is visible
  restartBtn?.addEventListener('click', () => showTopbar(true));
})();

// --- Safety: ensure no stray scroll locks on non-start screens ---
// This fixes issues when using browser back/forward buttons
window.addEventListener("pageshow", () => {
  // Check if we're on the start screen
  const onStartScreen = !document.getElementById("startScreen")?.classList.contains("hidden");
  if (!onStartScreen) {
    // Not on start screen - make sure body can scroll
    document.body.classList.remove("no-scroll");
  }
});