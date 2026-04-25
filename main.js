// ============================================================================
// PIGSKIN5 - MAIN.JS (REORGANIZED WITH CLEAR SECTIONS)
// ============================================================================

import { CALENDAR } from "./questions.js?v=20260412";
import { submitEntry, fetchLeaderboard, fetchWeeklyLeaderboard, refreshStreakCache, getCachedDailyStreak, getCachedTDStreak, getTodaysAttempt, getCachedFavoriteTeam, overrideCachedStreaks } from "./modules/leaderboard.js";
import { getCurrentUser, supabase } from "./modules/supabase-client.js";
import { NFL_TEAMS } from "./modules/nfl-teams.js";
import { showTierTooltip } from "./modules/ui-helpers.js";
import { ACHIEVEMENTS } from "./modules/achievements.js";



// ==============================
// Config
// ==============================
const TIME_LIMIT = 15;
const KEY_ATTEMPT_PREFIX = "ft5_attempt_";
const KEY_RESULT_PREFIX  = "ft5_result_";
const KEY_LEADERBOARD    = "ps5_leaderboard_v1";
const KEY_LB_SUBMIT_PREFIX = "ps5_leaderboard_submit_";

// SessionStorage keys for mid-quiz state (cleared on tab/browser close)
const KEY_SESSION_DATE  = "ps5_session_date";
const KEY_SESSION_PICKS = "ps5_session_picks";

const PROD_HOSTS = ["twillyallen.github.io", "pigskin5.com"];
const LEADERBOARD_API_URL = "https://script.google.com/macros/s/AKfycbzLIkEvrtXNYc0zgtvpMYqma8YngyvMfmhfr2k2-xC6_po-rC5unN2KxLbqnJo4JraLwA/exec";

const EVENT_LOGOS = {
  "college": "logos/pigskin5collegelogo.png",
  "Thanksgiving": "logos/pigskin5thanksgiving.png",
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
  "NFLDraft2026": "logos/Draft2026.png",
};

const STREAK_TIERS = [
  { name: "Rookie", minDays: 0, emoji: "🫡", color: "#95a5a6" },
  { name: "Starter", minDays: 7, emoji: "🏈", color: "#3498db" },
  { name: "Pro", minDays: 14, emoji: "🔥", color: "#9b59b6" },
  { name: "All-Pro", minDays: 30, emoji: "⭐", color: "#f39c12" },
  { name: "Hall of Fame", minDays: 50, emoji: "🏆", color: "#e67e22" },
  { name: "Legend", minDays: 100, emoji: "👑", color: "#e74c3c" }
];

const BANNED_WORDS = [
  "Nigger", "Cunt", "Hitler", "Faggot", "Fag", "Shit", "Fuck", "Bitch",
];

// ==============================
// STATE VARIABLES
// ==============================
let RUN_DATE = null;
let QUESTIONS = [];
let current = 0;
let score = 0;
let answered = false;
let picks = [];
let timerId = null;
let timeLeft = TIME_LIMIT;
let questionStartTime = 0;
let questionTimes = [];
let totalPoints = 0;
let latestAvgTime = 0;

let startScreen, startBtn, cardSec, resultSec, questionEl, choicesEl;
let progressEl, timerEl, scoreText, reviewEl, restartBtn, headerEl;
let progressFillEl;
let leaderboardForm, playerNameInput, leaderboardWarningEl, leaderboardBody;

let snowInterval = null;
let heartsInterval = null;
let confettiInterval = null;

// ==============================
// UTILITY FUNCTIONS
// ==============================

function isProd() {
  return PROD_HOSTS.includes(location.hostname);
}

function getRunDateISO() {
  const p = new URLSearchParams(window.location.search);
  const allowOverride = !isProd();
  if (allowOverride && p.has("date")) return p.get("date");

  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYMD(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayOf(dateStr) {
  const d = parseYMD(dateStr);
  d.setDate(d.getDate() - 1);
  return formatYMD(d);
}

function hasAttempt(dateStr) {
  return localStorage.getItem(KEY_ATTEMPT_PREFIX + dateStr) === "1";
}

function setAttempt(dateStr) {
  localStorage.setItem(KEY_ATTEMPT_PREFIX + dateStr, "1");
}

function saveResult(dateStr, payload) {
  try {
    localStorage.setItem(KEY_RESULT_PREFIX + dateStr, JSON.stringify(payload));
  } catch {}
}

function loadResult(dateStr) {
  try {
    const raw = localStorage.getItem(KEY_RESULT_PREFIX + dateStr);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getTierForStreak(streakDays) {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_TIERS[i].minDays) {
      return STREAK_TIERS[i];
    }
  }
  return STREAK_TIERS[0];
}


function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);

  requestAnimationFrame(() => t.classList.add("show"));

  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 200);
  }, 1600);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
  if (timerEl) timerEl.classList.remove("timer-danger");
}

function startTimer(seconds) {
  stopTimer();
  timeLeft = seconds;

  if (timerEl) {
    timerEl.textContent = `${timeLeft}s`;
    timerEl.classList.remove("timer-danger");
  }

  questionStartTime = performance.now();

  timerId = setInterval(() => {
    timeLeft--;

    if (timerEl) {
      timerEl.textContent = `${timeLeft}s`;

      if (timeLeft <= 5 && timeLeft > 0) {
        timerEl.classList.add("timer-danger");
      }
    }

    if (timeLeft <= 0) {
      stopTimer();
      pickAnswer(null, QUESTIONS[current].answer);
    }
  }, 1000);
}

// ==============================
// STREAK FUNCTIONS
// ==============================

function computeAndSaveStreak(dateStr) {
  const KEY_STREAK = "dailyStreak";
  const KEY_LAST = "dailyLastDate";

  const last = localStorage.getItem(KEY_LAST);
  let streak = parseInt(localStorage.getItem(KEY_STREAK) || "0", 10);

  if (last === dateStr) return streak;

  const yest = yesterdayOf(dateStr);

  if (!last) {
    streak = 1;
  } else if (last === yest) {
    streak = streak + 1;
  } else {
    streak = 1;
  }

  localStorage.setItem(KEY_STREAK, String(streak));
  localStorage.setItem(KEY_LAST, dateStr);
  return streak;
}

function updateTouchdownStreak(dateStr, didPerfect) {
  const KEY_TD_STREAK = "tdStreak";
  const KEY_TD_LAST = "tdLastDate";

  let streak = parseInt(localStorage.getItem(KEY_TD_STREAK) || "0", 10);
  const last = localStorage.getItem(KEY_TD_LAST);

  if (!didPerfect) {
    localStorage.setItem(KEY_TD_STREAK, "0");
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

  localStorage.setItem(KEY_TD_STREAK, String(streak));
  localStorage.setItem(KEY_TD_LAST, dateStr);
  return streak;
}

// ==============================
// LEADERBOARD FUNCTIONS
// ==============================

function sanitizeName(raw) {
  if (!raw) return null;
  let name = String(raw).trim();
  if (!name) return null;

  if (name.includes(" ")) {
    return null;
  }

  if (name.length > 27) {
    name = name.slice(0, 27);
  }

  const lower = name.toLowerCase();
  for (const bad of BANNED_WORDS) {
    if (!bad) continue;
    if (lower.includes(String(bad).toLowerCase())) {
      return null;
    }
  }

  return name;
}

function loadLeaderboardStore() {
  try {
    const raw = localStorage.getItem(KEY_LEADERBOARD);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return (data && typeof data === "object") ? data : {};
  } catch {
    return {};
  }
}

function saveLeaderboardStore(store) {
  try {
    localStorage.setItem(KEY_LEADERBOARD, JSON.stringify(store));
  } catch {}
}

async function addLeaderboardEntry(dateStr, entry) {
  const result = await submitEntry(dateStr, entry);
  if (result.error) {
    console.error("Submit failed:", result.error);
    if (leaderboardWarningEl) {
      leaderboardWarningEl.textContent = result.error;
    }
    throw new Error(result.error);
  }
}

async function fetchLeaderboardJSONP() {
  const date = RUN_DATE || getRunDateISO();
  return await fetchLeaderboard(date);
}

function createTierBadgeElement(streak, name, points, emojiScore, username) {
  const tier = getTierForStreak(streak);
  const nameContainer = document.createElement("div");
  nameContainer.className = "name-with-tier";

  const tierBadge = document.createElement("span");
  tierBadge.className = "tier-badge";
  tierBadge.textContent = tier.emoji;
  tierBadge.title = `${tier.name} (${streak}-day streak)`;
  tierBadge.style.color = tier.color;
  tierBadge.style.cursor = "pointer";

const showTierInfo = () => {
  showTierTooltip(tier.emoji, tier.name, streak, name || "Anonymous", emojiScore || "", points, username);
};

  tierBadge.addEventListener("click", showTierInfo);
  tierBadge.addEventListener("touchend", (e) => {
    e.preventDefault();
    showTierInfo();
  });

  const nameSpan = document.createElement("span");
  nameSpan.textContent = name || "Anonymous";

  nameContainer.appendChild(tierBadge);
  nameContainer.appendChild(nameSpan);

  return nameContainer;
}

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

      top5.forEach((e, idx) => {
        const tr = document.createElement("tr");

        const rankTd = document.createElement("td");
        rankTd.textContent = String(idx + 1);

        const nameTd = document.createElement("td");
        const streak = e.dailyStreak ?? 0;
        nameTd.appendChild(createTierBadgeElement(streak, e.name, e.points, e.emojiScore, e.username));

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

function renderStartScorecard() {
  const scorecardEl = document.getElementById("startScorecard");
  const emojiEl = document.getElementById("scorecardEmoji");
  const dailyStreakEl = document.getElementById("scorecardDailyStreak");
  const tdStreakEl = document.getElementById("scorecardTDStreak");
  const yesterdayEl = document.getElementById("scorecardYesterday");

  if (!scorecardEl) return;

  const dailyStreak = String(getCachedDailyStreak())
  const tdStreak = String(getCachedTDStreak());

  const today = getRunDateISO();
  const yesterday = yesterdayOf(today);

  const yesterdayResult = loadResult(yesterday);

  if (!yesterdayResult && dailyStreak === "0" && tdStreak === "0") {
    scorecardEl.classList.add("hidden");
    return;
  }

  scorecardEl.classList.remove("hidden");

  if (dailyStreakEl) {
    const tier = getTierForStreak(parseInt(dailyStreak, 10));
    dailyStreakEl.textContent = `${tier.emoji} ${dailyStreak}`;
  }
  if (tdStreakEl) tdStreakEl.textContent = tdStreak;

  if (yesterdayResult && yesterdayResult.picks) {
    const squares = yesterdayResult.picks.map(p => {
      const correctAnswers = Array.isArray(p.correct) ? p.correct : [p.correct];
      return correctAnswers.includes(p.pick) ? "🟩" : "⬜";
    }).join("");

    if (emojiEl) emojiEl.textContent = squares;

    const points = yesterdayResult.totalPoints || 0;
    if (yesterdayEl) yesterdayEl.textContent = points.toLocaleString();
  } else {
    if (emojiEl) emojiEl.textContent = "⬜⬜⬜⬜⬜";
    if (yesterdayEl) yesterdayEl.textContent = "-";
  }
}

// ---- Weekly leaderboard ----

let _lbActiveTab = 'today';

function buildWeeklyGuestLbRow(rank, entry) {
  const tr = document.createElement("tr");
  tr.className = "guest-lb-row";

  const rankTd = document.createElement("td");
  rankTd.textContent = String(rank);

  const nameTd = document.createElement("td");
  nameTd.innerHTML = `<span class="guest-lb-claim">🔒 Sign in to compete this week</span>`;

  const pointsTd = document.createElement("td");
  pointsTd.textContent = (entry.totalPoints ?? 0).toLocaleString();

  const daysTd = document.createElement("td");
  daysTd.textContent = "1/7";

  tr.append(rankTd, nameTd, pointsTd, daysTd);
  return tr;
}

async function renderWeeklyLeaderboard(guestEntry = null) {
  if (!leaderboardBody) return;
  leaderboardBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  const entries = await fetchWeeklyLeaderboard();
  leaderboardBody.innerHTML = "";

  if (!entries.length) {
    if (guestEntry) {
      leaderboardBody.appendChild(buildWeeklyGuestLbRow(1, guestEntry));
    } else {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No scores yet this week.";
      tr.appendChild(td);
      leaderboardBody.appendChild(tr);
    }
    return;
  }

  const virtualRows = [];
  let guestPlaced = false;
  for (const e of entries) {
    if (guestEntry && !guestPlaced && Number(e.total_points) < guestEntry.totalPoints) {
      virtualRows.push({ _guest: true, ...guestEntry });
      guestPlaced = true;
    }
    virtualRows.push(e);
  }
  if (guestEntry && !guestPlaced) virtualRows.push({ _guest: true, ...guestEntry });

  virtualRows.forEach((e, idx) => {
    const rank = idx + 1;
    if (e._guest) {
      leaderboardBody.appendChild(buildWeeklyGuestLbRow(rank, e));
      return;
    }

    const tr = document.createElement("tr");

    const rankTd = document.createElement("td");
    rankTd.textContent = String(rank);

    const nameTd = document.createElement("td");
    nameTd.appendChild(
      createTierBadgeElement(e.daily_streak ?? 0, e.display_name || e.username || "Player", e.total_points, null, e.username)
    );

    const pointsTd = document.createElement("td");
    pointsTd.textContent = Number(e.total_points ?? 0).toLocaleString();

    const daysTd = document.createElement("td");
    daysTd.textContent = `${e.days_played}/7`;

    tr.append(rankTd, nameTd, pointsTd, daysTd);
    leaderboardBody.appendChild(tr);
  });
}

function initLeaderboardTabs(guestDailyEntry, guestWeeklyEntry) {
  const tabToday = document.getElementById("lbTabToday");
  const tabWeek  = document.getElementById("lbTabWeek");
  const lbForm   = document.getElementById("leaderboardForm");
  const guestCta = document.getElementById("guestLeaderboardCta");
  const headEl   = document.getElementById("leaderboardHead");
  if (!tabToday || !tabWeek) return;

  _lbActiveTab = 'today';
  tabToday.classList.add("lb-tab--active");
  tabWeek.classList.remove("lb-tab--active");

  const isGuest = !!guestDailyEntry;

  tabToday.onclick = () => {
    if (_lbActiveTab === 'today') return;
    _lbActiveTab = 'today';
    tabToday.classList.add("lb-tab--active");
    tabWeek.classList.remove("lb-tab--active");
    if (headEl) headEl.innerHTML = `<tr><th>#</th><th>Name</th><th>Points</th><th>Avg Time</th></tr>`;
    renderLeaderboard(RUN_DATE, guestDailyEntry);
    if (isGuest) {
      lbForm?.classList.add("hidden");
      guestCta?.classList.remove("hidden");
    } else {
      lbForm?.classList.remove("hidden");
      guestCta?.classList.add("hidden");
    }
  };

  tabWeek.onclick = () => {
    if (_lbActiveTab === 'week') return;
    _lbActiveTab = 'week';
    tabWeek.classList.add("lb-tab--active");
    tabToday.classList.remove("lb-tab--active");
    if (headEl) headEl.innerHTML = `<tr><th>#</th><th>Name</th><th>Points</th><th>Days</th></tr>`;
    lbForm?.classList.add("hidden");
    guestCta?.classList.add("hidden");
    renderWeeklyLeaderboard(guestWeeklyEntry);
  };
}

function buildGuestLbRow(rank, entry) {
  const tr = document.createElement("tr");
  tr.className = "guest-lb-row";

  const rankTd = document.createElement("td");
  rankTd.textContent = String(rank);

  const nameTd = document.createElement("td");
  nameTd.innerHTML = `<span class="guest-lb-claim">🔒 Sign in to claim your spot</span>`;

  const pointsTd = document.createElement("td");
  pointsTd.textContent = (entry.points ?? 0).toLocaleString();

  const avgTd = document.createElement("td");
  if (typeof entry.avgTime === "number" && !Number.isNaN(entry.avgTime)) {
    avgTd.textContent = `${entry.avgTime.toFixed(1)}s`;
  } else {
    avgTd.textContent = "-";
  }

  tr.append(rankTd, nameTd, pointsTd, avgTd);
  return tr;
}

function renderLeaderboard(dateStr, guestEntry = null) {
  if (!leaderboardBody) return;

  leaderboardBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  fetchLeaderboardJSONP(dateStr)
    .then(entries => {
      leaderboardBody.innerHTML = "";

      if (!Array.isArray(entries)) {
        if (guestEntry) leaderboardBody.appendChild(buildGuestLbRow(1, guestEntry));
        else {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 4;
          td.textContent = "No scores yet. Be the first!";
          tr.appendChild(td);
          leaderboardBody.appendChild(tr);
        }
        return;
      }

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

      const rowsToShow = todaysEntries.slice(0, 20);

      if (!rowsToShow.length) {
        if (guestEntry) leaderboardBody.appendChild(buildGuestLbRow(1, guestEntry));
        else {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 4;
          td.textContent = "No scores yet. Be the first!";
          tr.appendChild(td);
          leaderboardBody.appendChild(tr);
        }
        return;
      }

      // Merge guest row at the correct rank position
      const virtualRows = [];
      let guestPlaced = false;
      for (const e of rowsToShow) {
        if (guestEntry && !guestPlaced && (e.points ?? 0) < guestEntry.points) {
          virtualRows.push({ _guest: true, ...guestEntry });
          guestPlaced = true;
        }
        virtualRows.push(e);
      }
      if (guestEntry && !guestPlaced) {
        virtualRows.push({ _guest: true, ...guestEntry });
      }

      virtualRows.forEach((e, idx) => {
        const rank = idx + 1;
        if (e._guest) {
          leaderboardBody.appendChild(buildGuestLbRow(rank, e));
          return;
        }

        const tr = document.createElement("tr");

        const rankTd = document.createElement("td");
        rankTd.textContent = String(rank);

        const nameTd = document.createElement("td");
        const streak = e.dailyStreak ?? 0;
        nameTd.appendChild(createTierBadgeElement(streak, e.name, e.points, e.emojiScore, e.username));

        const pointsTd = document.createElement("td");
        pointsTd.textContent = (e.points ?? 0).toLocaleString();

        const avgTd = document.createElement("td");
        if (typeof e.avgTime === "number" && !Number.isNaN(e.avgTime)) {
          avgTd.textContent = `${e.avgTime.toFixed(1)}s`;
        } else {
          avgTd.textContent = "-";
        }

        tr.append(rankTd, nameTd, pointsTd, avgTd);
        leaderboardBody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Failed to load leaderboard:", err);
      leaderboardBody.innerHTML = "<tr><td colspan='4'>Error loading leaderboard.</td></tr>";
    });
}

async function handleLeaderboardSubmit(evt) {
  evt.preventDefault();
  if (!RUN_DATE) return;

  const submitBtn = leaderboardForm?.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }

  if (hasSubmittedLeaderboard(RUN_DATE) ||
      (leaderboardForm && leaderboardForm.classList.contains("submitted"))) {
    if (leaderboardWarningEl) {
      leaderboardWarningEl.textContent = "You've already submitted your score for today.";
    }
    return;
  }

  if (leaderboardWarningEl) leaderboardWarningEl.textContent = "";

  const rawName = playerNameInput?.value || "";
  const name = sanitizeName(rawName);

  if (!name) {
    if (leaderboardWarningEl) {
      leaderboardWarningEl.textContent = "Invalid name. Must be 27 characters or less, no spaces, and no banned words.";
    }
    const submitBtn = leaderboardForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Score";
    }
    return;
  }

  const dailyStreak = getCachedDailyStreak();

  const emojiScore = picks.map(p => {
    const correctAnswers = Array.isArray(p.correct) ? p.correct : [p.correct];
    return correctAnswers.includes(p.pick) ? "🟩" : "⬜";
  }).join("");

  const entry = {
    name,
    points: totalPoints,
    avgTime: latestAvgTime,
    dailyStreak: dailyStreak,
    emojiScore: emojiScore,
    picks: picks, 
    createdAt: Date.now()
  };

  await addLeaderboardEntry(RUN_DATE, entry);
  await refreshStreakCache();
  renderLeaderboard(RUN_DATE);
  setSubmittedLeaderboard(RUN_DATE);

  if (leaderboardForm) {
    leaderboardForm.classList.add("submitted");
    const submitBtn = leaderboardForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Score Submitted";
    }
  }

  if (playerNameInput) {
    playerNameInput.value = name;
    playerNameInput.disabled = true;
  }
}

function hasSubmittedLeaderboard(dateStr) {
  try {
    return localStorage.getItem(KEY_LB_SUBMIT_PREFIX + dateStr) === "1";
  } catch {
    return false;
  }
}

function setSubmittedLeaderboard(dateStr) {
  try {
    localStorage.setItem(KEY_LB_SUBMIT_PREFIX + dateStr, "1");
  } catch {}
}

// ==============================
// RESULTS FUNCTIONS
// ==============================

async function renderPersistedResult(dateStr, persisted) {
  RUN_DATE = dateStr;
  QUESTIONS = getQuestionsForDate(RUN_DATE);

  picks = Array.isArray(persisted?.picks) ? persisted.picks : [];
  score = Number.isFinite(persisted?.score)
    ? persisted.score
    : picks.filter(p => {
        if (!p) return false;
        const correctAnswers = Array.isArray(p.correct) ? p.correct : [p.correct];
        return correctAnswers.includes(p.pick);
      }).length;

  document.body.classList.remove("no-scroll");
  document.body.classList.remove("start-page");
  document.body.classList.remove("quiz-active");
  document.body.classList.add("results-active");

  function unlockBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

  startScreen.classList.add("hidden");
  cardSec.classList.add("hidden");
  resultSec.classList.remove("hidden");
  headerEl?.classList.add("hidden");
  if (timerEl) timerEl.style.display = "none";

  scoreText.textContent = `You got ${score} / ${QUESTIONS.length || 5} correct.`;

  reviewEl.innerHTML = "";
  picks.forEach(({ idx, pick, correct }) => {
    const q = (QUESTIONS && QUESTIONS[idx]) || {
      question: `Question ${idx + 1}`,
      choices: ["A","B","C","D"],
      explanation: ""
    };

    const div = document.createElement("div");
    div.className = "rev";

    const qEl = document.createElement("div");
    qEl.className = "q";
    qEl.textContent = q.question ?? `Question ${idx + 1}`;

    const yourAnswerText =
      (pick === null || pick === undefined)
        ? "No answer"
        : (q.choices?.[pick] ?? `Choice ${Number(pick) + 1}`);

    const you = document.createElement("div");
    you.innerHTML = `Your answer: <strong>${yourAnswerText}</strong>`;

    const correctAnswers = Array.isArray(correct) ? correct : [correct];
    const correctTexts = correctAnswers.map(idx =>
      q.choices?.[idx] ?? `Choice ${Number(idx) + 1}`
    );
    const correctText = correctTexts.length > 1
      ? correctTexts.join(" OR ")
      : correctTexts[0];
    const cor = document.createElement("div");
    cor.innerHTML = `Correct: <strong>${correctText}</strong>`;

    const ex = document.createElement("div");
    ex.className = "ex";
    ex.textContent = q.explanation ?? "";

    if (correctAnswers.includes(pick)) {
      you.style.color = "#28a745";
      div.style.background = "rgba(40, 167, 69, 0.22)";
      div.style.border = "1px solid rgba(40, 167, 69, 0.45)";
    } else {
      you.style.color = "#ff4b6b";
      div.style.background = "rgba(255, 75, 107, 0.13)";
      div.style.border = "1px solid rgba(255, 75, 107, 0.4)";
    }

    div.append(qEl, you, cor, ex);
    reviewEl.appendChild(div);
  });

  if (typeof persisted?.avgTime === "number" && typeof persisted?.totalPoints === "number") {
    latestAvgTime = persisted.avgTime;
    totalPoints = persisted.totalPoints;

    let metricsEl = document.getElementById("metricsText");
    if (!metricsEl) {
      metricsEl = document.createElement("p");
      metricsEl.id = "metricsText";
      metricsEl.className = "metrics-text";
      scoreText.insertAdjacentElement("afterend", metricsEl);
    }
    metricsEl.innerHTML = `
    Avg. Answer Time: ${persisted.avgTime.toFixed(1)}s per question<br>
    Total points: ${persisted.totalPoints.toLocaleString()}
  `;
  }

  const user = await getCurrentUser();

  if (user) {
    const newStreak = computeAndSaveStreak(dateStr);
    const newTDStreak = parseInt(localStorage.getItem("tdStreak") || "0", 10);
    overrideCachedStreaks({ daily: newStreak, td: newTDStreak });
    const didPerfect = score === (QUESTIONS?.length || 5);

    (async () => {
      const { error: _streakErr } = await supabase.rpc("update_streaks_on_submit", { did_perfect: didPerfect, p_user_id: user.id });
      if (_streakErr) console.error("update_streaks_on_submit failed:", _streakErr);
      await refreshStreakCache();

      const { data: profile } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile) return;

      const newLongest = Math.max(profile.longest_streak ?? 0, profile.current_streak ?? 0);
      if (newLongest !== (profile.longest_streak ?? 0)) {
        await supabase.from("profiles").update({ longest_streak: newLongest }).eq("id", user.id);
      }
    })().catch(() => {});
  }

  const pts = persisted?.totalPoints ?? 0;
  const at  = persisted?.avgTime ?? 0;
  const guestDailyEntry  = user ? null : { points: pts, avgTime: at };
  const guestWeeklyEntry = user ? null : { totalPoints: pts, daysPlayed: 1 };

  renderLeaderboard(RUN_DATE, guestDailyEntry);
  initLeaderboardTabs(guestDailyEntry, guestWeeklyEntry);

  if (user && hasSubmittedLeaderboard(RUN_DATE)) {
    if (leaderboardForm) {
      leaderboardForm.classList.add("submitted");
      const btn = leaderboardForm.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Score Submitted"; }
    }
  } else if (user) {
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
      .then(({ data: profile }) => {
        if (playerNameInput && profile?.username && !playerNameInput.value) {
          playerNameInput.value = profile.username;
        }
      });
  }

  if (restartBtn) {
    restartBtn.style.display = "inline-block";
    restartBtn.textContent = "COME BACK TOMORROW!";
    restartBtn.disabled = true;
    restartBtn.style.cursor = "default";
    restartBtn.style.opacity = "0.7";
  }

  injectShareSummary();
}

function showLockedGate(dateStr) {
  const persisted = loadResult(dateStr);
  if (persisted) {
    renderPersistedResult(dateStr, persisted);
    return;
  }

  document.body.classList.remove("no-scroll");
  document.body.classList.remove("start-page");
  document.body.classList.remove("quiz-active");
  document.body.classList.add("results-active");

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

// ==============================
// VISUAL EFFECTS
// ==============================

function createSnowflake() {
  const container = document.getElementById("startScreen");
  if (!container) return;

  const snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.textContent = "❄";

  snowflake.style.left = Math.random() * 100 + "%";

  const duration = 5 + Math.random() * 10;
  snowflake.style.animationDuration = duration + "s";

  const size = 10 + Math.random() * 20;
  snowflake.style.fontSize = size + "px";

  const drift = -20 + Math.random() * 40;
  snowflake.style.setProperty('--drift', drift + 'px');

  container.appendChild(snowflake);

  setTimeout(() => {
    snowflake.remove();
  }, (duration + 1) * 1000);
}

function startSnow() {
  stopSnow();

  for (let i = 0; i < 30; i++) {
    setTimeout(() => createSnowflake(), i * 100);
  }

  snowInterval = setInterval(() => {
    createSnowflake();
  }, 300);
}

function stopSnow() {
  if (snowInterval) {
    clearInterval(snowInterval);
    snowInterval = null;
  }

  const snowflakes = document.querySelectorAll(".snowflake");
  snowflakes.forEach(flake => flake.remove());
}

function createHeart() {
  const container = document.getElementById("startScreen");
  if (!container) return;

  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = "❤";

  heart.style.left = Math.random() * 100 + "%";

  const duration = 5 + Math.random() * 10;
  heart.style.animationDuration = duration + "s";

  const size = 15 + Math.random() * 25;
  heart.style.fontSize = size + "px";

  const drift = -20 + Math.random() * 40;
  heart.style.setProperty('--drift', drift + 'px');

  container.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, (duration + 1) * 1000);
}

function startHearts() {
  stopHearts();

  for (let i = 0; i < 30; i++) {
    setTimeout(() => createHeart(), i * 100);
  }

  heartsInterval = setInterval(() => {
    createHeart();
  }, 300);
}

function stopHearts() {
  if (heartsInterval) {
    clearInterval(heartsInterval);
    heartsInterval = null;
  }

  const hearts = document.querySelectorAll(".heart");
  hearts.forEach(heart => heart.remove());
}

function startConfetti() {
  stopConfetti();

  if (typeof confetti !== "function") {
    console.warn("canvas-confetti library not loaded");
    return;
  }

  function burst() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
    });

    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#98D8C8', '#F7DC6F', '#BB8FCE', '#FFD700', '#FF6B6B']
    });
  }

  burst();

  confettiInterval = setInterval(() => {
    burst();
  }, 400);
}

function stopConfetti() {
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
}

function setLogoForDay() {
  const titleLogo = document.querySelector('.title-logo');
  console.log('setLogoForDay called!', titleLogo);
  if (!titleLogo) return;

  const runDate = getRunDateISO();

  const dayData = CALENDAR[runDate];
  if (dayData && typeof dayData === 'object' && dayData.event) {
    const eventName = dayData.event;
    const logoFile = EVENT_LOGOS[eventName];

    if (logoFile) {
      console.log(`Special event active: ${eventName}`);
      titleLogo.src = logoFile;
      titleLogo.alt = `Pigskin5 ${eventName} Logo`;
      return;
    }
  }

  console.log('Setting regular logo');
  titleLogo.src = 'logos/pigskin5logo.png';
  titleLogo.alt = 'Pigskin5 Logo';
}

// ==============================
// QUIZ FUNCTIONS
// ==============================

function getQuestionsForDate(dateStr) {
  const dayData = CALENDAR[dateStr];

  if (dayData && typeof dayData === 'object' && Array.isArray(dayData.questions)) {
    return dayData.questions;
  }

  return Array.isArray(dayData) ? dayData : [];
}

function renderQuestion() {
  answered = false;
  const q = QUESTIONS[current];

  questionEl.textContent = q.question;
  questionEl.style.whiteSpace = 'pre-line';

  progressEl.textContent = `Question ${current + 1} / ${QUESTIONS.length}`;

  if (progressFillEl && QUESTIONS.length > 0) {
    const completed = current;
    const ratio = completed / QUESTIONS.length;
    progressFillEl.style.transform = `scaleX(${ratio})`;
  }

  choicesEl.innerHTML = "";

  q.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.addEventListener("click", () => pickAnswer(i, q.answer));
    choicesEl.appendChild(btn);
  });

  startTimer(TIME_LIMIT);
}

function pickAnswer(i, correct) {
  if (answered) return;
  answered = true;

  const now = performance.now();
  const MAX_TIME = TIME_LIMIT || 15;

  let elapsed = (now - questionStartTime) / 1000;

  if (!Number.isFinite(elapsed) || elapsed < 0) elapsed = MAX_TIME;
  if (elapsed > MAX_TIME) elapsed = MAX_TIME;

  questionTimes.push(elapsed);

  stopTimer();

  const buttons = Array.from(choicesEl.querySelectorAll("button"));
  buttons.forEach(b => { b.disabled = true; });

  const correctAnswers = Array.isArray(correct) ? correct : [correct];
  const isCorrect = correctAnswers.includes(i);

  if (i !== null && typeof i === "number" && buttons[i]) {
    if (isCorrect) {
      buttons[i].classList.add("correct");
    } else {
      buttons[i].classList.add("wrong");
      correctAnswers.forEach(correctIdx => {
        if (buttons[correctIdx]) {
          buttons[correctIdx].classList.add("correct");
        }
      });
    }
  }

  let questionPoints = 0;
  if (isCorrect) {
    score++;
    const safeTimeLeft = Math.max(0, Number(timeLeft) || 0);
    questionPoints = 100 * safeTimeLeft;
    totalPoints += questionPoints;
  }

  picks.push({
    idx: current,
    pick: i,
    correct,
    elapsed,
    points: questionPoints,
    timeLeft: Math.max(0, Number(timeLeft) || 0),
  });

  // Keep session state current in case of mid-quiz refresh
  saveSessionState();

  setTimeout(() => {
    current++;

    if (current < QUESTIONS.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }, 700);
}

async function showStartScreen() {
  window.scrollTo(0, 0);

  document.body.classList.remove("no-scroll");
  document.body.classList.remove("hide-footer");
  document.body.classList.remove("quiz-active");
  document.body.classList.remove("results-active");
  document.body.classList.add("start-page");

  const runDate = getRunDateISO();
  // Check server for signed-in users first
  const serverAttempt = await getTodaysAttempt(runDate);
  if (serverAttempt) {
    // Sync to localStorage so the rest of the app stays consistent
    setAttempt(runDate);
    saveResult(runDate, serverAttempt);
    renderPersistedResult(runDate, serverAttempt);
    return;
  }
  
  // Anonymous users or first-time-today-on-this-device
  if (hasAttempt(runDate)) {
    showLockedGate(runDate);
    return;
  }

  document.querySelector(".college-badge")?.remove();
  document.querySelector(".title-wrap")?.classList.remove("title-wrap");

  startScreen.classList.remove("hidden");
  cardSec.classList.add("hidden");
  resultSec.classList.add("hidden");
  if (headerEl) headerEl.classList.add("hidden");
  if (timerEl) timerEl.style.display = "none";

  stopTimer();

  const user = await getCurrentUser();
  const leaderboardSection = document.getElementById("startLeaderboardSection");
  const adWrap = document.getElementById("startScreenAdWrap");

  if (user) {
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = "PLAY PIGSKIN5";
    }
    renderStartScorecard();
    renderStartLeaderboard(runDate);
    leaderboardSection?.classList.remove("hidden");
    adWrap?.classList.remove("hidden");
  } else {
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = "START";
    }
    document.getElementById("startScorecard")?.classList.add("hidden");
    leaderboardSection?.classList.add("hidden");
    adWrap?.classList.add("hidden");
  }

  const dayData = CALENDAR[runDate];
  const eventName = (dayData && typeof dayData === 'object') ? dayData.event : null;

  stopSnow();
  stopConfetti();
  stopHearts();

  if (eventName === "Christmas") {
    startSnow();
  }
  else if (eventName === "NYE") {
    startConfetti();
  }
  else if (eventName === "SUPERBOWL") {
    startConfetti();
  }
  else if (eventName === "ValentinesDay") {
    startHearts();
  }
}

// ==============================
// TAB-OUT / REFRESH PROTECTION
// ==============================

function isQuizInProgress() {
  return cardSec && !cardSec.classList.contains("hidden");
}

function saveSessionState() {
  try {
    sessionStorage.setItem(KEY_SESSION_DATE, RUN_DATE || "");
    sessionStorage.setItem(KEY_SESSION_PICKS, JSON.stringify(picks));
  } catch {}
}

function clearSessionState() {
  try {
    sessionStorage.removeItem(KEY_SESSION_DATE);
    sessionStorage.removeItem(KEY_SESSION_PICKS);
  } catch {}
}

// Fill any unanswered questions as "Not Attempted" and go straight to results.
// Called when the player tabs out or refreshes mid-quiz.
function forfeitAndFinish() {
  stopTimer();

  // Fill remaining questions as not attempted (pick: null, 0 points)
  for (let i = picks.length; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    picks.push({
      idx: i,
      pick: null,
      correct: q.answer,
      elapsed: TIME_LIMIT,
      points: 0
    });
    questionTimes.push(TIME_LIMIT);
  }

  // Recalculate score/totals from picks (answered questions already tallied)
  score = picks.filter(p => {
    const correct = Array.isArray(p.correct) ? p.correct : [p.correct];
    return correct.includes(p.pick);
  }).length;

  const totalTime = questionTimes.reduce((s, t) => s + (t || 0), 0);
  latestAvgTime = questionTimes.length ? totalTime / questionTimes.length : 0;

  clearSessionState();
  showResult();
}

// On page load: if the player has an attempt flag but no saved result,
// they must have refreshed/closed mid-quiz. Recover gracefully.
function recoverFromLimbo() {
  const runDate = getRunDateISO();
  if (!hasAttempt(runDate)) return false;   // never started
  if (loadResult(runDate)) return false;    // finished normally

  // They're stuck in limbo — reconstruct from whatever sessionStorage has
  RUN_DATE   = runDate;
  QUESTIONS  = getQuestionsForDate(runDate);

  let savedPicks = [];
  try {
    const raw = sessionStorage.getItem(KEY_SESSION_PICKS);
    savedPicks = raw ? JSON.parse(raw) : [];
  } catch {}

  // If they have zero answered questions, they likely got hit by the
  // visibility-change bug on launch. Clear the attempt and let them
  // play fresh instead of giving them an automatic 0/5.
  if (!Array.isArray(savedPicks) || savedPicks.length === 0) {
    try { localStorage.removeItem(KEY_ATTEMPT_PREFIX + runDate); } catch {}
    clearSessionState();
    return false;
  }

  picks         = savedPicks;
  score         = 0;
  totalPoints   = 0;
  questionTimes = picks.map(p => p.elapsed ?? TIME_LIMIT);

  // Recalculate running totals from the picks we recovered
  picks.forEach(p => {
    const correct = Array.isArray(p.correct) ? p.correct : [p.correct];
    if (correct.includes(p.pick)) {
      score++;
      totalPoints += (p.points || 0);
    }
  });

  // Fill the rest as "Not Attempted"
  for (let i = picks.length; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    picks.push({ idx: i, pick: null, correct: q.answer, elapsed: TIME_LIMIT, points: 0 });
    questionTimes.push(TIME_LIMIT);
  }

  const totalTime = questionTimes.reduce((s, t) => s + (t || 0), 0);
  latestAvgTime = questionTimes.length ? totalTime / questionTimes.length : 0;

  clearSessionState();
  saveResult(runDate, { score, picks, totalTime, avgTime: latestAvgTime, totalPoints });

  return true; // caller should now call showResult() / renderPersistedResult()
}

function _onVisibilityChange() {
  // Require at least 1 answered question before forfeiting.
  // Prevents instant 0/5 when a brief focus-loss (notification,
  // pull-to-refresh, address-bar animation) fires on game start.
  if (document.hidden && isQuizInProgress() && picks.length > 0) {
    document.removeEventListener("visibilitychange", _onVisibilityChange);
    window.removeEventListener("beforeunload", _onBeforeUnload);
    forfeitAndFinish();
  }
}

function _onBeforeUnload() {
  // Can't show UI during unload — just keep session picks current so
  // recoverFromLimbo() has accurate data on next page load.
  saveSessionState();
}

function startGame() {
  stopSnow();
  stopConfetti();

  document.body.classList.remove("start-page");
  document.body.classList.remove("no-scroll");
  document.body.classList.add("hide-footer");
  document.body.classList.add("quiz-active");

  RUN_DATE = getRunDateISO();
  if (hasAttempt(RUN_DATE)) {
    showLockedGate(RUN_DATE);
    return;
  }

  QUESTIONS = getQuestionsForDate(RUN_DATE);

  current = 0;
  score = 0;
  answered = false;
  picks = [];

  questionTimes = [];
  totalPoints = 0;
  latestAvgTime = 0;

  if (!Array.isArray(QUESTIONS) || QUESTIONS.length !== 5) {
    startScreen.classList.add("hidden");
    cardSec.classList.add("hidden");
    resultSec.classList.remove("hidden");
    headerEl?.classList.add("hidden");
    if (timerEl) timerEl.style.display = "none";
    scoreText.textContent = `No quiz scheduled for ${RUN_DATE}.`;
    reviewEl.innerHTML = `<div class="rev"><div class="q">Add a set for ${RUN_DATE} in questions.js</div></div>`;
    return;
  }

  startScreen.classList.add("hidden");
  resultSec.classList.add("hidden");
  cardSec.classList.remove("hidden");
  headerEl?.classList.remove("hidden");
  if (timerEl) timerEl.style.display = "block";

  setAttempt(RUN_DATE);
  computeAndSaveStreak(RUN_DATE);

  renderQuestion();

  // Persist in-progress state so a refresh can recover gracefully
  saveSessionState();

  // Tab-out: forfeit remaining questions and go straight to results.
  // Delay registration by 2s so brief focus-loss on game launch
  // (notifications, pull-to-refresh, address-bar animations) can't
  // instantly forfeit the quiz and lock the player out with 0/5.
  setTimeout(() => {
    if (isQuizInProgress()) {
      document.addEventListener("visibilitychange", _onVisibilityChange);
    }
  }, 2000);

  // Refresh / close: update session picks so recovery has latest data
  window.addEventListener("beforeunload", _onBeforeUnload);

  window.scrollTo({ top: 0, behavior: "instant" });
}

function showGuestPlayerCard(score, avgTime) {
  const existing = document.getElementById("profile-modal-container");
  if (existing) existing.remove();

  const tier = getTierForStreak(0);

  const container = document.createElement("div");
  container.id = "profile-modal-container";
  container.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    z-index: 999999; display: flex; align-items: center;
    justify-content: center; background: rgba(0,0,0,0.6);
  `;

  const card = document.createElement("div");
  card.className = "player-card";

  const body = document.createElement("div");
  body.className = "player-card__body";

  // Header
  const headerEl = document.createElement("div");
  headerEl.className = "player-card__header";
  const makeSideLines = () => {
    const wrap = document.createElement("div");
    wrap.className = "player-card__team-lines";
    const p = document.createElement("div");
    p.className = "player-card__team-line player-card__team-line--primary";
    const s = document.createElement("div");
    s.className = "player-card__team-line player-card__team-line--secondary";
    wrap.appendChild(p);
    wrap.appendChild(s);
    return wrap;
  };
  const tierEmojiEl = document.createElement("div");
  tierEmojiEl.className = "player-card__tier-emoji";
  tierEmojiEl.textContent = tier.emoji;
  headerEl.appendChild(makeSideLines());
  headerEl.appendChild(tierEmojiEl);
  headerEl.appendChild(makeSideLines());
  body.appendChild(headerEl);

  // Identity — CTA instead of name
  const nameEl = document.createElement("div");
  nameEl.className = "player-card__display-name";
  nameEl.textContent = "You earned this. Keep it.";
  body.appendChild(nameEl);

  // Stats from this session
  const accuracyPct = Math.round((score / 5) * 100);
  const touchdowns = score === 5 ? 1 : 0;
  const statsEl = document.createElement("div");
  statsEl.className = "player-card__stats";
  [
    ["1", "Quizzes"],
    [`${accuracyPct}%`, "Accuracy"],
    [String(touchdowns), touchdowns === 1 ? "Touchdown" : "Touchdowns"],
  ].forEach(([val, label]) => {
    const cell = document.createElement("div");
    cell.className = "player-card__stat";
    const v = document.createElement("div");
    v.className = "player-card__stat-value";
    v.textContent = val;
    const l = document.createElement("div");
    l.className = "player-card__stat-label";
    l.textContent = label;
    cell.appendChild(v);
    cell.appendChild(l);
    statsEl.appendChild(cell);
  });
  body.appendChild(statsEl);

  // Achievements — First Down unlocked, rest locked
  const achievementsEl = document.createElement("div");
  achievementsEl.className = "player-card__achievements";
  const badgeDescEl = document.createElement("div");
  badgeDescEl.className = "player-card__badge-desc";

  let activeBadge = null;
  ACHIEVEMENTS.forEach((achievement, i) => {
    const b = document.createElement("span");
    const unlocked = i === 0;
    b.className = unlocked
      ? "player-card__badge"
      : "player-card__badge player-card__badge--locked";
    b.textContent = unlocked ? achievement.emoji : "🔒";

    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activeBadge === b && badgeDescEl.textContent) {
        badgeDescEl.textContent = "";
        activeBadge = null;
        return;
      }
      activeBadge = b;
      const prefix = unlocked ? achievement.emoji : "🔒";
      badgeDescEl.textContent = `${prefix} ${achievement.name}: ${achievement.desc}`;
    });
    achievementsEl.appendChild(b);
  });
  body.appendChild(achievementsEl);
  badgeDescEl.textContent = `${ACHIEVEMENTS[0].emoji} ${ACHIEVEMENTS[0].name}: ${ACHIEVEMENTS[0].desc}`;
  body.appendChild(badgeDescEl);

  // Sign-in button
  const signInBtn = document.createElement("button");
  signInBtn.className = "btn";
  signInBtn.style.cssText = "width:100%; margin-top:6px;";
  signInBtn.textContent = "Sign In";
  body.appendChild(signInBtn);

  card.appendChild(body);
  container.appendChild(card);
  document.body.appendChild(container);

  const dismiss = () => {
    container.style.opacity = "0";
    container.style.transition = "opacity 0.2s";
    setTimeout(() => container.remove(), 200);
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => { if (e.key === "Escape") dismiss(); };

  const openAuth = () => { dismiss(); document.getElementById("signInBtn")?.click(); };
  signInBtn.addEventListener("click", openAuth);
  container.addEventListener("click", dismiss);
  container.addEventListener("touchend", dismiss);
  card.addEventListener("click", (e) => e.stopPropagation());
  card.addEventListener("touchend", (e) => e.stopPropagation());
  document.addEventListener("keydown", onKey);
}

async function showResult() {
  // Clean up tab-out/unload listeners — quiz is over
  document.removeEventListener("visibilitychange", _onVisibilityChange);
  window.removeEventListener("beforeunload", _onBeforeUnload);
  clearSessionState();

  document.body.classList.remove("start-page");
  document.body.classList.remove("no-scroll");
  document.body.classList.remove("hide-footer");
  document.body.classList.remove("quiz-active");
  document.body.classList.add("results-active");

  cardSec.classList.add("hidden");
  resultSec.classList.remove("hidden");
  headerEl?.classList.add("hidden");
  if (timerEl) timerEl.style.display = "none";

  void resultSec.offsetHeight;
  requestAnimationFrame(() => window.scrollTo(0, 0));

  if (score === QUESTIONS.length) {
    scoreText.textContent = `TOUCHDOWN! You got ${score} / ${QUESTIONS.length}!`;
    updateTouchdownStreak(RUN_DATE, true);

    if (typeof confetti === "function") {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  } else {
    scoreText.textContent = `You got ${score} / ${QUESTIONS.length} correct.`;
    updateTouchdownStreak(RUN_DATE, false);
  }

  reviewEl.innerHTML = "";

  picks.forEach(({ idx, pick, correct }) => {
    const q = (QUESTIONS && QUESTIONS[idx]) || {
      question: `Question ${idx + 1}`,
      choices: ["A", "B", "C", "D"],
      explanation: ""
    };

    const div = document.createElement("div");
    div.className = "rev";

    const qEl = document.createElement("div");
    qEl.className = "q";
    qEl.textContent = q.question ?? `Question ${idx + 1}`;

    const yourAnswerText =
      (pick === null || pick === undefined)
        ? "No answer"
        : (q.choices?.[pick] ?? `Choice ${Number(pick) + 1}`);

    const you = document.createElement("div");
    you.innerHTML = `Your answer: <strong>${yourAnswerText}</strong>`;

    const correctAnswers = Array.isArray(correct) ? correct : [correct];
    const correctTexts = correctAnswers.map(idx =>
      q.choices?.[idx] ?? `Choice ${Number(idx) + 1}`
    );
    const correctText = correctTexts.length > 1
      ? correctTexts.join(" OR ")
      : correctTexts[0];
    const cor = document.createElement("div");
    cor.innerHTML = `Correct: <strong>${correctText}</strong>`;

    const ex = document.createElement("div");
    ex.className = "ex";
    ex.textContent = q.explanation || "";

    if (correctAnswers.includes(pick)) {
      you.style.color = "#28a745";
      div.style.background = "rgba(40, 167, 69, 0.22)";
      div.style.border = "1px solid rgba(40, 167, 69, 0.45)";
    } else {
      you.style.color = "#ff4b6b";
      div.style.background = "rgba(255, 75, 107, 0.13)";
      div.style.border = "1px solid rgba(255, 75, 107, 0.4)";
    }

    div.append(qEl, you, cor, ex);
    reviewEl.appendChild(div);
  });

  const totalTime = questionTimes.reduce((sum, t) => sum + (t || 0), 0);
  const avgTime = questionTimes.length ? totalTime / questionTimes.length : 0;
  latestAvgTime = avgTime;

  let metricsEl = document.getElementById("metricsText");
  if (!metricsEl) {
    metricsEl = document.createElement("p");
    metricsEl.id = "metricsText";
    metricsEl.className = "metrics-text";
    scoreText.insertAdjacentElement("afterend", metricsEl);
  }

  metricsEl.innerHTML = `
  Avg answer time: ${avgTime.toFixed(1)}s per question<br>
  Total points: ${totalPoints.toLocaleString()}
  `;

  saveResult(RUN_DATE, { score, picks, totalTime, avgTime, totalPoints });

  const user = await getCurrentUser();

  // Update server-side streak on quiz completion, regardless of leaderboard submission
  if (user) {
    const didPerfect = score === QUESTIONS.length;

    (async () => {
      // RPC does proper date-based math server-side — avoids stale localStorage issues
      // where a cleared local streak would prevent the DB from ever incrementing.
      const { error: _streakErr2 } = await supabase.rpc("update_streaks_on_submit", { did_perfect: didPerfect, p_user_id: user.id });
      if (_streakErr2) console.error("update_streaks_on_submit failed:", _streakErr2);
      await refreshStreakCache();

      // Update longest_streak based on whatever the RPC set current_streak to
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile) return;

      const newLongest = Math.max(profile.longest_streak ?? 0, profile.current_streak ?? 0);
      if (newLongest !== (profile.longest_streak ?? 0)) {
        await supabase.from("profiles").update({ longest_streak: newLongest }).eq("id", user.id);
      }
    })().catch(() => {});
  }

  const guestDailyEntry  = user ? null : { points: totalPoints, avgTime };
  const guestWeeklyEntry = user ? null : { totalPoints, daysPlayed: 1 };

  renderLeaderboard(RUN_DATE, guestDailyEntry);

  const lbForm   = document.getElementById("leaderboardForm");
  const guestLbCta = document.getElementById("guestLeaderboardCta");

  if (!user) {
    lbForm?.classList.add("hidden");
    guestLbCta?.classList.remove("hidden");
    document.getElementById("guestLbSignInBtn")?.addEventListener("click", () => {
      document.getElementById("signInBtn")?.click();
    });
    showGuestPlayerCard(score, avgTime);
  } else {
    lbForm?.classList.remove("hidden");
    guestLbCta?.classList.add("hidden");

    if (hasSubmittedLeaderboard(RUN_DATE)) {
      if (leaderboardForm) {
        leaderboardForm.classList.add("submitted");
        const btn = leaderboardForm.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = "Score Submitted"; }
      }
    } else {
      (async () => {
        const user = await getCurrentUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();
        if (playerNameInput && profile?.username) {
          playerNameInput.value = profile.username;
        }
      })();
    }
  }

  initLeaderboardTabs(guestDailyEntry, guestWeeklyEntry);
  injectShareSummary();

  if (restartBtn) {
    restartBtn.style.display = "inline-block";
    restartBtn.textContent = "COME BACK TOMORROW";
    restartBtn.disabled = true;
    restartBtn.style.cursor = "default";
    restartBtn.style.opacity = "0.7";
  }
}

function injectShareSummary() {
  const resultTop = document.getElementById("result");
  if (!resultTop) return;

  resultTop.querySelectorAll(".share-header,.date-line").forEach(n => n.remove());

  const dateLine = document.createElement("div");
  dateLine.className = "date-line";
  dateLine.textContent = `Pigskin5 - ${RUN_DATE}`;
  resultTop.insertBefore(dateLine, resultTop.firstChild);

  const headerWrap = document.createElement("div");
  headerWrap.className = "share-header under-score";

  const leftRow = document.createElement("div");
  leftRow.className = "share-left-row";

let squares;
if (picks && picks.length > 0) {
  squares = picks.map(p => {
    const correctAnswers = Array.isArray(p.correct) ? p.correct : [p.correct];
    return correctAnswers.includes(p.pick) ? "🟩" : "⬜";
  }).join("");
} else {
  const persisted = loadResult(RUN_DATE);
  squares = persisted?.emojiScore || "⬜⬜⬜⬜⬜";
}
  const grid = document.createElement("div");
  grid.className = "share-grid";
  grid.textContent = squares;

  const shareBtn = document.createElement("button");
  shareBtn.id = "shareBtn";
  shareBtn.className = "share-btn";
  shareBtn.textContent = "Share";

  shareBtn.addEventListener("click", async () => {
    /* Track the raw button tap immediately */
    if (typeof gtag === "function") {
      gtag("event", "share_click", {
        event_category: "engagement",
        score: score,
        score_out_of: QUESTIONS.length
      });
    }

    const squaresNow = picks.map(p => {
      const correctAnswers = Array.isArray(p.correct) ? p.correct : [p.correct];
      return correctAnswers.includes(p.pick) ? "🟩" : "⬜";
    }).join("");

    const dailyStreak = getCachedDailyStreak();
    const tdStreak = getCachedTDStreak();
    const shareTier = getTierForStreak(dailyStreak);

    /* ── Rotating CTA pools by score tier ── */
    const CTA_PERFECT = [
      "\nThink you can go 5 for 5?",
      "\nI am BUILT DIFFERENT. Your turn.",
      "\nFlawless victory. Try me.",
      "\nProve you know ball too."
    ];
    const CTA_GOOD = [  // 3–4 correct
      "\nThink you know ball?",
      "\nProve you're not a casual.",
      "\nNFL brain check 🧠",
      "\nCan you beat my score?"
    ];
    const CTA_MID = [  // 1–2 correct
      "\nI need backup… you try.",
      "\nHumbling. Your turn though.",
      "\nDon't let me suffer alone...",
      "\nSurely you can beat this...",
      "\nLow bar. Go clear it."
    ];
    const CTA_ZERO = [
      "\nI do NOT know ball 🤦",
      "\nDown bad. Historically bad.",
      "\n0 for 5. I'm cooked 💀",
      "\nProof I should stop talking football.",
      "\nRock bottom looks like this."
    ];

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let cta;
    if (score === QUESTIONS.length) cta = pickRandom(CTA_PERFECT);
    else if (score >= 3)            cta = pickRandom(CTA_GOOD);
    else if (score >= 1)            cta = pickRandom(CTA_MID);
    else                            cta = pickRandom(CTA_ZERO);

    /* ── Build share text ── */
    const header = score === QUESTIONS.length
      ? `🏆 #Pigskin5 ${score}/${QUESTIONS.length} — ${RUN_DATE}`
      : `#Pigskin5 ${score}/${QUESTIONS.length} — ${RUN_DATE}`;

    const statsLine = `${totalPoints.toLocaleString()} pts · ${latestAvgTime.toFixed(1)}s avg`;
    const streakLine = `Daily Streak: ${shareTier.emoji} ${dailyStreak}`;
    const tdLine = score === QUESTIONS.length
      ? `Touchdown Streak: 🏈 ${tdStreak}\n`
      : "";

    const teamHashtag = (() => {
      const abbr = getCachedFavoriteTeam();
      return abbr ? NFL_TEAMS.get(abbr)?.hashtag : null;
    })();

    const shareText = [
      header,
      squaresNow,
      statsLine,
      streakLine,
      tdLine + cta,
      teamHashtag ? `${teamHashtag} | pigskin5.com` : "pigskin5.com"
    ].filter(Boolean).join("\n");

    /* ── Analytics: share event ── */
    const shareData = {
      event_category: "engagement",
      score: score,
      score_out_of: QUESTIONS.length,
      score_tier: score === QUESTIONS.length ? "perfect"
                : score >= 3 ? "good"
                : score >= 1 ? "mid" : "zero",
      daily_streak: dailyStreak,
      td_streak: Number(tdStreak),
      avg_time: Number(latestAvgTime.toFixed(1)),
      total_points: totalPoints,
      cta_used: cta
    };

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareText;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }

      showToast("Copied to clipboard");

      /* Track successful copy */
      if (typeof gtag === "function") {
        gtag("event", "share_copied", shareData);
      }

      if (navigator.share) {
        navigator.share({ text: shareText })
          .then(() => {
            if (typeof gtag === "function") {
              gtag("event", "share_native", { ...shareData, share_method: "native" });
            }
          })
          .catch(() => {
            /* User cancelled native share dialog — still copied */
            if (typeof gtag === "function") {
              gtag("event", "share_native_dismissed", shareData);
            }
          });
      }
    } catch (e) {
      console.error("Share failed:", e);
      showToast("Could not copy. Try manual paste.");
      if (typeof gtag === "function") {
        gtag("event", "share_failed", shareData);
      }
    }
  });

  leftRow.append(grid, shareBtn);

  const rightCol = document.createElement("div");
  rightCol.className = "share-right";

  const daily = document.createElement("div");
  daily.className = "pill";
  const currentStreak = getCachedDailyStreak();
  const tier = getTierForStreak(currentStreak);
  daily.textContent = `Daily Streak: ${tier.emoji} ${currentStreak}`;

  const td = document.createElement("div");
  td.className = "pill";
  td.textContent = `Touchdown Streak: ${localStorage.getItem("tdStreak") || 0}`;

  rightCol.append(daily, td);

  headerWrap.append(leftRow, rightCol);

  const anchor = document.getElementById("scoreText");
  if (anchor && anchor.parentNode) {
    anchor.parentNode.insertBefore(headerWrap, anchor.nextSibling);
  } else {
    const review = document.getElementById("review");
    if (review && review.parentNode) {
      review.parentNode.insertBefore(headerWrap, review);
    } else {
      resultTop.appendChild(headerWrap);
    }
  }
}

// ==============================
// INITIALIZATION
// ==============================

function init() {
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

  // If player refreshed mid-quiz, recover their partial result and show it
  if (recoverFromLimbo()) {
    renderPersistedResult(getRunDateISO(), loadResult(getRunDateISO()));
    return;
  }

  showStartScreen();

  leaderboardForm      = document.getElementById("leaderboardForm");
  playerNameInput      = document.getElementById("playerName");
  leaderboardWarningEl = document.getElementById("leaderboardWarning");
  leaderboardBody      = document.getElementById("leaderboardBody");

  let bar = document.querySelector(".progress-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "progress-bar";

    progressFillEl = document.createElement("div");
    progressFillEl.className = "progress-fill";
    bar.appendChild(progressFillEl);

    document.body.appendChild(bar);
  } else {
    progressFillEl = bar.querySelector(".progress-fill");
  }

  startBtn?.addEventListener("click", startGame);
  restartBtn?.addEventListener("click", showStartScreen);
  leaderboardForm?.addEventListener("submit", handleLeaderboardSubmit);

  showStartScreen();

  window.scrollTo(0, 0);

  const menuBtn = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  menuBtn?.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });
  refreshStreakCache();  // don't await — let it run in background
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

(function(){
  const helpBtn = document.getElementById('helpBtn');
  const menuBtn = document.getElementById('menuBtn');
  const howTo = document.getElementById('howTo');
  const menuDropdown = document.getElementById('menuDropdown');
  const result = document.getElementById('result');
  const topbar = document.getElementById('topbar');
  const restartBtn = document.getElementById('restartBtn');

  function showTopbar(show){
    if(!topbar) return;
    topbar.style.display = show ? 'flex' : 'none';
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

  helpBtn?.addEventListener('click', () => {
    if(!howTo) return;
    const isHidden = howTo.hidden;
    howTo.hidden = !isHidden;
    helpBtn.setAttribute('aria-expanded', String(isHidden));
    if(menuDropdown && !menuDropdown.hidden) {
      menuDropdown.hidden = true;
      menuBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  menuBtn?.addEventListener('click', () => {
    if(!menuDropdown) return;
    const isHidden = menuDropdown.hidden;
    menuDropdown.hidden = !isHidden;
    menuBtn.setAttribute('aria-expanded', String(isHidden));
    if(howTo && !howTo.hidden) {
      howTo.hidden = true;
      helpBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', (e) => {
    if(!menuDropdown && !howTo) return;

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

  const startBtn = document.getElementById('startBtn');
  startBtn?.addEventListener('click', () => {
    showTopbar(false);
  });

  const mo = new MutationObserver(() => {
    if(result && !result.classList.contains('hidden')){
      showTopbar(true);
    }
  });
  if(result) mo.observe(result, {
    attributes: true,
    attributeFilter: ['class']
  });

  restartBtn?.addEventListener('click', () => showTopbar(true));
})();

window.addEventListener("pageshow", () => {
  const onStartScreen = !document.getElementById("startScreen")?.classList.contains("hidden");
  if (!onStartScreen) {
    document.body.classList.remove("no-scroll");
  }
});

// Dev-only: call window.__devResetToday() in the browser console to wipe today's attempt
// and reload the start screen — works for both signed-in (clears Supabase row) and anonymous users.
window.__devResetToday = async function() {
  const date = getRunDateISO();
  localStorage.removeItem(KEY_ATTEMPT_PREFIX + date);
  localStorage.removeItem(KEY_RESULT_PREFIX + date);
  localStorage.removeItem(KEY_LB_SUBMIT_PREFIX + date);
  sessionStorage.clear();

  const user = await getCurrentUser();
  if (user) {
    const { error } = await supabase
      .from("quiz_attempts")
      .delete()
      .eq("user_id", user.id)
      .eq("quiz_date", date);
    if (error) { console.error("Supabase delete failed:", error); return; }
    console.log(`Deleted server attempt for ${user.email} on ${date}.`);
  } else {
    console.log(`Cleared local attempt for ${date} (anonymous).`);
  }

  await showStartScreen();
};