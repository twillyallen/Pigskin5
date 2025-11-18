import { CALENDAR } from "./questions.js?v=20250914c";

// ==============================
// Config 
// ==============================
const TIME_LIMIT = 15; // seconds per question
const KEY_ATTEMPT_PREFIX = "ft5_attempt_";
const KEY_RESULT_PREFIX  = "ft5_result_"; // stores {score, picks, totalTime, avgTime, totalPoints}
const KEY_LEADERBOARD    = "ps5_leaderboard_v1";
const KEY_LB_SUBMIT_PREFIX = "ps5_leaderboard_submit_";
const PROD_HOSTS = ["twillyallen.github.io", "pigskin5.com"];
const LEADERBOARD_API_URL = "https://script.google.com/macros/s/AKfycbxXp59rZDH5mp5elAFIt6T3DVI_4LM-mGVnTk7fg4LxlEu3HL1UQTMmo_VNgaS4CTQkvA/exec";

// Add restricted words here (case-insensitive) BAD WORDS ALERT
const BANNED_WORDS = [
   "Nigger",
   "Cunt",
   "Hitler"
];

function isProd() {
  return PROD_HOSTS.includes(location.hostname);
}
function hasAttempt(dateStr) {
  return localStorage.getItem(KEY_ATTEMPT_PREFIX + dateStr) === "1";
}
function setAttempt(dateStr) {
  localStorage.setItem(KEY_ATTEMPT_PREFIX + dateStr, "1");
}
function saveResult(dateStr, payload) {
  try { localStorage.setItem(KEY_RESULT_PREFIX + dateStr, JSON.stringify(payload)); } catch {}
}
function loadResult(dateStr) {
  try {
    const raw = localStorage.getItem(KEY_RESULT_PREFIX + dateStr);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

// --- State
let RUN_DATE = null;
let QUESTIONS = [];
let current = 0;
let score = 0;
let answered = false;
let picks = [];
let timerId = null;
let timeLeft = TIME_LIMIT;

// timing & scoring
let questionStartTime = 0; // when current question started
let questionTimes = [];    // seconds taken per question
let totalPoints = 0;       // leaderboard points for the run
let latestAvgTime = 0;     // store avg time from last run

// --- DOM refs
let startScreen, startBtn, cardSec, resultSec, questionEl, choicesEl;
let progressEl, timerEl, scoreText, reviewEl, restartBtn, headerEl;
let progressFillEl;
let leaderboardForm, playerNameInput, leaderboardWarningEl, leaderboardBody;

// ---------- Utilities ----------
function getRunDateISO() {

  // === DEV OVERRIDE ===
  // return "2025-11-23";   // Change this date to test
  // ====================

  const p = new URLSearchParams(window.location.search);
  const allowOverride = !isProd();
  if (allowOverride && p.has("date")) return p.get("date");

  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
  if (timerEl) timerEl.classList.remove("timer-danger");
}

function startTimer(seconds) {
  stopTimer();
  timeLeft = seconds;
  timerEl.textContent = `${timeLeft}s`;
  timerEl.classList.remove("timer-danger");

  // mark question start for metrics
  questionStartTime = performance.now();

  timerId = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `${timeLeft}s`;

    if (timeLeft <= 5 && timeLeft > 0) {
      timerEl.classList.add("timer-danger");
    }

    if (timeLeft <= 0) {
      stopTimer();
      pickAnswer(null, QUESTIONS[current].answer);
    }
  }, 1000);
}

// ---------- Date helpers ----------
function parseYMD(s) {
  const [y,m,d] = s.split("-").map(Number);
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

// ---------- Streak Counter (consecutive days) ----------
function computeAndSaveStreak(dateStr) {
  const KEY_STREAK = "dailyStreak";
  const KEY_LAST   = "dailyLastDate";

  const last = localStorage.getItem(KEY_LAST);
  let streak = parseInt(localStorage.getItem(KEY_STREAK) || "0", 10);

  // Prevent double-count if results re-render the same day
  if (last === dateStr) return streak;

  const yest = yesterdayOf(dateStr);
  if (!last) {
    streak = 1;
  } else if (last === yest) {
    streak = streak + 1;
  } else {
    streak = 1; // missed at least one day
  }

  localStorage.setItem(KEY_STREAK, String(streak));
  localStorage.setItem(KEY_LAST, dateStr);
  return streak;
}

// ---------- Touchdown Streak (5/5 only, consecutive days) ----------
function updateTouchdownStreak(dateStr, didPerfect) {
  const KEY_TD_STREAK = "tdStreak";
  const KEY_TD_LAST   = "tdLastDate";

  let streak = parseInt(localStorage.getItem(KEY_TD_STREAK) || "0", 10);
  const last = localStorage.getItem(KEY_TD_LAST);

  if (!didPerfect) {
    localStorage.setItem(KEY_TD_STREAK, "0");
    return 0;
  }

  if (last === dateStr) return streak; // already counted today

  const yest = yesterdayOf(dateStr);
  if (!last) {
    streak = 1;
  } else if (last === yest) {
    streak = streak + 1;
  } else {
    streak = 1; // missed day(s)
  }

  localStorage.setItem(KEY_TD_STREAK, String(streak));
  localStorage.setItem(KEY_TD_LAST, dateStr);
  return streak;
}

// ---------- Leaderboard helpers ----------
function sanitizeName(raw) {
  if (!raw) return null;
  let name = String(raw).trim();
  if (!name) return null;

  if (name.length > 20) name = name.slice(0, 20);

  const lower = name.toLowerCase();
  for (const bad of BANNED_WORDS) {
    if (!bad) continue;
    if (lower.includes(String(bad).toLowerCase())) {
      return null; // blocked by restricted words
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

function getLeaderboardForDate(dateStr) {
  const store = loadLeaderboardStore();
  return Array.isArray(store[dateStr]) ? store[dateStr] : [];
}

async function addLeaderboardEntry(dateStr, entry) {
  try {
    const body = new URLSearchParams();
    body.append("date", dateStr);
    body.append("name", entry.name);
    body.append("points", String(entry.points ?? 0));
    body.append("avgTime", String(entry.avgTime ?? 0));

    // no-cors + form-encoded body = no preflight, no CORS crash
    await fetch(LEADERBOARD_API_URL, {
      method: "POST",
      mode: "no-cors",
      body
    });

    // We can't read the response (opaque), but the row will be written.
  } catch (err) {
    console.error("Failed to submit leaderboard entry:", err);
  }
}


function fetchLeaderboardJSONP(dateStr) {
  return new Promise((resolve, reject) => {
    const callbackName = "ps5LbCallback_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

    window[callbackName] = (data) => {
      try {
        // clean up
        delete window[callbackName];
        script.remove();
        // Some error handlers send {ok:false,...}
        if (data && data.ok === false) {
          console.error("Leaderboard error:", data.error);
          reject(new Error(data.error || "Leaderboard error"));
        } else {
          resolve(data || []);
        }
      } catch (err) {
        reject(err);
      }
    };

    const script = document.createElement("script");
    script.src =
      LEADERBOARD_API_URL +
      "?date=" + encodeURIComponent(dateStr) +
      "&callback=" + encodeURIComponent(callbackName);

    script.onerror = (err) => {
      delete window[callbackName];
      script.remove();
      reject(err);
    };

    document.body.appendChild(script);
  });
}


function renderLeaderboard(dateStr) {
  if (!leaderboardBody) return;

  leaderboardBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  fetchLeaderboardJSONP(dateStr)
    .then(entries => {
      leaderboardBody.innerHTML = "";

      if (!Array.isArray(entries) || entries.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "No scores yet. Be the first!";
        tr.appendChild(td);
        leaderboardBody.appendChild(tr);
        return;
      }

      entries.forEach((e, idx) => {
        const tr = document.createElement("tr");

        const rankTd = document.createElement("td");
        rankTd.textContent = String(idx + 1);

        const nameTd = document.createElement("td");
        nameTd.textContent = e.name || "Anonymous";

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
      leaderboardBody.innerHTML =
        "<tr><td colspan='4'>Error loading leaderboard.</td></tr>";
    });
}



async function handleLeaderboardSubmit(evt) {
  evt.preventDefault();
  if (!RUN_DATE) return;

  // 🔒 hard guard: only allow ONE submission per day per browser
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
      leaderboardWarningEl.textContent =
        "Please enter a different name (no banned words).";
    }
    return;
  }

  const entry = {
    name,
    points: totalPoints,
    avgTime: latestAvgTime,
    createdAt: Date.now()
  };

  // Send to Google Sheets
  await addLeaderboardEntry(RUN_DATE, entry);

  // Refresh UI from cloud
  renderLeaderboard(RUN_DATE);

  // mark as submitted in memory + localStorage
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


// ---------- Locked Result ----------
function renderPersistedResult(dateStr, persisted) {
  RUN_DATE = dateStr;
  QUESTIONS = CALENDAR[RUN_DATE] || [];
  picks = Array.isArray(persisted?.picks) ? persisted.picks : [];
  score = Number.isFinite(persisted?.score) ? persisted.score : picks.filter(p => p && p.pick === p.correct).length;

  document.body.classList.remove("no-scroll");
  document.body.classList.remove("start-page");
  document.body.classList.remove("quiz-active");
  startScreen.classList.add("hidden");
  cardSec.classList.add("hidden");
  resultSec.classList.remove("hidden");
  headerEl?.classList.add("hidden");
  timerEl.style.display = "none";

  scoreText.textContent = `You got ${score} / ${QUESTIONS.length || 5} correct.`;

  // Safe review rendering with colors
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

    const correctText = q.choices?.[correct] ?? `Choice ${Number(correct) + 1}`;
    const cor = document.createElement("div");
    cor.innerHTML = `Correct: <strong>${correctText}</strong>`;

    const ex = document.createElement("div");
    ex.className = "ex";
    ex.textContent = q.explanation ?? "";

    if (pick === correct) {
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

  // restore metrics if we have them
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
    metricsEl.textContent =
      `Avg answer time: ${persisted.avgTime.toFixed(1)}s per question · Total points: ${persisted.totalPoints.toLocaleString()}`;
  }

  renderLeaderboard(RUN_DATE);

  if (restartBtn) {
    restartBtn.style.display = "inline-block";
    restartBtn.textContent = "COME BACK TOMORROW!";
    restartBtn.disabled = true;
    restartBtn.style.cursor = "default";
    restartBtn.style.opacity = "0.7";
  }

  injectShareSummary();
}

// ---------- Locked Gate ----------
function showLockedGate(dateStr) {
  const persisted = loadResult(dateStr);
  if (persisted) {
    renderPersistedResult(dateStr, persisted);
    return;
  }

  document.body.classList.remove("no-scroll");
  document.body.classList.remove("start-page");
  document.body.classList.remove("quiz-active");
  startScreen.classList.add("hidden");
  cardSec.classList.add("hidden");
  resultSec.classList.remove("hidden");
  headerEl?.classList.add("hidden");
  timerEl.style.display = "none";
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
function showStartScreen() {
  // Start page state
  document.body.classList.remove("no-scroll");
  document.body.classList.remove("hide-footer");
  document.body.classList.remove("quiz-active");
  document.body.classList.add("start-page");

  const runDate = getRunDateISO();
  if (hasAttempt(runDate)) {
    showLockedGate(runDate);
    return;
  }

  // --- Add College Edition badge on Saturdays ---
  const now = new Date();                     // use actual date
  const isSaturday = now.getDay() === 6;      // Sunday=0 ... Saturday=6
  const titleEl = document.querySelector(".game-title");

  // Clean up any previous badge safely
  document.querySelector(".college-badge")?.remove();

  if (isSaturday && titleEl) {
    // Wrap the title so badge can be positioned relative to it
    let wrap = titleEl.closest(".title-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "title-wrap";
      titleEl.parentNode.insertBefore(wrap, titleEl);
      wrap.appendChild(titleEl);
    }

    // Create and attach badge image
    const badge = document.createElement("img");
    badge.className = "college-badge";
    badge.src = "./college.png";      // ensure college.png is in same folder as index.html
    badge.alt = "College Edition";
    wrap.appendChild(badge);
  }

  // --- Show Start Screen ---
  startScreen.classList.remove("hidden");
  cardSec.classList.add("hidden");
  resultSec.classList.add("hidden");
  if (headerEl) headerEl.classList.add("hidden");
  timerEl.style.display = "none";
  stopTimer();

  startBtn.disabled = false;
  startBtn.textContent = "START";
}

function startGame() {
  // Leaving start screen; hide footer during gameplay
  document.body.classList.remove("start-page");
  document.body.classList.remove("no-scroll");
  document.body.classList.add("hide-footer");
  document.body.classList.add("quiz-active");

  RUN_DATE = getRunDateISO();
  if (hasAttempt(RUN_DATE)) {
    showLockedGate(RUN_DATE);
    return;
  }

  QUESTIONS = CALENDAR[RUN_DATE];

  current = 0;
  score = 0;
  answered = false;
  picks = [];

  // reset metrics
  questionTimes = [];
  totalPoints = 0;
  latestAvgTime = 0;

  if (!Array.isArray(QUESTIONS) || QUESTIONS.length !== 5) {
    startScreen.classList.add("hidden");
    cardSec.classList.add("hidden");
    resultSec.classList.remove("hidden");
    headerEl?.classList.add("hidden");
    timerEl.style.display = "none";
    scoreText.textContent = `No quiz scheduled for ${RUN_DATE}.`;
    reviewEl.innerHTML = `<div class="rev"><div class="q">Add a set for ${RUN_DATE} in questions.js</div></div>`;
    return;
  }

  startScreen.classList.add("hidden");
  resultSec.classList.add("hidden");
  cardSec.classList.remove("hidden");
  headerEl?.classList.remove("hidden");
  timerEl.style.display = "block";

  setAttempt(RUN_DATE);
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "instant" }); // auto scroll fix
}

function showResult() {
  document.body.classList.remove("start-page");
  document.body.classList.remove("no-scroll");
  document.body.classList.remove("hide-footer");
  document.body.classList.remove("quiz-active");

  cardSec.classList.add("hidden");
  resultSec.classList.remove("hidden");
  headerEl?.classList.add("hidden");
  timerEl.style.display = "none";

  // Force layout flush, then scroll to top so nothing hides behind footer
  void resultSec.offsetHeight;
  requestAnimationFrame(() => window.scrollTo(0, 0));

  if (score === QUESTIONS.length) {
    scoreText.textContent = `TOUCHDOWN! You got ${score} / ${QUESTIONS.length}!`;
    updateTouchdownStreak(RUN_DATE, true);

    // Confetti (requires canvas-confetti script on the page)
    if (typeof confetti === "function") {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  } else {
    scoreText.textContent = `You got ${score} / ${QUESTIONS.length} correct.`;
    updateTouchdownStreak(RUN_DATE, false);
  }

  // Safe review rendering WITH colors (fixes your bug)
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

    const correctText = q.choices?.[correct] ?? `Choice ${Number(correct) + 1}`;
    const cor = document.createElement("div");
    cor.innerHTML = `Correct: <strong>${correctText}</strong>`;

    const ex = document.createElement("div");
    ex.className = "ex";
    ex.textContent = q.explanation || "";

    if (pick === correct) {
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

  // ---- Performance metrics ----
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
  metricsEl.textContent =
    `Avg answer time: ${avgTime.toFixed(1)}s per question · Total points: ${totalPoints.toLocaleString()}`;

  // Save everything, including metrics, for potential future use
  saveResult(RUN_DATE, { score, picks, totalTime, avgTime, totalPoints });

  renderLeaderboard(RUN_DATE);
  injectShareSummary();

  if (restartBtn) {
    restartBtn.style.display = "inline-block";
    restartBtn.textContent = "COME BACK TOMORROW";
    restartBtn.disabled = true;
    restartBtn.style.cursor = "default";
    restartBtn.style.opacity = "0.7";
  }
}

// ---------- Quiz ----------
function renderQuestion() {
  answered = false;
  const q = QUESTIONS[current];
  questionEl.textContent = q.question;
  progressEl.textContent = `Question ${current + 1} / ${QUESTIONS.length}`;

  // update progress bar – how many questions are COMPLETED
  if (progressFillEl && QUESTIONS.length > 0) {
    const completed = current; // 0 on Q1, 1 on Q2, etc.
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

  // --- timing: how long this question took ---
  const now = performance.now();
  const MAX_TIME = TIME_LIMIT || 15;
  let elapsed = (now - questionStartTime) / 1000;
  if (!Number.isFinite(elapsed) || elapsed < 0) elapsed = MAX_TIME;
  if (elapsed > MAX_TIME) elapsed = MAX_TIME;
  questionTimes.push(elapsed);
  // ------------------------------------------

  stopTimer();

  const buttons = Array.from(choicesEl.querySelectorAll("button"));
  buttons.forEach(b => { b.disabled = true; });

  if (typeof correct === "number" && buttons[correct]) {
    buttons[correct].classList.add("correct");
  }
  if (i !== null && i !== correct && typeof i === "number" && buttons[i]) {
    buttons[i].classList.add("wrong");
  }

  // scoring:
  // - score = # of correct answers
  // - totalPoints = leaderboard points (100 * seconds remaining on correct)
  let questionPoints = 0;
  if (i === correct) {
    score++;
    const safeTimeLeft = Math.max(0, Number(timeLeft) || 0);
    questionPoints = 100 * safeTimeLeft;   // e.g. 7s left => 700 pts
    totalPoints += questionPoints;
  }

  // store per-question info
  picks.push({ idx: current, pick: i, correct, elapsed, points: questionPoints });

  setTimeout(() => {
    current++;
    if (current < QUESTIONS.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }, 700);
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

// ---------- Share + Streak ----------
function injectShareSummary() {
  const resultTop = document.getElementById("result");
  if (!resultTop) return;

  resultTop.querySelectorAll(".share-header,.date-line").forEach(n => n.remove());

  const dateLine = document.createElement("div");
  dateLine.className = "date-line";
  dateLine.textContent = `Pigskin 5 - ${RUN_DATE}`;
  resultTop.insertBefore(dateLine, resultTop.firstChild);

  // Build header (sits under "Your Score")
  const headerWrap = document.createElement("div");
  headerWrap.className = "share-header under-score";

  const leftRow = document.createElement("div");
  leftRow.className = "share-left-row";

  const squares = picks.map(p => (p.pick === p.correct ? "🟩" : "⬜")).join("");
  const grid = document.createElement("div");
  grid.className = "share-grid";
  grid.textContent = squares;

  const shareBtn = document.createElement("button");
  shareBtn.id = "shareBtn";
  shareBtn.className = "share-btn";
  shareBtn.textContent = "Share";
  shareBtn.addEventListener("click", async () => {
    const squaresNow = picks.map(p => (p.pick === p.correct ? "🟩" : "⬜")).join("");
    // Check for 5/5
    let shareText;
    if (score === QUESTIONS.length) {
      shareText = `I Scored a Touchdown! ${squaresNow}\n\nhttps://pigskin5.com\n\n@TwillysTakes on X!`;
    } else {
      shareText = `I scored ${squaresNow} in Pigskin 5!\n\nhttps://pigskin5.com\n\n@TwillysTakes on X!`;
    }
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
      if (navigator.share) navigator.share({ text: shareText }).catch(() => {});
    } catch (e) {
      console.error("Share failed:", e);
      showToast("Could not copy. Try manual paste.");
    }
  });

  leftRow.append(grid, shareBtn);

  // Streaks Tags
  const rightCol = document.createElement("div");
  rightCol.className = "share-right";

  const daily = document.createElement("div");
  daily.className = "pill";
  daily.textContent = `Daily Streak: ${computeAndSaveStreak(RUN_DATE)}`;

  const td = document.createElement("div");
  td.className = "pill";
  td.textContent = `Touchdown Streak: ${localStorage.getItem("tdStreak") || 0}`;

  rightCol.append(daily, td);

  headerWrap.append(leftRow, rightCol);

  // ---- Insert header directly under the "Your Score" line ----
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

// ---------- Init ----------
function init() {
  startScreen = document.getElementById("startScreen");
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

  leaderboardForm      = document.getElementById("leaderboardForm");
  playerNameInput      = document.getElementById("playerName");
  leaderboardWarningEl = document.getElementById("leaderboardWarning");
  leaderboardBody      = document.getElementById("leaderboardBody");

  // Build bottom progress bar once
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

  const menuBtn = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  menuBtn?.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ---- Header controls (help/about) ----
(function(){
  const helpBtn = document.getElementById('helpBtn');
  const howTo = document.getElementById('howTo');
  const result = document.getElementById('result');
  const topbar = document.getElementById('topbar');
  const restartBtn = document.getElementById('restartBtn');

  function showTopbar(show){
    if(!topbar) return;
    topbar.style.display = show ? 'flex' : 'none';
    // Hide howto when hiding the topbar
    if(!show && howTo) { howTo.hidden = true; helpBtn?.setAttribute('aria-expanded','false'); }
  }

  // Toggle How-to panel
  helpBtn?.addEventListener('click', () => {
    if(!howTo) return;
    const isHidden = howTo.hidden;
    howTo.hidden = !isHidden;
    helpBtn.setAttribute('aria-expanded', String(isHidden));
  });

  // Hide header when game starts; show again on results
  const startBtn = document.getElementById('startBtn');
  startBtn?.addEventListener('click', () => {
    showTopbar(false);
  });

  // Observe result section to re-show topbar
  const mo = new MutationObserver(() => {
    if(result && !result.classList.contains('hidden')){
      showTopbar(true);
    }
  });
  if(result) mo.observe(result, { attributes: true, attributeFilter: ['class'] });

  // On restart, header should be visible (back to start screen)
  restartBtn?.addEventListener('click', () => showTopbar(true));
})();

// --- Safety: ensure no stray scroll locks on non-start screens (e.g., Results refresh)
window.addEventListener("pageshow", () => {
  const onStartScreen = !document.getElementById("startScreen")?.classList.contains("hidden");
  if (!onStartScreen) {
    document.body.classList.remove("no-scroll");
  }
});
