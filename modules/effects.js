let snowInterval = null;
let heartsInterval = null;
let confettiInterval = null;

// ===== SNOW =====
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

export function startSnow() {
  stopSnow();

  for (let i = 0; i < 30; i++) {
    setTimeout(() => createSnowflake(), i * 100);
  }

  snowInterval = setInterval(() => {
    createSnowflake();
  }, 300);
}

export function stopSnow() {
  if (snowInterval) {
    clearInterval(snowInterval);
    snowInterval = null;
  }

  const snowflakes = document.querySelectorAll(".snowflake");
  snowflakes.forEach(flake => flake.remove());
}

// ===== HEARTS =====
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

export function startHearts() {
  stopHearts();

  for (let i = 0; i < 30; i++) {
    setTimeout(() => createHeart(), i * 100);
  }

  heartsInterval = setInterval(() => {
    createHeart();
  }, 300);
}

export function stopHearts() {
  if (heartsInterval) {
    clearInterval(heartsInterval);
    heartsInterval = null;
  }

  const hearts = document.querySelectorAll(".heart");
  hearts.forEach(heart => heart.remove());
}

// ===== CONFETTI =====
export function startConfetti() {
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

export function stopConfetti() {
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
}