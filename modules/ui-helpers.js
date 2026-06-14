import { fetchPlayerStats } from "./leaderboard.js";
import { createRivalryChallenge, getPendingChallengeWith, isAtRivalryCap } from "./rivalry.js";
import { NFL_TEAMS } from "./nfl-teams.js";
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from "./achievements.js";
import { STREAK_TIERS } from "./config.js";

const X_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

function getTierForStreak(streakDays) {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_TIERS[i].minDays) return STREAK_TIERS[i];
  }
  return STREAK_TIERS[0];
}

// Queue and display achievement unlock toasts one at a time after a quiz
export function showAchievementToast(badgeIds) {
  const toShow = badgeIds
    .map(id => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean);
  if (!toShow.length) return;

  let index = 0;

  function showNext() {
    if (index >= toShow.length) return;
    const achievement = toShow[index++];

    const el = document.createElement("div");
    el.className = "achievement-toast";
    el.innerHTML = `
      <span class="achievement-toast__icon">${achievement.emoji}</span>
      <div class="achievement-toast__body">
        <div class="achievement-toast__label">Achievement Unlocked</div>
        <div class="achievement-toast__name">${achievement.name}</div>
      </div>
      <div class="achievement-toast__pts">+${achievement.points} pts</div>
    `;
    document.body.appendChild(el);

    requestAnimationFrame(() => el.classList.add("show"));

    const dismiss = () => {
      el.classList.remove("show");
      setTimeout(() => {
        el.remove();
        setTimeout(showNext, 350);
      }, 400);
    };

    el.addEventListener("click", () => {
      dismiss();
      window.dispatchEvent(new CustomEvent("pigskin5:open-profile"));
    }, { once: true });
    setTimeout(dismiss, 3500);
  }

  // Small delay so the toast appears after the results UI settles
  setTimeout(showNext, 800);
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

// Custom popup to show tier badge info (other-player view — from leaderboard clicks)
export async function showTierTooltip(emoji, tierName, streak, playerName, emojiScore, points, username, titleText = null) {
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

  if (titleText) {
    const titleEl = document.createElement("div");
    titleEl.className = "player-card__champion-title";
    titleEl.textContent = titleText;
    card.appendChild(titleEl);
  }

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

  const { wrap: linesLeft, primary: leftPrimary, secondary: leftSecondary } = makeSideLines();
  const { wrap: linesRight, primary: rightPrimary, secondary: rightSecondary } = makeSideLines();

  headerEl.appendChild(linesLeft);
  headerEl.appendChild(tierEmojiEl);
  headerEl.appendChild(linesRight);
  body.appendChild(headerEl);

  // --- Display name ---
  const nameEl = document.createElement("div");
  nameEl.className = "player-card__display-name";
  nameEl.textContent = playerName || "Anonymous";
  body.appendChild(nameEl);

  // --- Username ---
  if (username) {
    const usernameEl = document.createElement("div");
    usernameEl.className = "player-card__username";
    usernameEl.textContent = `@${username}`;
    body.appendChild(usernameEl);
  }

  // --- Twitter row (view-only; populated after async load) ---
  const twitterRowEl = document.createElement("div");
  twitterRowEl.className = "player-card__twitter-row";
  if (username) body.appendChild(twitterRowEl);

  // --- Tier name (large/bold) ---
  const tierRowEl = document.createElement("div");
  tierRowEl.className = "player-card__tier-row";
  tierRowEl.textContent = tierName;
  body.appendChild(tierRowEl);

  // --- Streak count ---
  const streakEl = document.createElement("div");
  streakEl.className = "player-card__streak";
  streakEl.textContent = `${streak}-day streak`;
  body.appendChild(streakEl);

  // --- Member since (populated after async load) ---
  let memberSinceEl;
  if (username) {
    memberSinceEl = document.createElement("div");
    memberSinceEl.className = "player-card__member-since";
    body.appendChild(memberSinceEl);
  }

  // --- Stats + achievements (signed-in players only) ---
  let statsEl, todayEl, achievementsEl, badgeDescEl, rivalryRecordEl;
  let targetUserId = null; // set async once stats load; used by the challenge confirmation

  if (username) {
    // 6-stat skeleton in 3×2 grid
    statsEl = document.createElement("div");
    statsEl.className = "player-card__stats";
    [
      ["—", "Quizzes"],
      ["—", "Touchdowns"],
      ["—", "Daily Wins"],
      ["—", "Best Week"],
      ["—", "Pigskin IQ"],
      ["—", "Accuracy"],
    ].forEach(([val, label]) => {
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

    // --- Today's quiz (shown only if player has played today; populated async) ---
    todayEl = document.createElement("div");
    todayEl.className = "player-card__today";
    todayEl.style.display = "none";
    body.appendChild(todayEl);

    // --- Achievements toggle (collapsed by default) ---
    const achToggleEl = document.createElement("div");
    achToggleEl.className = "player-card__ach-toggle";
    const achChevron = document.createElement("span");
    achChevron.className = "player-card__ach-chevron";
    achChevron.textContent = "▸";
    achToggleEl.appendChild(document.createTextNode("Achievements "));
    achToggleEl.appendChild(achChevron);
    body.appendChild(achToggleEl);

    // Achievements panel (hidden until toggled) — locked skeleton
    achievementsEl = document.createElement("div");
    achievementsEl.className = "player-card__achievements player-card__achievements--hidden";
    ACHIEVEMENT_CATEGORIES.forEach(cat => {
      const catEl = document.createElement("div");
      catEl.className = "player-card__achievement-category";
      const labelEl = document.createElement("div");
      labelEl.className = "player-card__achievement-category-label";
      labelEl.textContent = cat.label;
      catEl.appendChild(labelEl);
      const rowEl = document.createElement("div");
      rowEl.className = "player-card__achievements-row";
      ACHIEVEMENTS.filter(a => a.category === cat.id).forEach(() => {
        const b = document.createElement("span");
        b.className = "player-card__badge player-card__badge--locked";
        b.textContent = "🔒";
        rowEl.appendChild(b);
      });
      catEl.appendChild(rowEl);
      achievementsEl.appendChild(catEl);
    });
    body.appendChild(achievementsEl);

    badgeDescEl = document.createElement("div");
    badgeDescEl.className = "player-card__badge-desc";
    body.appendChild(badgeDescEl);

    achToggleEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !achievementsEl.classList.contains("player-card__achievements--hidden");
      if (isOpen) {
        achievementsEl.classList.add("player-card__achievements--hidden");
        achChevron.classList.remove("player-card__ach-chevron--open");
        badgeDescEl.innerHTML = "";
      } else {
        achievementsEl.classList.remove("player-card__achievements--hidden");
        achChevron.classList.add("player-card__ach-chevron--open");
      }
    });

    // --- Rivalry record row ---
    const rivalryRowEl = document.createElement("div");
    rivalryRowEl.className = "player-card__rivalry-row";
    const rivalryLabel = document.createElement("span");
    rivalryLabel.className = "player-card__rivalry-label";
    rivalryLabel.textContent = "RIVALRY RECORD";
    rivalryRecordEl = document.createElement("span");
    rivalryRecordEl.className = "player-card__rivalry-record player-card__stat-value--loading";
    rivalryRecordEl.textContent = "—";
    rivalryRowEl.appendChild(rivalryLabel);
    rivalryRowEl.appendChild(rivalryRecordEl);
    body.appendChild(rivalryRowEl);

    // --- Challenge button (other-player card only) ---
    const challengeBtn = document.createElement("button");
    challengeBtn.className = "player-card__challenge-btn";
    challengeBtn.textContent = "Challenge to Rivalry";
    challengeBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const confirmEl = document.createElement("div");
      confirmEl.className = "player-card__confirm";

      const confirmText = document.createElement("p");
      confirmText.className = "player-card__confirm-text";
      confirmText.textContent = `Challenge ${playerName || "this player"} to a rivalry?`;

      const confirmBtns = document.createElement("div");
      confirmBtns.className = "player-card__confirm-btns";

      const yesBtn = document.createElement("button");
      yesBtn.className = "player-card__confirm-yes";
      yesBtn.textContent = "Yes, Challenge!";

      const noBtn = document.createElement("button");
      noBtn.className = "player-card__confirm-no";
      noBtn.textContent = "No, Go Back";

      confirmBtns.appendChild(yesBtn);
      confirmBtns.appendChild(noBtn);
      confirmEl.appendChild(confirmText);
      confirmEl.appendChild(confirmBtns);

      challengeBtn.replaceWith(confirmEl);

      yesBtn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        if (targetUserId) {
          yesBtn.disabled = true;
          yesBtn.textContent = "Sending…";
          const { error } = await createRivalryChallenge(targetUserId);
          if (error) {
            const msgs = {
              slots_full:               "Your rivalry slots are full!",
              already_challenged:        "You already challenged this player — check your Rivalries Box!",
              incoming_challenge_exists: "This player already challenged you — check your Rivalries Box!",
            };
            showToast(msgs[error] || "Error sending challenge.");
            if (error === "already_challenged" || error === "incoming_challenge_exists") {
              confirmText.textContent = error === "incoming_challenge_exists"
                ? "They already challenged you!"
                : "Challenge already sent!";
              confirmText.style.color = "rgba(255,255,255,0.5)";
              confirmBtns.remove();
              setTimeout(() => removePopup(), 1800);
            } else {
              confirmEl.replaceWith(challengeBtn);
            }
            return;
          }
          confirmText.textContent = "Challenge sent! 🏈";
          confirmText.style.color = "#22c55e";
          confirmBtns.remove();
          setTimeout(() => removePopup(), 1400);
        } else {
          removePopup();
          window.dispatchEvent(new CustomEvent("pigskin5:start-new-rivalry"));
        }
      });

      noBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        confirmEl.replaceWith(challengeBtn);
      });
    });
    body.appendChild(challengeBtn);
  }

  // --- Close button ---
  const closeBtn = document.createElement("button");
  closeBtn.className = "player-card__close-btn";
  closeBtn.textContent = "Close";
  body.appendChild(closeBtn);

  card.appendChild(body);
  container.appendChild(card);
  document.body.appendChild(container);
  document.body.style.overflow = "hidden";

  const removePopup = () => {
    container.style.opacity = "0";
    container.style.transition = "opacity 0.2s";
    setTimeout(() => container.remove(), 200);
    document.body.style.overflow = "";
  };

  container.addEventListener("click", removePopup);
  container.addEventListener("touchend", removePopup);
  card.addEventListener("click", e => e.stopPropagation());
  card.addEventListener("touchend", e => e.stopPropagation());
  closeBtn.addEventListener("click", (e) => { e.stopPropagation(); removePopup(); });
  closeBtn.addEventListener("touchend", (e) => { e.preventDefault(); e.stopPropagation(); removePopup(); });

  // --- Async stats population ---
  if (username) {
    (async () => {
      const stats = await fetchPlayerStats(username);
      if (!document.getElementById("tier-popup-container")) return;
      if (!stats) return;

      targetUserId = stats.userId;

      // Lock button if there's already a pending challenge in either direction,
      // or if the viewer has no open rivalry slots (active + pending >= 5).
      Promise.all([getPendingChallengeWith(targetUserId), isAtRivalryCap()]).then(
        ([{ outgoing, incoming }, atCap]) => {
          if (!challengeBtn.isConnected) return;
          if (outgoing || incoming) {
            challengeBtn.textContent = incoming ? "Pending Invite from Them" : "Challenge Sent ✓";
            challengeBtn.disabled = true;
            challengeBtn.style.opacity = "0.55";
            challengeBtn.style.cursor = "default";
          } else if (atCap) {
            challengeBtn.textContent = "Rivalry Slots Full";
            challengeBtn.disabled = true;
            challengeBtn.style.opacity = "0.55";
            challengeBtn.style.cursor = "default";
          }
        }
      );

      // Team color side lines
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

      // Update tier emoji, tier name, and streak with authoritative DB values
      if (stats.currentStreak != null) {
        const updatedTier = getTierForStreak(stats.currentStreak);
        tierEmojiEl.textContent = updatedTier.emoji;
        tierRowEl.textContent = updatedTier.name;
        streakEl.textContent = `${stats.currentStreak}-day streak`;
      }

      // Member since
      const since = formatMemberSince(stats.memberSince);
      if (since && memberSinceEl) memberSinceEl.textContent = `Member since ${since}`;

      // Twitter handle (view-only)
      if (stats.twitterHandle) {
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

      // 6 stat boxes
      if (statsEl) {
        const cells = statsEl.querySelectorAll(".player-card__stat");
        const values = [
          stats.totalQuizzes.toLocaleString(),
          stats.totalPerfect.toLocaleString(),
          (stats.dailyLeaderboardWins ?? 0).toLocaleString(),
          stats.bestWeekPoints > 0 ? stats.bestWeekPoints.toLocaleString() : "—",
          (stats.pigskinIQ ?? 0).toLocaleString(),
          `${stats.accuracyPct}%`,
        ];
        const labels = [
          "Quizzes",
          stats.totalPerfect === 1 ? "Touchdown" : "Touchdowns",
          "Daily Wins",
          "Best Week",
          "Pigskin IQ",
          "Accuracy",
        ];
        cells.forEach((cell, i) => {
          const v = cell.querySelector(".player-card__stat-value");
          const l = cell.querySelector(".player-card__stat-label");
          v.textContent = values[i];
          v.classList.remove("player-card__stat-value--loading");
          l.textContent = labels[i];
        });
      }

      // Today's quiz result
      if (stats.todayEmojiGrid) {
        todayEl.innerHTML = `
          <div class="player-card__today-label">TODAY'S QUIZ</div>
          <div class="player-card__today-grid">${stats.todayEmojiGrid}</div>
          <div class="player-card__today-score">${stats.todayPoints} pts</div>
        `;
        todayEl.style.display = "";
      }

      // Rivalry record
      if (rivalryRecordEl) {
        rivalryRecordEl.textContent = `${stats.rivalryWins ?? 0}–${stats.rivalryLosses ?? 0}`;
        rivalryRecordEl.classList.remove("player-card__stat-value--loading");
      }

      // Achievements — unlock earned badges
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
            if (activeBadge === b && badgeDescEl.innerHTML) {
              badgeDescEl.innerHTML = "";
              activeBadge = null;
              return;
            }
            activeBadge = b;
            const prefix = isEarned ? achievement.emoji : "🔒";
            const nameSpan = document.createElement("span");
            nameSpan.className = "player-card__badge-name";
            nameSpan.textContent = `${prefix} ${achievement.name}`;
            const descSpan = document.createElement("span");
            descSpan.className = "player-card__badge-desc-text";
            descSpan.textContent = `${achievement.desc} (+${achievement.points} IQ)`;
            badgeDescEl.innerHTML = "";
            badgeDescEl.appendChild(nameSpan);
            badgeDescEl.appendChild(descSpan);
          };

          b.addEventListener("click", showDesc);
          b.addEventListener("touchend", (e) => { e.preventDefault(); showDesc(e); });
        });
      }
    })();
  }
}
