// Convert a date string (YYYY-MM-DD) into a Date object
export function parseYMD(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Convert a Date object into YYYY-MM-DD format
export function formatYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Get the date string for the day before a given date
export function yesterdayOf(dateStr) {
  const d = parseYMD(dateStr);
  d.setDate(d.getDate() - 1);
  return formatYMD(d);
}

// Get the current date in YYYY-MM-DD format (ISO 8601)
export function getRunDateISO() {
  // Check URL query parameters for a date override
  const p = new URLSearchParams(window.location.search);
  const isProd = ["twillyallen.github.io", "pigskin5.com"].includes(location.hostname);
  const allowOverride = !isProd;
  if (allowOverride && p.has("date")) return p.get("date");

  // Today's actual date
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}