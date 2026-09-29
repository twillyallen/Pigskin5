// analytics.js
// Thin wrapper around gtag so analytics calls never throw (e.g. GA blocked by
// an ad blocker) and every call site stays consistent.

export function trackEvent(name, params = {}) {
  // TEMP DEBUG — remove once the cache-busting fix is confirmed live.
  console.debug("[trackEvent]", name, params, "gtag available:", typeof window.gtag === "function");

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
