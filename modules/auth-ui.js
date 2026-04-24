// auth-ui.js
import { sendMagicLink, setUsername, signOut } from "./auth.js";
import { onAuthChange, getCurrentProfile, supabase } from "./supabase-client.js";
import { refreshStreakCache, checkAchievementsNow, getCachedDailyStreak, getCachedFavoriteTeam, fetchPlayerStats } from "./leaderboard.js";
import { NFL_TEAMS_SORTED, NFL_TEAMS } from "./nfl-teams.js";
import { ACHIEVEMENTS } from "./achievements.js";
import { showToast } from "./ui-helpers.js";
import { STREAK_TIERS } from "./config.js";

const modal = document.getElementById("authModal");
const closeBtn = document.getElementById("authClose");
const signInBtn = document.getElementById("signInBtn");
const submitBtn = document.getElementById("authSubmit");
const emailInput = document.getElementById("authEmail");
const messageEl = document.getElementById("authMessage");
const emailOptInSection = document.getElementById("emailOptInSection");
const emailOptInToggle = document.getElementById("emailOptInToggle");

function openModal() {
  modal.hidden = false;
  emailInput.focus();
}
function closeModal() {
  modal.hidden = true;
  messageEl.hidden = true;
}
function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? "#e74c3c" : "#2ecc71";
  messageEl.hidden = false;
}

async function handleSubmit() {
  const email = emailInput.value.trim();
  if (!email) return showMessage("Email is required.", true);
  
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  const result = await sendMagicLink(email);
  submitBtn.disabled = false;
  submitBtn.textContent = "Continue with email";
  showMessage(result.error || result.message, !!result.error);
}

signInBtn.onclick = openModal;
closeBtn?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
submitBtn?.addEventListener("click", handleSubmit);
emailInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSubmit(); });

function initEmailOptIn(profile) {
  if (!emailOptInSection || !emailOptInToggle) return;
  emailOptInToggle.checked = profile?.email_marketing_opt_in ?? false;
  emailOptInSection.hidden = false;
}

function hideEmailOptIn() {
  if (!emailOptInSection) return;
  emailOptInSection.hidden = true;
}

emailOptInToggle?.addEventListener("change", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const newValue = emailOptInToggle.checked;
  const { error } = await supabase
    .from("profiles")
    .update({ email_marketing_opt_in: newValue })
    .eq("id", user.id);
  if (error) {
    console.error("Failed to update email opt-in:", error);
    emailOptInToggle.checked = !newValue;
    showToast("Failed to save preference. Please try again.");
  }
});

onAuthChange(async (user) => {
  if (user) {
    closeModal();
    const profile = await getCurrentProfile();
    initEmailOptIn(profile);
    const needsOnboarding = !profile?.username || profile.username.startsWith('user_');

    if (needsOnboarding) {
  showOnboardingPrompt();
} else {
  updateSignedInButton(profile.username);
  await refreshStreakCache();
  checkAchievementsNow().catch(() => {});
  if (!profile.favorite_team) maybeShowTeamPickerPrompt();
}
  } else {
    signInBtn.textContent = "Sign in";
    signInBtn.onclick = openModal;
    hideEmailOptIn();
  }
});

function updateSignedInButton(username) {
  signInBtn.textContent = `Hi, ${username} ▾`;
  signInBtn.onclick = () => showProfileModal(username);
}

function getTierForStreak(streak) {
  let tier = STREAK_TIERS[0];
  for (const t of STREAK_TIERS) {
    if (streak >= t.minDays) tier = t;
  }
  return tier;
}

function formatMemberSinceLocal(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function showProfileModal(username) {
  const existing = document.getElementById("profile-modal-container");
  if (existing) {
    existing.style.opacity = "0";
    existing.style.transition = "opacity 0.2s";
    setTimeout(() => existing.remove(), 200);
    return;
  }

  const streak = getCachedDailyStreak();
  const tier = getTierForStreak(streak);

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

  // Header: team color lines flanking tier emoji
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
  tierEmojiEl.textContent = tier.emoji;

  const { wrap: linesLeft,  primary: leftPrimary,  secondary: leftSecondary  } = makeSideLines();
  const { wrap: linesRight, primary: rightPrimary, secondary: rightSecondary } = makeSideLines();

  headerEl.appendChild(linesLeft);
  headerEl.appendChild(tierEmojiEl);
  headerEl.appendChild(linesRight);
  body.appendChild(headerEl);

  // Identity
  const nameEl = document.createElement("div");
  nameEl.className = "player-card__display-name";
  nameEl.textContent = username;

  const usernameEl = document.createElement("div");
  usernameEl.className = "player-card__username";
  usernameEl.textContent = `@${username}`;

  const tierRowEl = document.createElement("div");
  tierRowEl.className = "player-card__tier-row";
  tierRowEl.textContent = tier.name;

  const streakEl = document.createElement("div");
  streakEl.className = "player-card__streak";
  streakEl.textContent = `${streak}-day streak`;

  body.appendChild(nameEl);
  body.appendChild(usernameEl);
  body.appendChild(tierRowEl);
  body.appendChild(streakEl);

  // Member since (skeleton)
  const memberSinceEl = document.createElement("div");
  memberSinceEl.className = "player-card__member-since";
  memberSinceEl.textContent = "Member since …";
  body.appendChild(memberSinceEl);

  // Stats panel (skeleton)
  const statsEl = document.createElement("div");
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

  // Achievements (locked skeleton)
  const achievementsEl = document.createElement("div");
  achievementsEl.className = "player-card__achievements";
  ACHIEVEMENTS.forEach(() => {
    const b = document.createElement("span");
    b.className = "player-card__badge player-card__badge--locked";
    b.textContent = "🔒";
    achievementsEl.appendChild(b);
  });
  body.appendChild(achievementsEl);

  const badgeDescEl = document.createElement("div");
  badgeDescEl.className = "player-card__badge-desc";
  body.appendChild(badgeDescEl);

  // Favorite team selector
  const teamLabelEl = document.createElement("div");
  teamLabelEl.className = "profile-modal__section-label";
  teamLabelEl.textContent = "Favorite Team";

  const teamSelect = document.createElement("select");
  teamSelect.className = "profile-modal__team-select";

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "— No team —";
  teamSelect.appendChild(defaultOpt);

  NFL_TEAMS_SORTED.forEach(({ abbr, name }) => {
    if (abbr === "LIN") return;
    const opt = document.createElement("option");
    opt.value = abbr;
    opt.textContent = name;
    teamSelect.appendChild(opt);
  });

  const cachedTeam = getCachedFavoriteTeam();
  if (cachedTeam) teamSelect.value = cachedTeam;

  const applyTeamColors = (teamCode) => {
    if (!teamCode) {
      [leftPrimary, rightPrimary, leftSecondary, rightSecondary].forEach(el => {
        el.style.background = "";
      });
      return;
    }
    const team = NFL_TEAMS.get(teamCode);
    if (!team) return;
    leftPrimary.style.background  = team.color;
    rightPrimary.style.background = team.color;
    const sec = team.secondary || team.color;
    leftSecondary.style.background  = sec;
    rightSecondary.style.background = sec;
  };

  if (cachedTeam) applyTeamColors(cachedTeam);

  let savedTeam = cachedTeam;
  teamSelect.addEventListener("change", async () => {
    const teamValue = teamSelect.value || null;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ favorite_team: teamValue })
      .eq("id", user.id);
    if (!error) {
      savedTeam = teamValue;
      applyTeamColors(teamValue);
      showToast(teamValue ? "Team updated!" : "Team removed.");
    } else {
      teamSelect.value = savedTeam || "";
      showToast("Failed to update team.");
    }
  });

  body.appendChild(teamLabelEl);
  body.appendChild(teamSelect);

  // Sign out
  const signOutBtn = document.createElement("button");
  signOutBtn.className = "profile-modal__signout-btn";
  signOutBtn.textContent = "Sign out";
  signOutBtn.addEventListener("click", async () => {
    dismiss();
    await signOut();
  });
  body.appendChild(signOutBtn);

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
  container.addEventListener("click", dismiss);
  container.addEventListener("touchend", dismiss);
  card.addEventListener("click", e => e.stopPropagation());
  card.addEventListener("touchend", e => e.stopPropagation());
  document.addEventListener("keydown", onKey);


  // Async stats population
  (async () => {
    const stats = await fetchPlayerStats(username);
    if (!document.getElementById("profile-modal-container")) return;
    if (!stats) return;

    // Team colors (server data takes priority over cache)
    if (stats.favoriteTeam && stats.favoriteTeam !== savedTeam) {
      teamSelect.value = stats.favoriteTeam;
      savedTeam = stats.favoriteTeam;
      applyTeamColors(stats.favoriteTeam);
    } else if (!savedTeam && stats.favoriteTeam) {
      teamSelect.value = stats.favoriteTeam;
      savedTeam = stats.favoriteTeam;
      applyTeamColors(stats.favoriteTeam);
    }

    // Update streak with authoritative DB value
    if (stats.currentStreak != null) {
      const updatedTier = getTierForStreak(stats.currentStreak);
      streakEl.textContent = `${stats.currentStreak}-day streak`;
      tierEmojiEl.textContent = updatedTier.emoji;
      tierRowEl.textContent = updatedTier.name;
    }

    // Member since
    const since = formatMemberSinceLocal(stats.memberSince);
    if (since) memberSinceEl.textContent = `Member since ${since}`;

    // Stats
    const cells = statsEl.querySelectorAll(".player-card__stat");
    const values = [
      stats.totalQuizzes.toLocaleString(),
      `${stats.accuracyPct}%`,
      stats.totalPerfect.toLocaleString(),
    ];
    const labels = ["Quizzes", "Accuracy", stats.totalPerfect === 1 ? "Touchdown" : "Touchdowns"];
    cells.forEach((cell, i) => {
      const v = cell.querySelector(".player-card__stat-value");
      const l = cell.querySelector(".player-card__stat-label");
      v.textContent = values[i];
      v.classList.remove("player-card__stat-value--loading");
      l.textContent = labels[i];
    });

    // Achievements
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
  })();
}

function showOnboardingPrompt() {
  if (document.getElementById("onboardingPrompt")) return;

  const panel = document.createElement("div");
  panel.id = "onboardingPrompt";
  panel.className = "username-prompt";
  panel.innerHTML = `
    <div class="username-prompt-content">
      <h3>Welcome to Pigskin5!</h3>
      <p>Just a few quick things to set up your account.</p>
      
      <input type="text" id="onboardingUsername" placeholder="username (3-20 chars, no spaces)" maxlength="20" />
      <p class="auth-warning">⚠️ Your username cannot be changed after setup.</p>
      
      <label class="auth-checkbox-label">
        <input type="checkbox" id="onboardingTerms" />
        <span>I agree to the <a href="terms.html" target="_blank">Terms of Service</a> and <a href="privacy.html" target="_blank">Privacy Policy</a></span>
      </label>
      
      <label class="auth-checkbox-label">
        <input type="checkbox" id="onboardingOptIn" />
        <span>Email me when the daily quiz drops (optional)</span>
      </label>

      <div class="auth-field-group">
        <label class="auth-field-label">Favorite team (optional)</label>
        <select id="onboardingTeam">
          <option value="">-- Pick a team --</option>
        </select>
      </div>

      <button id="onboardingSubmit" disabled>Finish setup</button>
      
      <div id="onboardingMessage" class="auth-message" hidden></div>
    </div>
  `;
  document.body.appendChild(panel);

  const usernameInput = document.getElementById("onboardingUsername");
  const termsCheck = document.getElementById("onboardingTerms");
  const optInCheck = document.getElementById("onboardingOptIn");
  const teamSelect = document.getElementById("onboardingTeam");
  const submitBtn = document.getElementById("onboardingSubmit");
  const msgEl = document.getElementById("onboardingMessage");

  // Populate team dropdown
  NFL_TEAMS_SORTED.forEach(({ abbr, name }) => {
    if (abbr === "LIN") return;
    const opt = document.createElement("option");
    opt.value = abbr;
    opt.textContent = name;
    teamSelect.appendChild(opt);
  });

  usernameInput.focus();

  // Enable button only when terms is checked
  termsCheck.addEventListener("change", () => {
    submitBtn.disabled = !termsCheck.checked;
  });

  const submit = async () => {
    const username = usernameInput.value.trim();
    if (!username) {
      msgEl.textContent = "Username is required.";
      msgEl.style.color = "#e74c3c";
      msgEl.hidden = false;
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    // Set username
    const result = await setUsername(username);
    if (result.error) {
      msgEl.textContent = result.error;
      msgEl.style.color = "#e74c3c";
      msgEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Finish setup";
      return;
    }

    // Persist terms + opt-in + favorite team
    const { data: { user } } = await supabase.auth.getUser();
    const teamValue = teamSelect.value || null;
    await supabase
      .from("profiles")
      .update({
        terms_accepted_at: new Date().toISOString(),
        email_marketing_opt_in: optInCheck.checked,
        ...(teamValue && { favorite_team: teamValue }),
      })
      .eq("id", user.id);

    panel.remove();
    updateSignedInButton(username);
    await refreshStreakCache();
      checkAchievementsNow().catch(() => {});
  };

  submitBtn.addEventListener("click", submit);
  usernameInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && !submitBtn.disabled) submit(); });
}

function maybeShowTeamPickerPrompt() {
  // Only show once per session — if they skipped, don't nag again until next visit
  if (sessionStorage.getItem("ps5_team_prompt_shown")) return;
  if (document.getElementById("teamPickerPrompt")) return;
  sessionStorage.setItem("ps5_team_prompt_shown", "1");

  const panel = document.createElement("div");
  panel.id = "teamPickerPrompt";
  panel.className = "username-prompt";
  panel.innerHTML = `
    <div class="username-prompt-content">
      <h3>🏈 Pick Your Team</h3>
      <p>Show some loyalty! Your favorite team will appear on your player card.</p>

      <div class="auth-field-group">
        <select id="teamPickerSelect">
          <option value="">-- Pick a team --</option>
        </select>
      </div>

      <button id="teamPickerSave">Save My Team</button>
      <button id="teamPickerSkip" class="auth-skip-btn">Skip for now</button>

      <div id="teamPickerMessage" class="auth-message" hidden></div>
    </div>
  `;
  document.body.appendChild(panel);

  const teamSelect = document.getElementById("teamPickerSelect");
  const saveBtn = document.getElementById("teamPickerSave");
  const skipBtn = document.getElementById("teamPickerSkip");
  const msgEl = document.getElementById("teamPickerMessage");

  NFL_TEAMS_SORTED.forEach(({ abbr, name }) => {
    if (abbr === "LIN") return;
    const opt = document.createElement("option");
    opt.value = abbr;
    opt.textContent = name;
    teamSelect.appendChild(opt);
  });

  skipBtn.addEventListener("click", () => panel.remove());

  saveBtn.addEventListener("click", async () => {
    const teamValue = teamSelect.value;
    if (!teamValue) {
      msgEl.textContent = "Please pick a team first!";
      msgEl.style.color = "#e74c3c";
      msgEl.hidden = false;
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ favorite_team: teamValue })
      .eq("id", user.id);

    if (error) {
      msgEl.textContent = "Something went wrong. Try again.";
      msgEl.style.color = "#e74c3c";
      msgEl.hidden = false;
      saveBtn.disabled = false;
      saveBtn.textContent = "Save My Team";
      return;
    }

    panel.remove();
  });
}