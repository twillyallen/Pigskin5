// modules/rivalry-ui.js
// All rivalry UI: home card, modal, detail view, quiz overlay, results screen.

// ── TEST MODE: flip to true to see series-end screen after just 1 quiz ──────
const RIVALRY_TEST_ONE_QUIZ = false;

import { getCurrentUser } from "./supabase-client.js";
import {
  createRivalryChallenge,
  getUserRivalries,
  getRivalry,
  getRivalryAlltime,
  getRivalryChallenge,
  getTodayRivalryQuestions,
  submitRivalryScore,
  hasPlayedToday,
  forfeitRivalry,
  acceptChallenge,
  declineChallenge,
  getRivalryViewModel,
  trackerToEmoji,
  getTodayUTC,
  getRivalryQuestionsForDate,
  checkRivalryAchievements,
} from "./rivalry.js";

// ✏️ TAUNT PRESETS — Add, edit, or remove taunts here freely
const TAUNT_PRESETS = [
  "Think you know more about football than me? Prove it.",
  "I'm living rent-free in your head AND your standings.",
  "Clock's ticking. My score isn't going to beat itself.",
  "Even my wrong answers were more confident than you.",
  "Your rivalry slot is about to become a loss trophy.",
  "I played. You're up. Don't embarrass yourself",
  "This rivalry is starting to feel a little one-sided...",
  "Wanna let me win AGAIN?",
  "Touch grass or touch the leaderboard — your choice.",
  "Quit ducking me.",
  "Now let's see your score 😷",
  "Took me like 2 minutes. You have no excuse.",
  "Easy Peasy. Lemon Squeezy. Your move.",
  "Don't embarrass yourself this time.",
  "I showed up today. Will you?",
  "No pressure. (There's pressure)",
  "This Rivalry won't settle itself.",
  "Yeahhh just give up now, it's fine.",
  "Don't blow it...",
  "Still waiting...",


];

function _buildTauntText(scoreStr) {
  const preset = TAUNT_PRESETS[Math.floor(Math.random() * TAUNT_PRESETS.length)];
  return `${preset} I scored ${scoreStr} today. Your move: https://pigskin5.com/?modal=rivalries`;
}

async function _copyTaunt(scoreStr) {
  const text = _buildTauntText(scoreStr);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    showToast("Taunt copied! 🔥");
  } catch {
    showToast("Could not copy. Try again.");
  }
}

const TIME_LIMIT = 15;

function testModePatchRivalries(rivalries) {
  if (!RIVALRY_TEST_ONE_QUIZ) return rivalries;
  return rivalries.map(r => {
    if (r.status === "active" && ((r.player1_wins || 0) > 0 || (r.player2_wins || 0) > 0)) {
      return {
        ...r,
        status: "complete",
        winner_id: (r.player1_wins || 0) >= (r.player2_wins || 0) ? r.player1_id : r.player2_id,
      };
    }
    return r;
  });
}

// A completed/forfeited rivalry stays in the Active section until midnight UTC
// on the day it finished, giving both players time to see the result graphic.
function isDisplayActive(r) {
  if (r.status === "active") return true;
  if (r.status === "complete" || r.status === "forfeit") {
    const games = r.games || [];
    if (!games.length) return false;
    const lastGameDate = games
      .map(g => g.game_date)
      .sort()
      .at(-1);
    return lastGameDate === getTodayUTC();
  }
  return false;
}

// ── Utility ───────────────────────────────────────────────

function showToast(msg, dur = 2800) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = `
      position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:rgba(30,30,30,0.96);color:#fff;padding:10px 22px;
      border-radius:12px;font-size:14px;font-weight:600;z-index:9999;
      pointer-events:none;transition:opacity 0.3s;`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => { t.style.opacity = "0"; }, dur);
}

function closeAllModals() {
  document.querySelectorAll(".rivalry-modal-overlay").forEach(el => el.remove());
}

function displayName(profile) {
  return profile?.username || "Unknown";
}

// ── Home Screen Rivalry Card ──────────────────────────────

export async function renderRivalryCard(container, inline = false) {
  const user = await getCurrentUser();
  const cardId = inline ? "rivalryCardResult" : "rivalryCard";

  let card = document.getElementById(cardId);
  if (!card) {
    card = document.createElement("div");
    card.id = cardId;
    if (inline) {
      card.style.cssText = `width:100%;margin-top:16px;cursor:pointer;`;
      container.insertAdjacentElement("afterend", card);
    } else {
      card.style.cssText = `max-width:480px;margin:16px auto 0;cursor:pointer;`;
      const startBtn = document.getElementById("startBtn");
      if (startBtn) {
        startBtn.insertAdjacentElement("afterend", card);
      } else {
        container.appendChild(card);
      }
    }
  }

  if (!user) {
    card.innerHTML = `
      <div class="rivalry-card-inner" style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:16px 18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-weight:800;font-size:15px;">Rivalries</span>
        </div>
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0;">
          <a href="#" id="rivalrySignInLink" style="color:#60a5fa;font-weight:700;">Sign in</a> to challenge friends!
        </p>
      </div>`;
    card.querySelector("#rivalrySignInLink")?.addEventListener("click", e => {
      e.preventDefault();
      document.getElementById("signInBtn")?.click();
    });
    return;
  }

  const { rivalries: _rivalries } = await getUserRivalries(user.id);
  const rivalries = testModePatchRivalries(_rivalries);
  const active = rivalries.filter(isDisplayActive);
  const history = rivalries.filter(r => !isDisplayActive(r));

  const activeCount = active.length;
  const today = getTodayUTC();

  let pendingCount = 0;
  let rowsHtml = "";
  for (const r of active) {
    const vm = getRivalryViewModel(r, user.id);
    const iAm1 = r.player1_id === user.id;
    const todayGame = (r.games || []).find(g => g.game_date === today);
    const myScore    = todayGame ? (iAm1 ? todayGame.player1_score : todayGame.player2_score) : null;
    const theirScore = todayGame ? (iAm1 ? todayGame.player2_score : todayGame.player1_score) : null;
    const theyPlayed = theirScore !== null && theirScore !== undefined;
    const iPlayed    = myScore   !== null && myScore   !== undefined;
    const needsPlay  = theyPlayed && !iPlayed;
    if (needsPlay) pendingCount++;

    const colorMap = { winning: "#22c55e", tied: "#f59e0b", losing: "#ef4444" };
    const color = colorMap[vm.statusClass] || "#fff";
    const bars = vm.tracker.map(s => {
      const bg = s === "win" ? "#22c55e" : s === "loss" ? "#ef4444" : "rgba(255,255,255,0.15)";
      return `<div style="flex:1;height:5px;border-radius:3px;background:${bg};"></div>`;
    }).join("");

    const waitingOnRival = iPlayed && !theyPlayed;
    const badge = needsPlay
      ? `<span style="display:inline-block;background:#ef4444;color:#fff;font-size:10px;
             font-weight:900;border-radius:99px;padding:1px 7px;margin-left:6px;
             vertical-align:middle;letter-spacing:.02em;">YOUR TURN</span>`
      : waitingOnRival
      ? `<span style="display:inline-block;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.5);font-size:10px;
             font-weight:700;border-radius:99px;padding:1px 7px;margin-left:6px;
             vertical-align:middle;letter-spacing:.02em;">Waiting…</span>`
      : "";

    rowsHtml += `
      <div class="rivalry-row" data-id="${r.id}" style="
          border-top:1px solid rgba(255,255,255,0.08);padding:10px 0 4px;cursor:pointer;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:700;">vs ${displayName(vm.them)}${badge}</span>
          <span style="font-size:13px;font-weight:800;color:${color};">
            ${vm.myWins}-${vm.theirWins} · ${vm.statusText}
          </span>
        </div>
        <div style="display:flex;gap:3px;margin-top:6px;">${bars}</div>
      </div>`;
  }

  const newBtn = `
    <div id="startNewRivalryBtn" style="
        margin-top:12px;font-size:13px;color:#60a5fa;font-weight:700;cursor:pointer;">
      + Start a new rivalry
    </div>`;

  const emptyMsg = active.length === 0
    ? `<p style="font-size:13px;color:rgba(255,255,255,0.45);margin:4px 0 8px;">
         You have no rivals! Start a new rivalry!
       </p>`
    : "";

  const headerBadge = pendingCount > 0
    ? `<span style="display:inline-flex;align-items:center;justify-content:center;
           background:#ef4444;color:#fff;font-size:11px;font-weight:900;
           border-radius:99px;min-width:20px;height:20px;padding:0 6px;margin-left:6px;">
         ${pendingCount}
       </span>`
    : "";

  card.innerHTML = `
    <div class="rivalry-card-inner" style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:16px 18px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-weight:800;font-size:15px;display:flex;align-items:center;">Rivalries${headerBadge}</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.45);font-weight:700;">
          ${activeCount} of 5
        </span>
      </div>
      ${emptyMsg}
      ${rowsHtml}
      ${newBtn}
    </div>`;

  card.querySelector(".rivalry-card-inner")?.addEventListener("click", () => {
    openRivalryModal();
  });
}

// ── Rivalry Modal ─────────────────────────────────────────

export async function openRivalryModal(focusRivalryId = null, startNew = false) {
  closeAllModals();
  const user = await getCurrentUser();
  if (!user) { document.getElementById("signInBtn")?.click(); return; }

  const overlay = document.createElement("div");
  overlay.className = "rivalry-modal-overlay";
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9000;
    display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px;`;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background:#1a1a1a;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5);
    width:min(480px,calc(100vw - 40px));margin:auto;padding:32px 24px;
    position:relative;`;

  modal.innerHTML = `
    <button class="auth-close" style="position:absolute;top:14px;right:16px;
      background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1;">×</button>
    <h2 style="margin:0 0 18px;font-size:20px;text-align:center;">Rivalries</h2>
    <div id="rivalryModalBody">
      <div style="text-align:center;color:rgba(255,255,255,0.5);padding:20px 0;">Loading…</div>
    </div>`;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const closeModal = () => {
    overlay.remove();
    document.body.style.overflow = "";
    const card = document.getElementById("rivalryCard");
    if (card?.parentElement) renderRivalryCard(card.parentElement);
  };
  overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
  modal.querySelector(".auth-close").addEventListener("click", closeModal);

  const body = modal.querySelector("#rivalryModalBody");

  const { rivalries: _rivalries } = await getUserRivalries(user.id);
  const rivalries = testModePatchRivalries(_rivalries);
  const active  = rivalries.filter(isDisplayActive);
  const history = rivalries.filter(r => !isDisplayActive(r));

  if (focusRivalryId) {
    renderRivalryDetail(body, focusRivalryId, user.id, overlay);
    return;
  }

  if (startNew) {
    renderStartNewRivalry(body, user.id, overlay);
    return;
  }

  renderModalList(body, active, history, user.id, overlay);
}

function renderModalList(body, active, history, userId, overlay) {
  let html = "";

  if (active.length === 0) {
    html += `<p style="color:rgba(255,255,255,0.45);text-align:center;font-size:14px;margin:0 0 16px;">
               You have no active rivalries.
             </p>`;
  } else {
    html += `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;
                color:rgba(255,255,255,0.4);margin:0 0 10px;">Active</h3>`;
  }

  body.innerHTML = html;

  const today = getTodayUTC();
  for (const r of active) {
    const vm = getRivalryViewModel(r, userId);
    const iAm1 = r.player1_id === userId;
    const todayGame  = (r.games || []).find(g => g.game_date === today);
    const myScore    = todayGame ? (iAm1 ? todayGame.player1_score : todayGame.player2_score) : null;
    const theirScore = todayGame ? (iAm1 ? todayGame.player2_score : todayGame.player1_score) : null;
    const needsPlay      = (theirScore !== null && theirScore !== undefined) && (myScore === null || myScore === undefined);
    const waitingOnRival = (myScore !== null && myScore !== undefined) && (theirScore === null || theirScore === undefined);

    const colorMap = { winning: "#22c55e", tied: "#f59e0b", losing: "#ef4444" };
    const color = colorMap[vm.statusClass] || "#fff";
    const row = document.createElement("div");
    row.style.cssText = `
      display:flex;justify-content:space-between;align-items:center;
      padding:12px 14px;background:rgba(255,255,255,0.05);border-radius:12px;
      margin-bottom:8px;cursor:pointer;border:1px solid ${needsPlay ? "rgba(239,68,68,0.5)" : waitingOnRival ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.07)"};`;
    row.innerHTML = `
      <div>
        <div style="font-weight:700;font-size:15px;display:flex;align-items:center;gap:7px;">
          vs ${displayName(vm.them)}
          ${needsPlay ? `<span style="background:#ef4444;color:#fff;font-size:10px;font-weight:900;
              border-radius:99px;padding:1px 7px;letter-spacing:.02em;">YOUR TURN</span>` : ""}
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-top:2px;">
          ${trackerToEmoji(vm.tracker)}
        </div>
        ${waitingOnRival ? `<div style="font-size:11px;color:rgba(96,165,250,0.7);font-weight:700;margin-top:3px;">
          Waiting on Rival's move…
        </div>` : ""}
      </div>
      <div style="text-align:right;">
        <div style="font-weight:800;font-size:16px;color:${color};">
          ${vm.myWins}–${vm.theirWins}
        </div>
        <div style="font-size:12px;color:${color};">${vm.statusText}</div>
      </div>`;
    row.addEventListener("click", () => renderRivalryDetail(body, r.id, userId, overlay));
    body.appendChild(row);
  }

  // Start new button
  const newBtn = document.createElement("button");
  newBtn.textContent = "+ Start a New Rivalry";
  newBtn.style.cssText = `
    display:block;width:100%;margin-top:12px;padding:14px;
    background:rgba(96,165,250,0.15);border:1px solid rgba(96,165,250,0.4);
    border-radius:12px;color:#60a5fa;font-weight:800;font-size:15px;cursor:pointer;`;
  newBtn.addEventListener("click", () => renderStartNewRivalry(body, userId, overlay));
  body.appendChild(newBtn);

  if (history.length > 0) {
    const histHeader = document.createElement("h3");
    histHeader.style.cssText = `font-size:13px;text-transform:uppercase;letter-spacing:.08em;
      color:rgba(255,255,255,0.4);margin:20px 0 10px;`;
    histHeader.textContent = "History";
    body.appendChild(histHeader);

    const HISTORY_LIMIT = 3;
    const visible = history.slice(0, HISTORY_LIMIT);
    const hidden  = history.slice(HISTORY_LIMIT);

    function buildHistoryRow(r) {
      const vm = getRivalryViewModel(r, userId);
      const won = r.winner_id === userId;
      const endLabel = r.status === "mutual_miss"
        ? "You failed each other..."
        : r.status === "forfeit"
          ? (won ? `Won — ${displayName(vm.them)} forfeited` : `${displayName(vm.them)} wins by forfeit`)
          : (won ? "You won" : "You Lost");
      const row = document.createElement("div");
      row.style.cssText = `
        display:flex;justify-content:space-between;align-items:center;
        padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:12px;
        margin-bottom:6px;border:1px solid rgba(255,255,255,0.05);cursor:pointer;
        opacity:${r.status === "mutual_miss" ? 0.5 : 1};`;
      row.innerHTML = `
        <div>
          <div style="font-weight:700;font-size:14px;color:rgba(255,255,255,0.7);">
            vs ${displayName(vm.them)}
          </div>
          <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:2px;">${endLabel}</div>
        </div>
        <div style="font-weight:800;font-size:15px;color:rgba(255,255,255,0.5);">
          ${vm.myWins}–${vm.theirWins}
        </div>`;
      row.addEventListener("click", () => renderRivalryDetail(body, r.id, userId, overlay));
      return row;
    }

    for (const r of visible) body.appendChild(buildHistoryRow(r));

    if (hidden.length > 0) {
      const showMore = document.createElement("button");
      showMore.textContent = `Show ${hidden.length} more…`;
      showMore.style.cssText = `
        background:none;border:none;color:rgba(255,255,255,0.35);
        font-size:13px;font-weight:700;cursor:pointer;padding:4px 0;
        display:block;margin-top:2px;`;
      showMore.addEventListener("click", () => {
        for (const r of hidden) body.insertBefore(buildHistoryRow(r), showMore);
        showMore.remove();
      });
      body.appendChild(showMore);
    }
  }
}

// ── Rivalry Detail View ───────────────────────────────────

async function renderRivalryDetail(body, rivalryId, userId, overlay) {
  body.innerHTML = `<div style="text-align:center;color:rgba(255,255,255,0.5);padding:20px 0;">Loading…</div>`;

  const [{ rivalry }, alltime] = await Promise.all([
    getRivalry(rivalryId),
    (async () => {
      const { rivalry: r } = await getRivalry(rivalryId);
      if (!r) return null;
      return getRivalryAlltime(r.player1_id, r.player2_id);
    })(),
  ]);

  if (!rivalry) { body.innerHTML = `<p style="color:#ef4444;">Rivalry not found.</p>`; return; }

  if (RIVALRY_TEST_ONE_QUIZ && rivalry.status === "active") {
    if ((rivalry.player1_wins || 0) > 0 || (rivalry.player2_wins || 0) > 0) {
      rivalry.status = "complete";
      rivalry.winner_id = (rivalry.player1_wins || 0) >= (rivalry.player2_wins || 0)
        ? rivalry.player1_id
        : rivalry.player2_id;
    }
  }

  const vm = getRivalryViewModel(rivalry, userId);
  const iAmA = rivalry.player1_id < rivalry.player2_id
    ? rivalry.player1_id === userId
    : rivalry.player2_id === userId;
  const myAlltimeWins    = alltime ? (iAmA ? alltime.a_series_won : alltime.b_series_won) : 0;
  const theirAlltimeWins = alltime ? (iAmA ? alltime.b_series_won : alltime.a_series_won) : 0;

  const today = getTodayUTC();
  const todayGame = (rivalry.games || []).find(g => g.game_date === today);
  const iAm1 = rivalry.player1_id === userId;
  const myTodayScore    = todayGame ? (iAm1 ? todayGame.player1_score : todayGame.player2_score) : null;
  const theirTodayScore = todayGame ? (iAm1 ? todayGame.player2_score : todayGame.player1_score) : null;
  const played = vm.hasPlayedToday;

  function gameEmoji(picks) {
    if (!picks?.length) return null;
    return picks.map(p => {
      const c = Array.isArray(p.correct) ? p.correct : [p.correct];
      return c.includes(p.pick) ? "🟩" : "🟥";
    }).join("");
  }

  function scoreRow(name, emoji, score) {
    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <span style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.45);
            min-width:56px;text-align:right;white-space:nowrap;overflow:hidden;
            text-overflow:ellipsis;">${name}</span>
        <span style="font-size:16px;letter-spacing:1px;">${emoji || "—"}</span>
        <span style="font-size:13px;font-weight:800;">${score}/5</span>
      </div>`;
  }

  let todayHtml = "";
  if (played) {
    const myEmoji    = gameEmoji(iAm1 ? todayGame?.player1_picks : todayGame?.player2_picks);
    const theirEmoji = gameEmoji(iAm1 ? todayGame?.player2_picks : todayGame?.player1_picks);
    if (theirTodayScore !== null && theirTodayScore !== undefined) {
      const dayWinner = todayGame?.day_winner;
      const iWonToday = (iAm1 && dayWinner === 1) || (!iAm1 && dayWinner === 2);
      todayHtml = `
        <div id="rivalryTodayCard" style="background:rgba(255,255,255,0.06);border-radius:12px;padding:12px 14px;margin-bottom:16px;cursor:pointer;transition:background 0.15s;"
            onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
          <div style="font-size:12px;color:rgba(255,255,255,0.4);font-weight:700;
              text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;">Today</div>
          ${scoreRow(displayName(vm.me), myEmoji, myTodayScore)}
          ${scoreRow(displayName(vm.them), theirEmoji, theirTodayScore)}
          <div style="font-size:13px;font-weight:800;margin-top:4px;
              color:${iWonToday ? "#22c55e" : "#ef4444"};">
            ${iWonToday ? "You win today!" : "They win today"}
          </div>
        </div>`;
    } else {
      todayHtml = `
        <div id="rivalryTodayCard" style="background:rgba(255,255,255,0.06);border-radius:12px;padding:12px 14px;margin-bottom:16px;cursor:pointer;transition:background 0.15s;"
            onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
          <div style="font-size:12px;color:rgba(255,255,255,0.4);font-weight:700;
              text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;">Today</div>
          ${scoreRow(displayName(vm.me), myEmoji, myTodayScore)}
          <div style="font-size:13px;color:rgba(255,255,255,0.45);margin-top:4px;">
            Waiting for ${displayName(vm.them)} to play…
          </div>
        </div>`;
    }
  }

  const pastGames = (rivalry.games || [])
    .filter(g => g.game_date !== today)
    .sort((a, b) => a.game_date.localeCompare(b.game_date));

  const historyHtml = pastGames.length > 0 ? `
    <div style="margin-top:4px;margin-bottom:16px;">
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);
          text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;">Past Days</div>
      ${pastGames.map((g, idx) => {
        const myScore    = iAm1 ? g.player1_score : g.player2_score;
        const theirScore = iAm1 ? g.player2_score : g.player1_score;
        const myEmoji    = gameEmoji(iAm1 ? g.player1_picks : g.player2_picks);
        const theirEmoji = gameEmoji(iAm1 ? g.player2_picks : g.player1_picks);
        const dw         = g.day_winner;
        const iWon       = (iAm1 && dw === 1) || (!iAm1 && dw === 2);
        const winColor   = iWon ? "#22c55e" : "#ef4444";
        const dateLabel  = new Date(g.game_date + "T12:00:00").toLocaleDateString(undefined, { month:"short", day:"numeric" });
        return `
          <div class="rivalryDayCard" data-game-date="${g.game_date}"
              style="background:rgba(255,255,255,0.04);border-radius:10px;
              padding:10px 12px;margin-bottom:8px;cursor:pointer;
              transition:background 0.15s;"
              onmouseover="this.style.background='rgba(255,255,255,0.08)'"
              onmouseout="this.style.background='rgba(255,255,255,0.04)'">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);">
                Day ${idx + 1} · ${dateLabel}
              </span>
              ${dw !== null && dw !== undefined ? `
              <span style="font-size:11px;font-weight:800;color:${winColor};">
                ${iWon ? "You won" : "You lost"}
              </span>` : ""}
            </div>
            ${myScore !== null ? scoreRow(displayName(vm.me), myEmoji, myScore) : ""}
            ${theirScore !== null ? scoreRow(displayName(vm.them), theirEmoji, theirScore) : ""}
          </div>`;
      }).join("")}
    </div>` : "";

  const colorMap = { winning: "#22c55e", tied: "#f59e0b", losing: "#ef4444" };
  const color = colorMap[vm.statusClass] || "#fff";

  const isMutualMiss = rivalry.status === "mutual_miss";
  const isComplete   = rivalry.status === "complete" || rivalry.status === "forfeit";
  const isActive     = rivalry.status === "active";

  let statusBanner = "";
  if (isMutualMiss) {
    statusBanner = `<div style="background:rgba(100,100,100,0.3);border-radius:12px;padding:14px;text-align:center;margin-bottom:16px;color:rgba(255,255,255,0.5);font-weight:700;">
      You failed each other… 💀
    </div>`;
  } else if (isComplete) {
    const won = rivalry.winner_id === userId;
    const isForfeit = rivalry.status === "forfeit";
    const headline = isForfeit
      ? (won ? "🏆 You won — opponent forfeited" : "You forfeited this series")
      : (won ? "🏆 You won the series!" : "Series over... You choked, bro.");
    statusBanner = `<div style="background:${won ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)"};border-radius:12px;padding:14px;text-align:center;margin-bottom:16px;">
      <div style="font-size:20px;font-weight:900;color:${won ? "#22c55e" : "#ef4444"};">
        ${headline}
      </div>
      <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-top:4px;">
        Final: ${vm.myWins}–${vm.theirWins}
      </div>
    </div>`;
  }

  body.innerHTML = `
    <button id="rivalryDetailBack" style="background:none;border:none;color:rgba(255,255,255,0.5);
      font-size:13px;cursor:pointer;margin-bottom:16px;padding:0;">← Back</button>

    ${statusBanner}

    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:18px;font-weight:900;">
        ${displayName(vm.me)} vs ${displayName(vm.them)}
      </div>
      <div style="font-size:28px;margin:8px 0;letter-spacing:3px;">
        ${trackerToEmoji(vm.tracker)}
      </div>
      <div style="font-size:26px;font-weight:900;color:${color};">
        ${vm.myWins}–${vm.theirWins}
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">
        All-time: You ${myAlltimeWins}–${theirAlltimeWins} ${displayName(vm.them)}
        (${myAlltimeWins + theirAlltimeWins} series)
      </div>
    </div>

    ${todayHtml}

    ${isActive && !played ? `
      <button id="rivalryPlayBtn" style="
          display:block;width:100%;padding:16px;margin-bottom:12px;
          background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;
          border-radius:14px;color:#fff;font-size:17px;font-weight:900;cursor:pointer;">
        Play Today's Rivalry Quiz
      </button>` : ""}

    ${isActive && played && (theirTodayScore === null || theirTodayScore === undefined) ? `
      <button id="rivalryTauntBtn" style="
          display:block;width:100%;padding:14px;margin-bottom:12px;
          background:linear-gradient(135deg,#f97316,#ea580c);border:none;
          border-radius:14px;color:#fff;font-size:16px;font-weight:900;cursor:pointer;">
        🔥 Taunt Your Rival
      </button>` : ""}

    ${historyHtml}

    ${isComplete || isMutualMiss ? `
      <button id="rivalryShareBtn" style="
          display:block;width:100%;padding:14px;margin-top:8px;
          background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.18);
          border-radius:14px;color:#fff;font-size:15px;font-weight:800;cursor:pointer;">
        📸 Share Result
      </button>` : ""}

    ${isActive ? `
      <div style="margin-top:24px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
        <button id="rivalryForfeitBtn" style="
            display:block;width:100%;padding:10px;background:none;
            border:1px solid rgba(239,68,68,0.4);border-radius:10px;
            color:rgba(239,68,68,0.7);font-size:13px;font-weight:700;cursor:pointer;">
          Forfeit Series
        </button>
      </div>` : ""}
  `;

  body.querySelector("#rivalryDetailBack")?.addEventListener("click", async () => {
    const { rivalries: _rivalries } = await getUserRivalries(userId);
    const rivalries = testModePatchRivalries(_rivalries);
    const active  = rivalries.filter(isDisplayActive);
    const history = rivalries.filter(r => !isDisplayActive(r));
    renderModalList(body, active, history, userId, overlay);
  });

  body.querySelector("#rivalryPlayBtn")?.addEventListener("click", () => {
    overlay.remove();
    document.body.style.overflow = "";
    openRivalryQuiz(rivalryId);
  });

  body.querySelector("#rivalryTauntBtn")?.addEventListener("click", () => {
    _copyTaunt(`${myTodayScore}/5`);
  });

  body.querySelector("#rivalryForfeitBtn")?.addEventListener("click", () => {
    confirmForfeit(rivalryId, userId, body, overlay, vm);
  });

  body.querySelector("#rivalryShareBtn")?.addEventListener("click", () => {
    shareRivalryResult(vm, rivalry, userId);
  });

  body.querySelectorAll(".rivalryDayCard").forEach(card => {
    card.addEventListener("click", () => {
      const date = card.dataset.gameDate;
      renderDayResult(body, rivalry, rivalryId, vm, date, overlay, userId);
    });
  });

  body.querySelector("#rivalryTodayCard")?.addEventListener("click", () => {
    renderDayResult(body, rivalry, rivalryId, vm, today, overlay, userId);
  });

  // If the series just ended and this user hasn't seen the end screen yet, show it now
  const isOver = rivalry.status === "complete" || rivalry.status === "forfeit";
  if (isOver && !localStorage.getItem(`re_seen_${rivalryId}`)) {
    const fakeOverlay = document.createElement("div");
    document.body.appendChild(fakeOverlay);
    showSeriesEndScreen(fakeOverlay, rivalry, vm, userId, async () => {
      const { rivalries: _rivalries } = await getUserRivalries(userId);
      const rivalries = testModePatchRivalries(_rivalries);
      const active  = rivalries.filter(isDisplayActive);
      const history = rivalries.filter(r => !isDisplayActive(r));
      renderModalList(body, active, history, userId, overlay);
    });
  }
}

async function renderDayResult(body, rivalry, rivalryId, vm, date, overlay, userId) {
  const iAm1 = vm.iAm1;
  const game  = (rivalry.games || []).find(g => g.game_date === date);
  if (!game) return;

  const myScore    = iAm1 ? game.player1_score     : game.player2_score;
  const theirScore = iAm1 ? game.player2_score     : game.player1_score;
  const myPicks    = iAm1 ? game.player1_picks     : game.player2_picks;
  const theirPicks = iAm1 ? game.player2_picks     : game.player1_picks;
  const myTime     = iAm1 ? game.player1_time_secs : game.player2_time_secs;
  const dw         = game.day_winner;
  const iWon       = (iAm1 && dw === 1) || (!iAm1 && dw === 2);
  const theyPlayed = theirScore !== null && theirScore !== undefined;

  let questions = await getRivalryQuestionsForDate(rivalryId, date);
  // Fallback: UTC-stored date may be one day ahead of the corrected local date
  if (!questions.length && myPicks?.length) {
    const nextDay = new Date(date + "T12:00:00");
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth()+1).padStart(2,"0")}-${String(nextDay.getDate()).padStart(2,"0")}`;
    questions = await getRivalryQuestionsForDate(rivalryId, nextDayStr);
  }
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric" });

  function squaresFor(picks) {
    if (!Array.isArray(picks)) return [];
    return picks.map(p => {
      const correct = Array.isArray(p.correct) ? p.correct : [p.correct];
      return correct.includes(p.pick) ? "🟩" : "🟥";
    });
  }

  const mySquares    = squaresFor(myPicks);
  const theirSquares = squaresFor(theirPicks);

  const scoreRowStyle = `display:flex;align-items:center;gap:10px;`;
  const nameStyle     = `font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);min-width:52px;text-align:right;`;
  const numStyle      = `font-size:13px;font-weight:800;color:rgba(255,255,255,0.9);`;
  const winColor      = iWon ? "#22c55e" : "#ef4444";

  const scoreHtml = theyPlayed ? `
    <div style="${scoreRowStyle}margin-bottom:8px;">
      <span style="${nameStyle}">${displayName(vm.me)}</span>
      <span style="font-size:18px;letter-spacing:2px;">${mySquares.join("")}</span>
      <span style="${numStyle}">${myScore}/5</span>
    </div>
    <div style="${scoreRowStyle}margin-bottom:12px;">
      <span style="${nameStyle}">${displayName(vm.them)}</span>
      <span style="font-size:18px;letter-spacing:2px;">${theirSquares.join("")}</span>
      <span style="${numStyle}">${theirScore}/5</span>
    </div>
    <div style="font-size:16px;font-weight:900;color:${winColor};">
      ${iWon ? "You won this day" : "They won this day"}
    </div>` : `
    <div style="${scoreRowStyle}margin-bottom:12px;">
      <span style="${nameStyle}">${displayName(vm.me)}</span>
      <span style="font-size:18px;letter-spacing:2px;">${mySquares.join("")}</span>
      <span style="${numStyle}">${myScore}/5</span>
    </div>
    <div style="font-size:14px;color:rgba(255,255,255,0.45);">
      Waiting for ${displayName(vm.them)} to play…
    </div>`;

  const questionsHtml = questions.length > 0 && myPicks?.length > 0 ? `
    <div style="margin-top:28px;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;text-align:left;">
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;
          letter-spacing:.1em;margin-bottom:14px;">Questions</div>
      ${questions.map((q, i) => {
        const myPick    = myPicks[i];
        const myCorrect = myPick ? (Array.isArray(myPick.correct) ? myPick.correct : [myPick.correct]) : [];
        const myOk      = myPick?.pick !== null && myPick?.pick !== undefined && myCorrect.includes(myPick.pick);
        const myText    = myPick?.pick != null ? q.choices[myPick.pick] : "—";

        const theirPick    = theirPicks?.[i];
        const theirCorrect = theirPick ? (Array.isArray(theirPick.correct) ? theirPick.correct : [theirPick.correct]) : [];
        const theirOk      = theirPick?.pick !== null && theirPick?.pick !== undefined && theirCorrect.includes(theirPick.pick);
        const theirText    = theirPick?.pick != null ? q.choices[theirPick.pick] : "—";

        const correctIdx  = Array.isArray(q.answer) ? q.answer[0] : q.answer;
        const correctText = q.choices[correctIdx];

        const cardBg     = myOk ? "rgba(40,167,69,0.22)"          : "rgba(255,75,107,0.13)";
        const cardBorder = myOk ? "1px solid rgba(40,167,69,0.45)" : "1px solid rgba(255,75,107,0.4)";
        const myColor    = myOk    ? "#28a745" : "#ff4b6b";
        const theirColor = theirOk ? "#28a745" : "#ff4b6b";

        return `
          <div style="margin-bottom:10px;background:${cardBg};border:${cardBorder};border-radius:12px;padding:12px 14px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:8px;line-height:1.4;color:#fff;">
              ${q.question}
            </div>
            <div style="font-size:13px;margin-bottom:3px;">
              <span style="color:rgba(255,255,255,0.55);">${displayName(vm.me)}:</span>
              <strong style="color:${myColor};"> ${myText}</strong>
            </div>
            ${theirPick ? `
            <div style="font-size:13px;margin-bottom:3px;">
              <span style="color:rgba(255,255,255,0.55);">${displayName(vm.them)}:</span>
              <strong style="color:${theirColor};"> ${theirText}</strong>
            </div>` : ""}
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:2px;">
              Correct: <strong>${correctText}</strong>
            </div>
          </div>`;
      }).join("")}
    </div>` : "";

  body.innerHTML = `
    <button id="dayResultBack" style="background:none;border:none;color:rgba(255,255,255,0.5);
      font-size:13px;cursor:pointer;margin-bottom:16px;padding:0;">← Back</button>

    <div style="font-size:12px;color:rgba(255,255,255,0.35);font-weight:700;
        text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;">
      ${dateLabel}
    </div>

    <div style="background:rgba(255,255,255,0.06);border-radius:14px;padding:18px 20px;
        margin-bottom:16px;text-align:left;">
      ${scoreHtml}
    </div>

    ${questionsHtml}
  `;

  body.querySelector("#dayResultBack")?.addEventListener("click", () => {
    renderRivalryDetail(body, rivalryId, userId, overlay);
  });
}

async function confirmForfeit(rivalryId, userId, body, overlay, vm) {
  const confirmed = await showConfirmDialog(
    `Forfeit your series against ${displayName(vm.them)}? This counts as a series loss.`,
    "Forfeit",
    "Cancel"
  );
  if (!confirmed) return;

  const { error } = await forfeitRivalry(rivalryId);
  if (error) { showToast("Could not forfeit. Try again."); return; }
  showToast("Series forfeited.");
  overlay.remove();
  document.body.style.overflow = "";
  document.querySelector(`.rivalry-row[data-id="${rivalryId}"]`)?.remove();
  const card = document.getElementById("rivalryCard");
  if (card?.parentElement) renderRivalryCard(card.parentElement);
}

async function shareRivalryResult(vm, rivalry, userId) {
  const won = rivalry.winner_id === userId;
  const winnerVm  = won ? vm.me  : vm.them;
  const loserVm   = won ? vm.them : vm.me;
  const winnerW   = won ? vm.myWins   : vm.theirWins;
  const loserW    = won ? vm.theirWins : vm.myWins;
  // Always build tracker from the winner's point of view
  const winnerTracker = vm.tracker.map(s =>
    s === "win" ? (won ? "win" : "loss") :
    s === "loss" ? (won ? "loss" : "win") : s
  );

  const W = 800, H = 420;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(1, "#1e293b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(4, 4, W - 8, H - 8, 20);
  ctx.stroke();

  // Header
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "700 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PIGSKIN5 RIVALRY", W / 2, 52);

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 70);
  ctx.lineTo(W - 60, 70);
  ctx.stroke();

  // Headline — always praising the winner
  ctx.fillStyle = "#22c55e";
  ctx.font = "900 42px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("🏆 Series Winner!", W / 2, 130);

  // Matchup: winner vs loser
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${displayName(winnerVm)}  vs  ${displayName(loserVm)}`, W / 2, 186);

  // Tracker from winner's perspective (green = their wins)
  const squareSize = 48, gap = 10;
  const totalW = winnerTracker.length * squareSize + (winnerTracker.length - 1) * gap;
  let sx = (W - totalW) / 2;
  const sy = 212;
  winnerTracker.forEach(s => {
    ctx.fillStyle = s === "win" ? "#22c55e" : s === "loss" ? "#ef4444" : "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.roundRect(sx, sy, squareSize, squareSize, 8);
    ctx.fill();
    sx += squareSize + gap;
  });

  // Score: winner – loser
  ctx.fillStyle = "#22c55e";
  ctx.font = "900 52px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${winnerW} – ${loserW}`, W / 2, 330);

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "600 18px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("pigskin5.com", W / 2, 390);

  canvas.toBlob(async (blob) => {
    const file = new File([blob], "rivalry-result.png", { type: "image/png" });
    const shareText = won
      ? `I beat ${displayName(vm.them)} ${winnerW}–${loserW} in a Pigskin5 rivalry! 🏆`
      : `${displayName(vm.them)} beat me ${winnerW}–${loserW} in a Pigskin5 rivalry. Rematch incoming.`;

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: shareText, url: "https://pigskin5.com" });
        return;
      } catch {}
    }

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rivalry-result.png";
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Image saved — share it anywhere!");
  }, "image/png");
}

function showConfirmDialog(message, confirmLabel, cancelLabel) {
  return new Promise(resolve => {
    const d = document.createElement("div");
    d.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;
      display:flex;align-items:center;justify-content:center;`;
    d.innerHTML = `
      <div style="background:#1a2035;border-radius:16px;padding:28px 24px;max-width:340px;width:90%;text-align:center;">
        <p style="font-size:15px;line-height:1.5;margin:0 0 20px;">${message}</p>
        <div style="display:flex;gap:10px;">
          <button id="cfCancel" style="flex:1;padding:12px;border-radius:10px;
            background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
            color:#fff;font-weight:700;cursor:pointer;">${cancelLabel}</button>
          <button id="cfConfirm" style="flex:1;padding:12px;border-radius:10px;
            background:#ef4444;border:none;color:#fff;font-weight:700;cursor:pointer;">${confirmLabel}</button>
        </div>
      </div>`;
    document.body.appendChild(d);
    d.querySelector("#cfCancel").addEventListener("click", () => { d.remove(); resolve(false); });
    d.querySelector("#cfConfirm").addEventListener("click", () => { d.remove(); resolve(true); });
  });
}

// ── Start New Rivalry ─────────────────────────────────────

async function renderStartNewRivalry(body, userId, overlay) {
  const { rivalries: _rivalriesSnr } = await getUserRivalries(userId);
  const rivalries = testModePatchRivalries(_rivalriesSnr);
  const activeCount = rivalries.filter(r => r.status === "active").length;

  if (activeCount >= 5) {
    body.innerHTML = `
      <p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px 0;">
        Your 5 rivalry slots are full!<br>
        <span style="font-size:13px;color:rgba(255,255,255,0.4);">
          Finish or forfeit a rivalry to accept new challenges.
        </span>
      </p>`;
    return;
  }

  body.innerHTML = `
    <button id="rivalryDetailBack2" style="background:none;border:none;color:rgba(255,255,255,0.5);
      font-size:13px;cursor:pointer;margin-bottom:16px;padding:0;">← Back</button>
    <h3 style="margin:0 0 12px;font-size:17px;text-align:center;">Challenge a Friend</h3>
    <p style="font-size:14px;color:rgba(255,255,255,0.55);text-align:center;margin:0 0 20px;">
      Share your rivalry link. When they accept, the series begins immediately!
    </p>
    <div id="rivalryLinkArea" style="text-align:center;">
      <button id="genRivalryLinkBtn" style="
          padding:14px 28px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);
          border:none;border-radius:14px;color:#fff;font-size:16px;
          font-weight:900;cursor:pointer;">
        Generate Rivalry Link
      </button>
    </div>`;

  body.querySelector("#rivalryDetailBack2")?.addEventListener("click", async () => {
    const { rivalries: _r2 } = await getUserRivalries(userId);
    const r2 = testModePatchRivalries(_r2);
    renderModalList(body, r2.filter(isDisplayActive), r2.filter(r => !isDisplayActive(r)), userId, overlay);
  });

  body.querySelector("#genRivalryLinkBtn")?.addEventListener("click", async () => {
    const btn = body.querySelector("#genRivalryLinkBtn");
    btn.disabled = true;
    btn.textContent = "Generating…";

    const { challengeId, error } = await createRivalryChallenge();
    if (error) {
      btn.disabled = false;
      btn.textContent = "Generate Rivalry Link";
      if (error === "slots_full") showToast("Your rivalry slots are full!");
      else showToast("Error creating challenge. Try again.");
      return;
    }

    const link = new URL(`rivalry/?id=${challengeId}`, location.href).href;
    body.querySelector("#rivalryLinkArea").innerHTML = `
      <div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:14px;word-break:break-all;
          font-size:13px;color:rgba(255,255,255,0.8);margin-bottom:12px;">${link}</div>
      <button id="copyRivalryLink" style="
          padding:12px 28px;background:#22c55e;border:none;border-radius:12px;
          color:#fff;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:8px;width:100%;">
        Copy Link
      </button>
      <p style="font-size:12px;color:rgba(255,255,255,0.35);margin:6px 0 0;">
        Link expires at midnight UTC tonight.
      </p>`;

    body.querySelector("#copyRivalryLink")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      showToast("Rivalry link copied!");
      if (navigator.share) {
        navigator.share({
          title: "Pigskin5 Rivalry Challenge",
          text: "I'm challenging you to a Pigskin5 rivalry! Think you can beat me? 🏈",
          url: link,
        }).catch(() => {});
      }
    });
  });
}

// ── Start Rivalry from Results Screen ────────────────────

// anchorEl — the element to insert the button after (below quiz stats)
export async function injectStartRivalryButton(anchorEl) {
  if (document.getElementById("rivalryCardResult")) return;
  await renderRivalryCard(anchorEl, true);
}


// ── Rivalry Quiz Overlay ──────────────────────────────────

export async function openRivalryQuiz(rivalryId) {
  const user = await getCurrentUser();
  if (!user) { document.getElementById("signInBtn")?.click(); return; }

  if (await hasPlayedToday(rivalryId)) {
    showToast("You've already played today's rivalry quiz!");
    return;
  }

  const questions = await getTodayRivalryQuestions(rivalryId);
  if (!questions || questions.length === 0) {
    showToast("Could not load rivalry questions. Try again.");
    return;
  }

  // Build overlay
  const overlay = document.createElement("div");
  overlay.id = "rivalryQuizOverlay";
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);z-index:8000;
    display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
    overflow-y:auto;padding:20px 16px;`;

  overlay.innerHTML = `
    <div style="width:min(520px,100%);margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div style="font-size:13px;font-weight:800;color:rgba(255,255,255,0.5);">
          Rivalry Quiz
        </div>
        <div id="rqProgress" style="font-size:14px;font-weight:700;">Question 1 / 5</div>
      </div>
      <div id="rqTimerBar" style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-bottom:20px;">
        <div id="rqTimerFill" style="height:100%;background:#3b82f6;border-radius:2px;width:100%;transition:width 1s linear;"></div>
      </div>
      <div id="rqQuestion" style="font-size:clamp(16px,4vw,20px);font-weight:800;line-height:1.45;
          margin-bottom:22px;white-space:pre-wrap;"></div>
      <div id="rqChoices" style="display:flex;flex-direction:column;gap:10px;"></div>
      <div id="rqTimer" style="font-size:15px;font-weight:700;margin-top:18px;text-align:center;
          color:rgba(255,255,255,0.5);">15s</div>
    </div>`;

  document.body.appendChild(overlay);

  // Quiz state
  let current     = 0;
  let picks       = [];
  let timerId     = null;
  let timeLeft    = TIME_LIMIT;
  let questionStart = 0;
  let totalTime   = 0;
  let answered    = false;

  const progressEl = overlay.querySelector("#rqProgress");
  const questionEl = overlay.querySelector("#rqQuestion");
  const choicesEl  = overlay.querySelector("#rqChoices");
  const timerEl    = overlay.querySelector("#rqTimer");
  const timerFill  = overlay.querySelector("#rqTimerFill");

  function renderQuestion() {
    const q = questions[current];
    answered  = false;
    timeLeft  = TIME_LIMIT;
    questionStart = Date.now();

    progressEl.textContent = `Question ${current + 1} / 5`;
    questionEl.textContent = q.question;
    choicesEl.innerHTML = "";
    timerFill.style.width = "100%";
    timerFill.style.background = "#3b82f6";

    q.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.style.cssText = `
        padding:14px 16px;background:rgba(255,255,255,0.07);
        border:1.5px solid rgba(255,255,255,0.15);border-radius:12px;
        color:#fff;font-size:15px;font-weight:600;cursor:pointer;text-align:left;
        transition:background 0.15s,border-color 0.15s;`;
      btn.textContent = choice;
      btn.addEventListener("click", () => pickAnswer(i));
      choicesEl.appendChild(btn);
    });

    startTimer();
  }

  function startTimer() {
    clearInterval(timerId);
    timerEl.textContent = `${timeLeft}s`;
    timerId = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}s`;
      timerFill.style.width = `${(timeLeft / TIME_LIMIT) * 100}%`;
      if (timeLeft <= 5) {
        timerFill.style.background = "#ef4444";
        timerEl.style.color = "#ef4444";
      }
      if (timeLeft <= 0) {
        clearInterval(timerId);
        pickAnswer(null);
      }
    }, 1000);
  }

  function pickAnswer(choiceIdx) {
    if (answered) return;
    answered = true;
    clearInterval(timerId);

    const elapsed = (Date.now() - questionStart) / 1000;
    totalTime += Math.min(elapsed, TIME_LIMIT);
    const q = questions[current];
    const correct = Array.isArray(q.answer) ? q.answer : [q.answer];
    const isCorrect = choiceIdx !== null && correct.includes(choiceIdx);

    // Visual feedback
    const btns = choicesEl.querySelectorAll("button");
    btns.forEach((btn, i) => {
      btn.disabled = true;
      if (correct.includes(i)) {
        btn.style.background = "rgba(34,197,94,0.25)";
        btn.style.borderColor = "#22c55e";
      } else if (i === choiceIdx) {
        btn.style.background = "rgba(239,68,68,0.2)";
        btn.style.borderColor = "#ef4444";
      }
    });

    picks.push({
      idx: current,
      pick: choiceIdx,
      correct: q.answer,
      elapsed,
      isCorrect,
    });

    setTimeout(advance, 900);
  }

  function advance() {
    current++;
    if (current < questions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  async function finishQuiz() {
    overlay.innerHTML = `<div style="color:#fff;text-align:center;padding:60px 20px;font-size:16px;">
      Submitting score…</div>`;

    const score = picks.filter(p => p.isCorrect).length;
    const avgTime = totalTime / picks.length;

    const { error, game } = await submitRivalryScore(rivalryId, {
      score,
      timeSecs: totalTime,
      picks: picks.map(p => ({ idx: p.idx, pick: p.pick, correct: p.correct })),
    });

    overlay.remove();

    if (error) {
      showToast(error === "already_played" ? "You already played today!" : "Could not submit score.");
      return;
    }

    // Re-fetch rivalry with fresh data for results screen
    const { rivalry } = await getRivalry(rivalryId);
    if (RIVALRY_TEST_ONE_QUIZ && rivalry?.status === "active") {
      const me = await getCurrentUser();
      const today = getTodayUTC();
      const todayGame = (rivalry.games || []).find(g => g.game_date === today);
      const iAm1 = rivalry.player1_id === me.id;
      const bothPlayed = todayGame?.player1_score != null && todayGame?.player2_score != null;
      if (bothPlayed) {
        rivalry.status = "complete";
        const iWonToday = iAm1 ? todayGame.day_winner === 1 : todayGame.day_winner === 2;
        rivalry.winner_id = iWonToday ? me.id : (iAm1 ? rivalry.player2_id : rivalry.player1_id);
        if (iAm1) rivalry.player1_wins = Math.max(rivalry.player1_wins || 0, 1);
        else rivalry.player2_wins = Math.max(rivalry.player2_wins || 0, 1);
      }
    }
    openRivalryResults(rivalry, rivalryId, score, picks, avgTime, questions);
  }

  renderQuestion();
}

// ── Series End Screen ─────────────────────────────────────

function showSeriesEndScreen(overlay, rivalry, vm, userId, onClose = null) {
  const won          = rivalry.winner_id === userId;
  const isMutualMiss = rivalry.status === "mutual_miss";
  const isForfeit    = rivalry.status === "forfeit";
  const onAcceptPage = window.location.pathname.includes("/rivalry");
  const basePath     = onAcceptPage ? "../" : "";

  const winnerProfile = rivalry.winner_id === rivalry.player1_id ? rivalry.p1 : rivalry.p2;
  const loserProfile  = rivalry.winner_id === rivalry.player1_id ? rivalry.p2 : rivalry.p1;
  const winnerName = isMutualMiss ? displayName(vm.me)   : displayName(winnerProfile);
  const loserName  = isMutualMiss ? displayName(vm.them) : displayName(loserProfile);
  const winnerWins = won ? vm.myWins   : vm.theirWins;
  const loserWins  = won ? vm.theirWins : vm.myWins;
  const isSweep    = !isMutualMiss && !isForfeit && loserWins === 0;

  const winnerTracker = (won || isMutualMiss) ? vm.tracker : vm.tracker.map(s =>
    s === "win" ? "loss" : s === "loss" ? "win" : s
  );

  if (!document.getElementById("rivalry-end-styles")) {
    const s = document.createElement("style");
    s.id = "rivalry-end-styles";
    s.textContent = `
      @keyframes re-trophy-pop {
        from { transform: scale(0.3); opacity: 0; }
        to   { transform: scale(1);   opacity: 1; }
      }
      @keyframes re-fade-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #re-logo    { animation: re-fade-up 0.4s 0s    ease both; opacity:0; }
      #re-trophy  { animation: re-trophy-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both; }
      #re-line    { animation: re-fade-up 0.4s 0.15s ease both; opacity:0; }
      #re-score   { animation: re-fade-up 0.4s 0.25s ease both; opacity:0; }
      #re-tracker { animation: re-fade-up 0.4s 0.35s ease both; opacity:0; }
      #re-close   { animation: re-fade-up 0.4s 0.45s ease both; opacity:0; }
    `;
    document.head.appendChild(s);
  }

  // Mark this rivalry's end screen as seen so the detail view doesn't re-show it
  localStorage.setItem(`re_seen_${rivalry.id}`, "1");

  // Remove the quiz overlay; build a brand-new full-page takeover
  overlay.remove();

  const screen = document.createElement("div");
  screen.id = "rivalry-end-screen";
  screen.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:url('${basePath}field.jpg') center center / cover no-repeat;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;`;

  // Dark field dim
  const dim = document.createElement("div");
  dim.style.cssText = "position:absolute;inset:0;background:rgba(0,0,0,0.52);z-index:0;";
  screen.appendChild(dim);

  // Confetti canvas — sits above dim, below modal card
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:1;";
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  screen.appendChild(canvas);

  // Content (logo + modal card)
  const content = document.createElement("div");
  content.style.cssText = `
    position:relative;z-index:2;
    display:flex;flex-direction:column;align-items:center;width:100%;`;
  content.innerHTML = `
    <img id="re-logo" src="${basePath}logos/pigskin5logo.png" alt="Pigskin5"
        style="height:120px;margin-bottom:28px;object-fit:contain;">
    <div style="
        background:rgba(30,30,30,0.28);
        backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
        border:1px solid rgba(255,255,255,0.08);border-radius:24px;
        padding:40px 28px 32px;text-align:center;
        width:min(460px,100%);box-shadow:0 32px 80px rgba(0,0,0,0.3);">
      <div id="re-trophy" style="font-size:64px;line-height:1;margin-bottom:18px;
          filter:drop-shadow(0 0 20px rgba(250,204,21,0.5));">
        ${isMutualMiss ? "💀" : isSweep ? "🧹" : "🏆"}
      </div>
      <div id="re-line" style="font-size:22px;font-weight:900;color:#fff;
          line-height:1.35;margin-bottom:${isMutualMiss ? "30px" : "6px"};word-break:break-word;">
        ${isMutualMiss
          ? `<span style="color:rgba(255,255,255,0.5)">You Failed Each Other</span>`
          : isForfeit
            ? `<div style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.45);margin-bottom:6px;">${loserName} forfeits</div><span style="color:#22c55e">${winnerName} Wins!</span>`
            : isSweep
              ? `<div style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.45);margin-bottom:6px;">SWEEP!</div><span style="color:#22c55e">${winnerName} Swept ${loserName}!</span>`
              : `<span style="color:#22c55e">${winnerName}</span> defeats <span style="color:#f87171">${loserName}</span>`}
      </div>
      ${!isMutualMiss ? `
      <div id="re-score" style="font-size:52px;font-weight:900;color:#22c55e;letter-spacing:4px;
          margin:14px 0;text-shadow:0 0 30px rgba(34,197,94,0.4);">
        ${winnerWins} – ${loserWins}
      </div>
      <div id="re-alltime" style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:4px;"></div>` : ""}
      <div id="re-tracker" style="font-size:26px;letter-spacing:3px;margin-bottom:32px;${!isMutualMiss ? "margin-top:16px;" : ""}">
        ${trackerToEmoji(winnerTracker)}
      </div>
      <button id="re-close" style="
          background:none;border:none;color:rgba(255,255,255,0.35);
          font-size:13px;cursor:pointer;padding:8px;">
        Close
      </button>
    </div>`;
  screen.appendChild(content);
  document.body.appendChild(screen);

  // Populate all-time record asynchronously
  if (!isMutualMiss) {
    getRivalryAlltime(rivalry.player1_id, rivalry.player2_id).then(alltime => {
      const el = screen.querySelector("#re-alltime");
      if (!el || !alltime) return;
      const iAm1 = rivalry.player1_id === userId;
      const mySeriesWins    = iAm1 ? alltime.a_series_won : alltime.b_series_won;
      const theirSeriesWins = iAm1 ? alltime.b_series_won : alltime.a_series_won;
      const winnerAlltime = won ? mySeriesWins   : theirSeriesWins;
      const loserAlltime  = won ? theirSeriesWins : mySeriesWins;
      el.textContent = `All-Time: ${winnerAlltime} – ${loserAlltime}`;
    }).catch(() => {});
  }

  // Confetti — only for real series outcomes
  let confettiFrame = null;
  if (!isMutualMiss) {
    const ctx = canvas.getContext("2d");
    const COLORS = ["#22c55e","#facc15","#3b82f6","#f97316","#fff","#a78bfa"];
    let particles = [];

    function spawnParticle() {
      return {
        x: Math.random() * canvas.width,
        y: -10,
        w: 6 + Math.random() * 8,
        h: 10 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        angle: Math.random() * Math.PI * 2,
        spin:  (Math.random() - 0.5) * 0.15,
        opacity: 0.8 + Math.random() * 0.2,
      };
    }

    for (let i = 0; i < 120; i++) {
      const p = spawnParticle();
      p.y = Math.random() * canvas.height * 0.6;
      particles.push(p);
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (particles.length < 160 && Math.random() < 0.4) particles.push(spawnParticle());
      particles = particles.filter(p => p.y < canvas.height + 20);
      for (const p of particles) {
        p.y += p.speedY; p.x += p.speedX; p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      confettiFrame = requestAnimationFrame(tick);
    }
    tick();
  }

  screen.querySelector("#re-close").addEventListener("click", () => {
    cancelAnimationFrame(confettiFrame);
    screen.remove();
    if (onAcceptPage) window.location.href = "../index.html";
    else if (onClose) onClose();
  });
}

// ── Rivalry Results Screen ────────────────────────────────

export function openRivalryResults(rivalry, rivalryId, myScore, picks, avgTime, questions = []) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);z-index:8500;
    display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
    overflow-y:auto;overscroll-behavior:contain;padding:32px 16px;`;

  getCurrentUser().then(user => {
    if (!user) return;
    const iAm1 = rivalry.player1_id === user.id;
    const vm = getRivalryViewModel(rivalry, user.id);

    // Series just ended — swap to dedicated end screen
    const isSeriesOver = rivalry.status === "complete" || rivalry.status === "forfeit" || rivalry.status === "mutual_miss";
    if (isSeriesOver) {
      showSeriesEndScreen(overlay, rivalry, vm, user.id, () => {
        document.body.style.overflow = "";
        const card = document.getElementById("rivalryCard");
        if (card?.parentElement) renderRivalryCard(card.parentElement);
      });
      if (rivalry.status !== "mutual_miss") {
        checkRivalryAchievements(user.id, rivalry).catch(() => {});
      }
      return;
    }

    const today = getTodayUTC();
    const todayGame = (rivalry.games || []).find(g => g.game_date === today);
    const theirScore  = iAm1 ? todayGame?.player2_score : todayGame?.player1_score;
    const theirPicks  = iAm1 ? todayGame?.player2_picks : todayGame?.player1_picks;
    const dayWinner   = todayGame?.day_winner;
    const iWonToday   = (iAm1 && dayWinner === 1) || (!iAm1 && dayWinner === 2);
    const theyPlayed  = theirScore !== null && theirScore !== undefined;

    const mySquares = picks.map(p => {
      const correct = Array.isArray(p.correct) ? p.correct : [p.correct];
      return correct.includes(p.pick) ? "🟩" : "🟥";
    });

    const theirSquares = theirPicks ? theirPicks.map(p => {
      const correct = Array.isArray(p.correct) ? p.correct : [p.correct];
      return correct.includes(p.pick) ? "🟩" : "🟥";
    }) : null;

    const colorMap = { winning: "#22c55e", tied: "#f59e0b", losing: "#ef4444" };
    const seriesColor = colorMap[vm.statusClass] || "#fff";
    const winColor = iWonToday ? "#22c55e" : "#ef4444";

    const scoreRowStyle = `display:flex;align-items:center;gap:10px;`;
    const nameStyle = `font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);min-width:52px;text-align:right;`;
    const numStyle = `font-size:13px;font-weight:800;color:rgba(255,255,255,0.9);`;

    const scoreHtml = theyPlayed ? `
      <div style="${scoreRowStyle}margin-bottom:8px;">
        <span style="${nameStyle}">${displayName(vm.me)}</span>
        <span style="font-size:18px;letter-spacing:2px;">${mySquares.join("")}</span>
        <span style="${numStyle}">${myScore}/5</span>
      </div>
      <div style="${scoreRowStyle}margin-bottom:12px;">
        <span style="${nameStyle}">${displayName(vm.them)}</span>
        <span style="font-size:18px;letter-spacing:2px;">${theirSquares.join("")}</span>
        <span style="${numStyle}">${theirScore}/5</span>
      </div>
      <div style="font-size:16px;font-weight:900;color:${winColor};">
        ${iWonToday ? "You win today!" : "They win today"}
      </div>` : `
      <div style="${scoreRowStyle}margin-bottom:12px;">
        <span style="${nameStyle}">${displayName(vm.me)}</span>
        <span style="font-size:18px;letter-spacing:2px;">${mySquares.join("")}</span>
        <span style="${numStyle}">${myScore}/5</span>
      </div>
      <div style="font-size:14px;color:rgba(255,255,255,0.45);">
        Waiting for ${displayName(vm.them)} to play…
      </div>`;

    const questionsHtml = questions.length > 0 ? `
      <div style="margin-top:28px;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;text-align:left;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;
            letter-spacing:.1em;margin-bottom:14px;">Questions</div>
        ${questions.map((q, i) => {
          const myPick    = picks[i];
          const myCorrect = myPick ? (Array.isArray(myPick.correct) ? myPick.correct : [myPick.correct]) : [];
          const myOk      = myPick?.pick !== null && myPick?.pick !== undefined && myCorrect.includes(myPick.pick);
          const myText    = myPick?.pick != null ? q.choices[myPick.pick] : "—";

          const theirPick    = theirPicks?.[i];
          const theirCorrect = theirPick ? (Array.isArray(theirPick.correct) ? theirPick.correct : [theirPick.correct]) : [];
          const theirOk      = theirPick?.pick !== null && theirPick?.pick !== undefined && theirCorrect.includes(theirPick.pick);
          const theirText    = theirPick?.pick != null ? q.choices[theirPick.pick] : "—";

          const correctIdx   = Array.isArray(q.answer) ? q.answer[0] : q.answer;
          const correctText  = q.choices[correctIdx];

          const cardBg     = myOk ? "rgba(40,167,69,0.22)"    : "rgba(255,75,107,0.13)";
          const cardBorder = myOk ? "1px solid rgba(40,167,69,0.45)" : "1px solid rgba(255,75,107,0.4)";
          const myColor    = myOk ? "#28a745" : "#ff4b6b";
          const theirColor = theirOk ? "#28a745" : "#ff4b6b";

          return `
            <div style="margin-bottom:10px;background:${cardBg};border:${cardBorder};border-radius:12px;padding:12px 14px;">
              <div style="font-size:13px;font-weight:700;margin-bottom:8px;line-height:1.4;color:#fff;">
                ${q.question}
              </div>
              <div style="font-size:13px;margin-bottom:3px;">
                <span style="color:rgba(255,255,255,0.55);">${displayName(vm.me)}:</span>
                <strong style="color:${myColor};"> ${myText}</strong>
              </div>
              ${theirPick ? `
              <div style="font-size:13px;margin-bottom:3px;">
                <span style="color:rgba(255,255,255,0.55);">${displayName(vm.them)}:</span>
                <strong style="color:${theirColor};"> ${theirText}</strong>
              </div>` : ""}
              <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:2px;">
                Correct: <strong>${correctText}</strong>
              </div>
            </div>`;
        }).join("")}
      </div>` : "";

    overlay.innerHTML = `
      <div style="width:min(480px,100%);margin:0 auto;text-align:center;">
        <div style="font-size:12px;color:rgba(255,255,255,0.35);font-weight:700;
            text-transform:uppercase;letter-spacing:.1em;margin-bottom:20px;">
          ⚔️ Rivalry Result
        </div>

        <div style="background:rgba(255,255,255,0.06);border-radius:14px;padding:18px 20px;
            margin-bottom:12px;text-align:left;">
          ${scoreHtml}
        </div>

        <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:18px;">
          Avg time: ${avgTime.toFixed(1)}s
        </div>

        <div style="background:rgba(255,255,255,0.06);border-radius:14px;padding:16px;margin-bottom:22px;">
          <div style="font-size:14px;font-weight:800;margin-bottom:8px;">
            ${displayName(vm.me)} vs ${displayName(vm.them)}
          </div>
          <div style="font-size:24px;letter-spacing:3px;margin-bottom:6px;">
            ${trackerToEmoji(vm.tracker)}
          </div>
          <div style="font-size:20px;font-weight:900;color:${seriesColor};">
            ${vm.myWins}–${vm.theirWins} · ${vm.statusText}
          </div>
        </div>

        <button id="rqPlayPigskin5" style="
            display:block;width:100%;padding:16px;margin-bottom:12px;
            background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;
            border-radius:14px;color:#fff;font-size:17px;font-weight:900;cursor:pointer;">
          Play Today's Pigskin5
        </button>

        <button id="rqViewDetail" style="
            display:block;width:100%;padding:14px;margin-bottom:12px;
            background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);
            border-radius:14px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;">
          View Rivalry Details
        </button>

        ${!theyPlayed ? `
        <button id="rqTaunt" style="
            display:block;width:100%;padding:14px;margin-bottom:12px;
            background:linear-gradient(135deg,#f97316,#ea580c);border:none;
            border-radius:14px;color:#fff;font-size:16px;font-weight:900;cursor:pointer;">
          🔥 Taunt Your Rival
        </button>` : ""}

        <button id="rqClose" style="
            background:none;border:none;color:rgba(255,255,255,0.35);
            font-size:13px;cursor:pointer;padding:8px;">
          Close
        </button>

        ${questionsHtml}
      </div>`;

    document.body.appendChild(overlay);

    const onAcceptPage = window.location.pathname.includes("/rivalry");

    overlay.querySelector("#rqPlayPigskin5")?.addEventListener("click", () => {
      if (onAcceptPage) { window.location.href = "../index.html"; return; }
      overlay.remove();
      document.body.style.overflow = "";
      document.getElementById("startBtn")?.click();
    });

    overlay.querySelector("#rqViewDetail")?.addEventListener("click", () => {
      if (onAcceptPage) { window.location.href = "../index.html"; return; }
      overlay.remove();
      document.body.style.overflow = "";
      openRivalryModal(rivalryId);
    });

    overlay.querySelector("#rqTaunt")?.addEventListener("click", () => {
      _copyTaunt(`${myScore}/5`);
    });

    overlay.querySelector("#rqClose")?.addEventListener("click", () => {
      if (onAcceptPage) { window.location.href = "../index.html"; return; }
      overlay.remove();
      document.body.style.overflow = "";
      const card = document.getElementById("rivalryCard");
      if (card?.parentElement) renderRivalryCard(card.parentElement);
    });
  });

  document.body.appendChild(overlay);
}

// ── Accept Page (used by rivalry/index.html) ──────────────

export async function renderAcceptPage(challengeId) {
  const root = document.getElementById("acceptRoot");
  if (!root) return;

  root.innerHTML = `<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.5);">
    Loading challenge…</div>`;

  const user = await getCurrentUser();

  if (!user) {
    root.innerHTML = `
      <div style="text-align:center;max-width:400px;margin:0 auto;padding:40px 20px;">
        <div style="font-size:32px;margin-bottom:16px;"></div>
        <h2 style="font-size:22px;margin-bottom:12px;">You've been challenged!</h2>
        <p style="color:rgba(255,255,255,0.55);font-size:15px;margin-bottom:24px;">
          Sign in or create a free account to accept this rivalry and compete!
        </p>
        <button id="acceptSignInBtn" style="
            padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);
            border:none;border-radius:14px;color:#fff;font-size:16px;
            font-weight:900;cursor:pointer;">
          Sign In / Create Account
        </button>
      </div>`;
    root.querySelector("#acceptSignInBtn")?.addEventListener("click", () => {
      document.getElementById("signInBtn")?.click();
    });
    return;
  }

  const { challenge, error } = await getRivalryChallenge(challengeId);

  if (error || !challenge) {
    root.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">
      This rivalry link is invalid or has expired.</div>`;
    return;
  }

  if (challenge.challenger_id === user.id) {
    root.innerHTML = `
      <div style="text-align:center;max-width:400px;margin:0 auto;padding:40px 20px;">
        <div style="font-size:32px;margin-bottom:12px;"></div>
        <h2 style="font-size:20px;margin-bottom:10px;">Waiting for your rival…</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:15px;">
          Share this link with a friend to start your rivalry!
        </p>
      </div>`;
    return;
  }

  if (challenge.status === "expired" || new Date(challenge.expires_at) < new Date()) {
    root.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">
      This rivalry link expired at midnight. Ask your friend to send a new one!</div>`;
    return;
  }

  if (challenge.status !== "pending") {
    root.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">
      This challenge has already been ${challenge.status}.</div>`;
    return;
  }

  const challengerName = challenge.challenger?.username || "Someone";

  let moreInfoShown = false;

  root.innerHTML = `
    <div style="text-align:center;max-width:400px;margin:0 auto;padding:40px 20px;">
      <div style="font-size:40px;margin-bottom:16px;"></div>
      <h2 style="font-size:22px;margin-bottom:10px;">
        ${challengerName} has challenged you to a rivalry!
      </h2>
      <p style="color:rgba(255,255,255,0.55);font-size:15px;margin-bottom:28px;">
        One quiz a day. Best of 7. No excuses.
      </p>

      <div style="display:flex;flex-direction:column;gap:12px;max-width:280px;margin:0 auto;">
        <button id="acceptYesBtn" style="
            padding:16px;background:linear-gradient(135deg,#22c55e,#16a34a);
            border:none;border-radius:14px;color:#fff;font-size:17px;
            font-weight:900;cursor:pointer;">
          Accept
        </button>
        <button id="acceptMoreBtn" style="
            padding:14px;background:rgba(255,255,255,0.07);
            border:1px solid rgba(255,255,255,0.2);border-radius:14px;
            color:#fff;font-size:15px;font-weight:700;cursor:pointer;">
          More Info
        </button>
        <button id="acceptNoBtn" style="
            padding:12px;background:none;border:none;
            color:rgba(255,255,255,0.35);font-size:14px;cursor:pointer;">
          No Thanks
        </button>
      </div>

      <div id="moreInfoBox" style="display:none;margin-top:20px;background:rgba(255,255,255,0.06);
          border-radius:14px;padding:18px 20px;text-align:left;">
        <div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;
            color:rgba(255,255,255,0.35);margin-bottom:12px;">How It Works</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="font-size:18px;line-height:1;">🏆</span>
            <span style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.45;">
              <strong style="color:#fff;">Best of 7 series</strong> — first to 4 wins takes it.
            </span>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="font-size:18px;line-height:1;">🏈</span>
            <span style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.45;">
              <strong style="color:#fff;">Play every day</strong> — a fresh 5-question NFL quiz drops daily. Whoever scores higher wins that day.
            </span>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="font-size:18px;line-height:1;">💀</span>
            <span style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.45;">
              <strong style="color:#fff;">Miss a day</strong> — your rival gets a free win. Don't sleep.
            </span>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="font-size:18px;line-height:1;">🤝</span>
            <span style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.45;">
              <strong style="color:#fff;">Both miss</strong> — the series ends immediately with no winner.
            </span>
          </div>
        </div>
      </div>
    </div>`;

  root.querySelector("#acceptMoreBtn")?.addEventListener("click", () => {
    moreInfoShown = !moreInfoShown;
    root.querySelector("#moreInfoBox").style.display = moreInfoShown ? "block" : "none";
  });

  root.querySelector("#acceptYesBtn")?.addEventListener("click", async () => {
    const btn = root.querySelector("#acceptYesBtn");
    btn.disabled = true;
    btn.textContent = "Accepting…";

    const { rivalryId, error: acceptErr } = await acceptChallenge(challengeId);
    if (acceptErr) {
      const msg = {
        slots_full:           "Your rivalry slots are full! Finish one first.",
        challenger_slots_full: "Your challenger's rivalry slots are full.",
        challenge_expired:    "This challenge has expired.",
        challenge_not_pending:"This challenge is no longer available.",
      }[acceptErr] || "Could not accept. Try again.";
      root.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.6);">
        ${msg}</div>`;
      return;
    }

    root.innerHTML = `
      <div style="text-align:center;max-width:400px;margin:0 auto;padding:40px 20px;">
        <div style="font-size:40px;margin-bottom:14px;">🎉</div>
        <h2 style="font-size:22px;margin-bottom:10px;">Rivalry started!</h2>
        <p style="color:rgba(255,255,255,0.55);font-size:15px;margin-bottom:24px;">
          Your series against ${challengerName} is live. Play your first rivalry quiz now!
        </p>
        <button id="playNowBtn" style="
            padding:16px 32px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);
            border:none;border-radius:14px;color:#fff;font-size:16px;
            font-weight:900;cursor:pointer;margin-bottom:12px;">
          Start Rivalry
        </button>
        <br>
        <a href="/" style="color:rgba(255,255,255,0.35);font-size:13px;">Go to Pigskin5</a>
      </div>`;

    root.querySelector("#playNowBtn")?.addEventListener("click", () => {
      openRivalryQuiz(rivalryId);
    });
  });

  root.querySelector("#acceptNoBtn")?.addEventListener("click", async () => {
    await declineChallenge(challengeId);
    root.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:40px;margin-bottom:16px;"></div>
        <div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;">Challenge Declined</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.55);margin-bottom:32px;">
          No hard feelings... but YIKES.
        </div>
        <a href="../index.html" style="
            display:inline-block;padding:14px 32px;
            background:linear-gradient(135deg,#3b82f6,#1d4ed8);
            border-radius:12px;color:#fff;font-size:16px;font-weight:800;
            text-decoration:none;">
          Play Pigskin5
        </a>
      </div>`;
  });
}
