import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const TWITTER_CONSUMER_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")!;
const TWITTER_CONSUMER_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")!;
const TWITTER_ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")!;
const TWITTER_ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")!;

// Returns "YYYY-MM-DD" in Pacific Time with an optional day offset
function getPTDateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(d);
}

function weekStartStr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const sun = new Date(y, m - 1, d - dt.getDay());
  return `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, "0")}-${String(sun.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

async function postTweet(text: string): Promise<void> {
  const url = "https://api.twitter.com/2/tweets";

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: TWITTER_CONSUMER_KEY,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: TWITTER_ACCESS_TOKEN,
    oauth_version: "1.0",
  };

  // Only OAuth params go in the signature base string for JSON-body requests
  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join("&");

  const baseString = [
    "POST",
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  const signingKey = `${encodeURIComponent(TWITTER_CONSUMER_SECRET)}&${encodeURIComponent(TWITTER_ACCESS_TOKEN_SECRET)}`;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    keyMaterial,
    new TextEncoder().encode(baseString),
  );
  oauthParams.oauth_signature = btoa(
    String.fromCharCode(...new Uint8Array(signatureBytes)),
  );

  const authHeader =
    "OAuth " +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
      .join(", ");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twitter API error ${res.status}: ${body}`);
  }
}

Deno.serve(async (_req) => {
  // Runs Sunday morning PT. Yesterday was Saturday — the last day of last week.
  const saturday = getPTDateStr(-1);
  const sunday = weekStartStr(saturday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(sunday, i));
  }

  const { data: attempts, error } = await supabase
    .from("quiz_attempts")
    .select("user_id, points, submitted_at, profiles!inner(username, twitter_handle)")
    .in("quiz_date", dates);

  if (error) {
    console.error("DB error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!attempts || attempts.length === 0) {
    console.log("No attempts found for last week.");
    return new Response(JSON.stringify({ message: "No entries for last week." }), { status: 200 });
  }

  // Sum points per user; track earliest last-submission for tiebreaking
  const totals: Record<string, {
    points: number;
    username: string;
    twitterHandle: string | null;
    lastSubmit: number;
  }> = {};

  for (const a of attempts) {
    const uid = a.user_id;
    if (!totals[uid]) {
      totals[uid] = {
        points: 0,
        username: (a.profiles as { username: string; twitter_handle: string | null })?.username || "Player",
        twitterHandle: (a.profiles as { username: string; twitter_handle: string | null })?.twitter_handle || null,
        lastSubmit: 0,
      };
    }
    totals[uid].points += a.points || 0;
    const ts = new Date(a.submitted_at).getTime();
    if (ts > totals[uid].lastSubmit) totals[uid].lastSubmit = ts;
  }

  // Highest points wins; ties broken by who finished first
  const sorted = Object.values(totals).sort((a, b) =>
    b.points !== a.points ? b.points - a.points : a.lastSubmit - b.lastSubmit
  );

  const winner = sorted[0];
  const mention = winner.twitterHandle ? `@${winner.twitterHandle}` : winner.username;

  const tweet =
    `🏆 Weekly Leaderboard Winner!\n\n` +
    `Congrats to ${mention} for topping the Pigskin5 leaderboard this week with ${winner.points} points! 🏈\n\n` +
    `Think you can top the board next week? Play at pigskin5.com`;

  try {
    await postTweet(tweet);
    console.log(`Weekly winner tweet posted: ${winner.username} (${winner.points} pts)`);
    return new Response(
      JSON.stringify({ winner: winner.username, points: winner.points }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Tweet failed:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 502 });
  }
});
