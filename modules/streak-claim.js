import { supabase, getCurrentUser, getCurrentProfile } from "./supabase-client.js";
import { refreshStreakCache } from "./leaderboard.js";

const CUTOFF_DATE = new Date("2026-05-01T00:00:00-07:00");  // May 1, 2026 PST

export async function maybeShowStreakClaimPrompt() {
  // Only for logged-in users
  const user = await getCurrentUser();
  if (!user) return;

  // Only before cutoff
  if (new Date() >= CUTOFF_DATE) return;

  // Only if they haven't claimed already
  const { data: existingClaim } = await supabase
    .from("streak_claims")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingClaim) return;

  // Only if they have something worth claiming in localStorage
  const dailyStreak = parseInt(localStorage.getItem("dailyStreak") || "0", 10);
  const tdStreak = parseInt(localStorage.getItem("tdStreak") || "0", 10);
  if (dailyStreak < 1 && tdStreak < 1) return;

  showPrompt(dailyStreak, tdStreak);
}

function showPrompt(dailyStreak, tdStreak) {
  if (document.getElementById("streakClaimPrompt")) return;

  const cappedDaily = Math.min(dailyStreak, 250);
  const cappedTD = Math.min(tdStreak, 250);

  const panel = document.createElement("div");
  panel.id = "streakClaimPrompt";
  panel.className = "username-prompt";  // reuse styling
  panel.innerHTML = `
    <div class="username-prompt-content">
      <h3>🏈 Claim your streak!</h3>
      <p>We see you've been playing Pigskin5 on this device. Lock in your streak before May 1 — otherwise it'll reset.</p>
      <div style="background:rgba(255,255,255,0.08); padding:14px; border-radius:8px; margin:16px 0; text-align:left;">
        <div style="margin-bottom:6px;">Daily streak: <strong>${cappedDaily} day${cappedDaily === 1 ? '' : 's'}</strong></div>
        <div>Touchdown streak: <strong>${cappedTD}</strong></div>
      </div>
      <button id="streakClaimSubmit">Claim my streak</button>
      <button id="streakClaimDismiss" style="background:none; color:rgba(255,255,255,0.5); border:none; margin-top:10px; cursor:pointer; font-size:13px; width:100%;">Maybe later</button>
      <div id="streakClaimMessage" class="auth-message" hidden></div>
    </div>
  `;
  document.body.appendChild(panel);

  const claimBtn = document.getElementById("streakClaimSubmit");
  const dismissBtn = document.getElementById("streakClaimDismiss");
  const msgEl = document.getElementById("streakClaimMessage");

  dismissBtn.onclick = () => panel.remove();

  claimBtn.onclick = async () => {
    claimBtn.disabled = true;
    claimBtn.textContent = "Claiming...";

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("streak_claims")
      .insert({
        user_id: user.id,
        claimed_streak: cappedDaily,
        claimed_td_streak: cappedTD,
      });

    if (error) {
      msgEl.textContent = error.message;
      msgEl.style.color = "#e74c3c";
      msgEl.hidden = false;
      claimBtn.disabled = false;
      claimBtn.textContent = "Claim my streak";
      return;
    }

    // Refresh the cache so the rest of the game sees the new streak
    await refreshStreakCache();
    panel.remove();
    // Optional: show a success toast
    const toast = document.createElement("div");
    toast.textContent = `Streak claimed! 🎉`;
    toast.style.cssText = "position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.9); color:white; padding:12px 20px; border-radius:8px; z-index:10001; font-weight:600;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };
}