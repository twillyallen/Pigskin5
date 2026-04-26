import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "Pigskin5 <noreply@pigskin5.com>";
const SITE_URL = "https://www.pigskin5.com";

const TAGLINES = [
  "Five questions. One chance. Can you go 5 for 5 today?",
  "Think you know football? Prove it.",
  "Five questions stand between you and a perfect score.",
  "Your daily football IQ test is waiting.",
  "Five questions. No excuses. Let's go.",
  "Can you run the table today?",
  "Five shots at perfection. Take yours.",
  "Same game, new questions. Think you've got it?",
  "All football. No mercy. Five questions.",
  "The scoreboard doesn't lie — how do you stack up?",
  "Your football knowledge is being put to the test.",
  "Today's quiz won't complete itself.",
  "Five questions. How many can you get right?",
  "Every day's a new chance. Today is yours.",
  "Don't sleep on today's quiz.",
];

function getDailyTagline(): string {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (const char of today) {
    hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  }
  return TAGLINES[Math.abs(hash) % TAGLINES.length];
}

function buildEmailHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Pigskin5 Challenge</title>
</head>
<body style="margin:0;padding:0;background:#0f1115;font-family:Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1115;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <img src="https://pigskin5.com/logos/pigskin5logo.png" alt="Pigskin5" width="160" style="display:block;margin:0 auto;max-width:160px;">
            </td>
          </tr>
          <tr>
            <td style="background:#1a1d23;border-radius:12px;padding:32px;text-align:center;">
              <h2 style="margin:0 0 12px;font-size:1.3rem;">Today's Quiz is LIVE!</h2>
              <p style="margin:0 0 28px;color:#aaa;font-size:0.95rem;line-height:1.6;">
                ${getDailyTagline()}
              </p>
              <a href="${SITE_URL}"
                 style="display:inline-block;background:#2ecc71;color:#000;font-weight:700;
                        font-size:1rem;padding:14px 36px;border-radius:8px;text-decoration:none;
                        letter-spacing:0.5px;">
                Play Today's Quiz →
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="color:#555;font-size:0.72rem;margin:0;line-height:1.6;">
                You're receiving this because you opted in at pigskin5.com.<br>
                <a href="${SITE_URL}" style="color:#555;">Manage preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

Deno.serve(async (_req) => {
  // 1. Get opted-in profile IDs
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email_marketing_opt_in", true);

  if (profilesError) {
    return new Response(JSON.stringify({ error: profilesError.message }), { status: 500 });
  }
  if (!profiles || profiles.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "No opted-in users." }), { status: 200 });
  }

  const optedInIds = new Set(profiles.map((p) => p.id));

  // 2. Fetch all auth users and filter to opted-in ones
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), { status: 500 });
  }

  const recipients = users
    .filter((u) => optedInIds.has(u.id) && u.email)
    .map((u) => u.email!);

  if (recipients.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "No valid recipient emails found." }), { status: 200 });
  }

  // 3. Send via Resend batch API
  const html = buildEmailHtml();

  const batch = recipients.map((email) => ({
    from: FROM,
    to: email,
    subject: "🏈 Your daily Pigskin5 challenge is ready",
    html,
  }));

  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batch),
  });

  if (!res.ok) {
    const body = await res.text();
    return new Response(JSON.stringify({ error: "Resend error", detail: body }), { status: 502 });
  }

  return new Response(JSON.stringify({ sent: recipients.length }), { status: 200 });
});
