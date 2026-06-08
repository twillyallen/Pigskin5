// Polls /version.json every 5 minutes. When the deployed SHA changes,
// silently reloads the page so users always run the latest version.
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

async function fetchDeployedSha() {
  try {
    const res = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha ?? data.version ?? null;
  } catch {
    return null;
  }
}

let bootSha = null;

async function check() {
  const sha = await fetchDeployedSha();
  if (sha === null) return;
  if (bootSha === null) {
    bootSha = sha;
    return;
  }
  if (sha !== bootSha) {
    window.location.reload();
  }
}

check();
setInterval(check, CHECK_INTERVAL_MS);
