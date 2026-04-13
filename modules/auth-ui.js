// auth-ui.js
import { sendMagicLink, setUsername, signOut } from "./auth.js";
import { onAuthChange, getCurrentProfile, supabase } from "./supabase-client.js";
import { maybeShowStreakClaimPrompt } from "./streak-claim.js";
import { refreshStreakCache } from "./leaderboard.js";

const modal = document.getElementById("authModal");
const closeBtn = document.getElementById("authClose");
const signInBtn = document.getElementById("signInBtn");
const submitBtn = document.getElementById("authSubmit");
const emailInput = document.getElementById("authEmail");
const messageEl = document.getElementById("authMessage");

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

onAuthChange(async (user) => {
  if (user) {
    closeModal();
    const profile = await getCurrentProfile();
    const needsOnboarding = !profile?.username || profile.username.startsWith('user_');
    
    if (needsOnboarding) {
  showOnboardingPrompt();
} else {
  updateSignedInButton(profile.username);
  await refreshStreakCache();
  await maybeShowStreakClaimPrompt();
}
  } else {
    signInBtn.textContent = "Sign in";
    signInBtn.onclick = openModal;
  }
});

function updateSignedInButton(username) {
  signInBtn.textContent = `Hi, ${username} ▾`;
  signInBtn.onclick = async () => {
    if (confirm("Sign out?")) await signOut();
  };
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
      
      <label class="auth-checkbox-label">
        <input type="checkbox" id="onboardingTerms" />
        <span>I agree to the <a href="terms.html" target="_blank">Terms of Service</a> and <a href="privacy.html" target="_blank">Privacy Policy</a></span>
      </label>
      
      <label class="auth-checkbox-label">
        <input type="checkbox" id="onboardingOptIn" />
        <span>Email me when the daily quiz drops (optional)</span>
      </label>
      
      <button id="onboardingSubmit" disabled>Finish setup</button>
      
      <div id="onboardingMessage" class="auth-message" hidden></div>
    </div>
  `;
  document.body.appendChild(panel);

  const usernameInput = document.getElementById("onboardingUsername");
  const termsCheck = document.getElementById("onboardingTerms");
  const optInCheck = document.getElementById("onboardingOptIn");
  const submitBtn = document.getElementById("onboardingSubmit");
  const msgEl = document.getElementById("onboardingMessage");

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

    // Persist terms + opt-in
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("profiles")
      .update({
        terms_accepted_at: new Date().toISOString(),
        email_marketing_opt_in: optInCheck.checked,
      })
      .eq("id", user.id);

    panel.remove();
    updateSignedInButton(username);
    await refreshStreakCache();
    await maybeShowStreakClaimPrompt();
  };

  submitBtn.addEventListener("click", submit);
  usernameInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && !submitBtn.disabled) submit(); });
}