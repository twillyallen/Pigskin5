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

// Custom popup to show tier badge info
export function showTierTooltip(emoji, tierName, streak, playerName, emojiScore, points, username) {
  console.log('showTierTooltip called!', emoji, tierName, streak, emojiScore);

  let existing = document.getElementById('tier-popup-container');
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.id = 'tier-popup-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
  `;

  const popup = document.createElement('div');
  popup.style.cssText = `
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    padding: 30px 40px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.3);
    max-width: 90vw;
    animation: popupSlideIn 0.3s ease-out;
  `;

  const emojiEl = document.createElement('div');
  emojiEl.textContent = emoji;
  emojiEl.style.cssText = `
    font-size: 60px;
    margin-bottom: 15px;
    line-height: 1;
  `;

  const nameEl = document.createElement('div');
  nameEl.textContent = tierName;
  nameEl.style.cssText = `
    font-size: 28px;
    font-weight: 900;
    color: white;
    margin-bottom: 8px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  `;

  const streakEl = document.createElement('div');
  streakEl.textContent = `${streak}-day streak`;
  streakEl.style.cssText = `
    font-size: 18px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
  `;

  const hintEl = document.createElement('div');
  hintEl.textContent = 'Tap anywhere to close';
  hintEl.style.cssText = `
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 15px;
    font-style: italic;
  `;

  popup.appendChild(emojiEl);

if (playerName) {
  const playerEl = document.createElement('div');
  playerEl.textContent = playerName;
  playerEl.style.cssText = `
    font-size: 22px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  `;
  popup.appendChild(playerEl);

  // NEW: username under display name, if provided
  if (username) {
    const usernameEl = document.createElement('div');
    usernameEl.textContent = `@${username}`;
    usernameEl.style.cssText = `
      font-size: 13px;
      color: rgba(255, 255, 255, 0.55);
      margin-bottom: 12px;
      font-weight: 500;
    `;
    popup.appendChild(usernameEl);
  }
}

  popup.appendChild(nameEl);
  popup.appendChild(streakEl);

  if (emojiScore) {
    const emojiScoreEl = document.createElement('div');
    emojiScoreEl.textContent = emojiScore;
    emojiScoreEl.style.cssText = `
      font-size: 24px;
      margin-top: 12px;
      letter-spacing: 2px;
      line-height: 1.4;
    `;
    popup.appendChild(emojiScoreEl);
  }

  if (points !== undefined && points !== null) {
    const pointsEl = document.createElement('div');
    pointsEl.textContent = `${Number(points).toLocaleString()} pts`;
    pointsEl.style.cssText = `
      font-size: 20px;
      font-weight: 700;
      color: var(--btn-cyan, #b7f7ff);
      margin-top: 8px;
    `;
    popup.appendChild(pointsEl);
  }

  popup.appendChild(hintEl);
  container.appendChild(popup);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes popupSlideIn {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(container);

  const removePopup = () => {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.2s';
    setTimeout(() => {
      container.remove();
      style.remove();
    }, 200);
  };

  container.addEventListener('click', removePopup);
  container.addEventListener('touchend', removePopup);
}