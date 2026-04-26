import { fetchPlayerStats } from "./leaderboard.js";
import { NFL_TEAMS } from "./nfl-teams.js";
import { ACHIEVEMENTS } from "./achievements.js";
import { STREAK_TIERS } from "./config.js";

const X_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

function getTierForStreak(streakDays) {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_TIERS[i].minDays) return STREAK_TIERS[i];
  }
  return STREAK_TIERS[0];
}

// Display a temporary toast notification message
export function showToast(msg) {
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

function formatMemberSince(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Custom popup to show tier badge info
export async function showTierTooltip(emoji, tierName, streak, playerName, emojiScore, points, username) {
  const existing = document.getElementById("tier-popup-container");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "tier-popup-container";
  container.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    z-index: 999999; display: flex; align-items: center;
    justify-content: center; background: rgba(0,0,0,0.6);
  `;

  const card = document.createElement("div");
  card.className = "player-card";

  const body = document.createElement("div");
  body.className = "player-card__body";

  // --- Header: [color line] [tier emoji] [color line] ---
  const headerEl = document.createElement("div");
  headerEl.className = "player-card__header";

  const makeSideLines = () => {
    const wrap = document.createElement("div");
    wrap.className = "player-card__team-lines";
    const primary = document.createElement("div");
    primary.className = "player-card__team-line player-card__team-line--primary";
    const secondary = document.createElement("div");
    secondary.className = "player-card__team-line player-card__team-line--secondary";
    wrap.appendChild(primary);
    wrap.appendChild(secondary);
    return { wrap, primary, secondary };
  };

  const tierEmojiEl = document.createElement("div");
  tierEmojiEl.className = "player-card__tier-emoji";
  tierEmojiEl.textContent = emoji;

  const { wrap: linesLeft,  primary: leftPrimary,  secondary: leftSecondary  } = makeSideLines();
  const { wrap: linesRight, primary: rightPrimary, secondary: rightSecondary } = makeSideLines();

  headerEl.appendChild(linesLeft);
  headerEl.appendChild(tierEmojiEl);
  headerEl.appendChild(linesRight);
  body.appendChild(headerEl);

  // --- Display name ---
  const nameEl = document.createElement("div");
  nameEl.className = "player-card__display-name";
  nameEl.textContent = playerName || "Anonymous";

  // --- Username ---
  const usernameEl = document.createElement("div");
  usernameEl.className = "player-card__username";
  if (username) usernameEl.textContent = `@${username}`;

  // --- Tier + streak ---
  const tierRowEl = document.createElement("div");
  tierRowEl.className = "player-card__tier-row";
  tierRowEl.textContent = tierName;

  const streakEl = document.createElement("div");
  streakEl.className = "player-card__streak";
  streakEl.textContent = `${streak}-day streak`;

  // Twitter row (populated after async stats load; hidden until then)
  const twitterRowEl = document.createElement("div");
  twitterRowEl.className = "player-card__twitter-row";

  body.appendChild(nameEl);
  if (username) {
    body.appendChild(usernameEl);
    body.appendChild(twitterRowEl);
  }
  body.appendChild(tierRowEl);
  body.appendChild(streakEl);

  // --- Expanded sections (only for signed-in users with username) ---
  let memberSinceEl, statsEl, achievementsEl, badgeDescEl;

  if (username) {
    // Member since (skeleton)
    memberSinceEl = document.createElement("div");
    memberSinceEl.className = "player-card__member-since";
    memberSinceEl.textContent = "Member since …";
    body.appendChild(memberSinceEl);

    // Stats panel (skeleton)
    statsEl = document.createElement("div");
    statsEl.className = "player-card__stats";
    [["—", "Quizzes"], ["—", "Accuracy"], ["—", "Touchdown"]].forEach(([val, label]) => {
      const cell = document.createElement("div");
      cell.className = "player-card__stat";
      const v = document.createElement("div");
      v.className = "player-card__stat-value player-card__stat-value--loading";
      v.textContent = val;
      const l = document.createElement("div");
      l.className = "player-card__stat-label";
      l.textContent = label;
      cell.appendChild(v);
      cell.appendChild(l);
      statsEl.appendChild(cell);
    });
    body.appendChild(statsEl);

    // Achievements row (skeleton — all locked)
    achievementsEl = document.createElement("div");
    achievementsEl.className = "player-card__achievements";
    ACHIEVEMENTS.forEach(() => {
      const b = document.createElement("span");
      b.className = "player-card__badge player-card__badge--locked";
      b.textContent = "🔒";
      achievementsEl.appendChild(b);
    });
    body.appendChild(achievementsEl);

    // Badge description area (hidden until a badge is tapped)
    badgeDescEl = document.createElement("div");
    badgeDescEl.className = "player-card__badge-desc";
    body.appendChild(badgeDescEl);
  }

  // --- Score row + points ---
  if (emojiScore) {
    const scoreEl = document.createElement("div");
    scoreEl.className = "player-card__score-row";
    scoreEl.textContent = emojiScore;
    body.appendChild(scoreEl);
  }

  if (points !== undefined && points !== null) {
    const ptsEl = document.createElement("div");
    ptsEl.className = "player-card__points";
    ptsEl.textContent = `${Number(points).toLocaleString()} pts`;
    body.appendChild(ptsEl);
  }

  // --- Close hint ---
  const hintEl = document.createElement("div");
  hintEl.className = "player-card__close-hint";
  hintEl.textContent = "Tap outside to close";
  body.appendChild(hintEl);

  card.appendChild(body);
  container.appendChild(card);
  document.body.appendChild(container);

  // Only the backdrop (not the card itself) closes the popup
  const removePopup = () => {
    container.style.opacity = "0";
    container.style.transition = "opacity 0.2s";
    setTimeout(() => container.remove(), 200);
  };
  container.addEventListener("click", removePopup);
  container.addEventListener("touchend", removePopup);
  card.addEventListener("click", e => e.stopPropagation());
  card.addEventListener("touchend", e => e.stopPropagation());

  // --- Async stats population ---
  if (username) {
    (async () => {
      const stats = await fetchPlayerStats(username);
      if (!document.getElementById("tier-popup-container")) return;

      if (!stats) return;

      // Team color lines flanking the emoji
      if (stats.favoriteTeam) {
        const team = NFL_TEAMS.get(stats.favoriteTeam);
        if (team) {
          leftPrimary.style.background  = team.color;
          rightPrimary.style.background = team.color;
          const sec = team.secondary || team.color;
          leftSecondary.style.background  = sec;
          rightSecondary.style.background = sec;
        }
      }

      // Update streak with authoritative DB value
      if (stats.currentStreak != null) {
        const updatedTier = getTierForStreak(stats.currentStreak);
        streakEl.textContent = `${stats.currentStreak}-day streak`;
        tierEmojiEl.textContent = updatedTier.emoji;
        tierRowEl.textContent = updatedTier.name;
      }

      // Twitter handle
      if (stats.twitterHandle && twitterRowEl) {
        const xLink = document.createElement("a");
        xLink.href = `https://twitter.com/${stats.twitterHandle}`;
        xLink.target = "_blank";
        xLink.rel = "noopener noreferrer";
        xLink.className = "player-card__twitter-icon";
        xLink.innerHTML = X_SVG;
        xLink.addEventListener("click", e => e.stopPropagation());

        const handleLink = document.createElement("a");
        handleLink.href = `https://twitter.com/${stats.twitterHandle}`;
        handleLink.target = "_blank";
        handleLink.rel = "noopener noreferrer";
        handleLink.className = "player-card__twitter-handle-link";
        handleLink.textContent = `@${stats.twitterHandle}`;
        handleLink.addEventListener("click", e => e.stopPropagation());

        twitterRowEl.appendChild(xLink);
        twitterRowEl.appendChild(handleLink);
      }

      // Member since
      const since = formatMemberSince(stats.memberSince);
      if (since && memberSinceEl) memberSinceEl.textContent = `Member since ${since}`;

      // Stats panel
      if (statsEl) {
        const cells = statsEl.querySelectorAll(".player-card__stat");
        const values = [
          stats.totalQuizzes.toLocaleString(),
          `${stats.accuracyPct}%`,
          stats.totalPerfect.toLocaleString(),
        ];
        const labels = [
          "Quizzes",
          "Accuracy",
          stats.totalPerfect === 1 ? "Touchdown" : "Touchdowns",
        ];
        cells.forEach((cell, i) => {
          const v = cell.querySelector(".player-card__stat-value");
          const l = cell.querySelector(".player-card__stat-label");
          v.textContent = values[i];
          v.classList.remove("player-card__stat-value--loading");
          l.textContent = labels[i];
        });
      }

      // Achievements
      if (achievementsEl) {
        const earned = new Set(stats.achievements || []);
        const badges = achievementsEl.querySelectorAll(".player-card__badge");
        let activeBadge = null;

        ACHIEVEMENTS.forEach((achievement, i) => {
          const b = badges[i];
          if (!b) return;
          const isEarned = earned.has(achievement.id);
          if (isEarned) {
            b.textContent = achievement.emoji;
            b.classList.remove("player-card__badge--locked");
          }

          const showDesc = (e) => {
            e.stopPropagation();
            if (activeBadge === b && badgeDescEl.textContent) {
              badgeDescEl.textContent = "";
              activeBadge = null;
              return;
            }
            activeBadge = b;
            const prefix = isEarned ? achievement.emoji : "🔒";
            badgeDescEl.textContent = `${prefix} ${achievement.name}: ${achievement.desc}`;
          };

          b.addEventListener("click", showDesc);
          b.addEventListener("touchend", (e) => { e.preventDefault(); showDesc(e); });
        });
      }
    })();
  }
}
