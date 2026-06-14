import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Returns "YYYY-MM-DD" in Pacific Time with an optional day offset
function getPTDateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(d);
}

// Returns the Sunday of a given "YYYY-MM-DD" string's Sun–Sat week
function getSundayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dow = date.getDay(); // 0 = Sunday
  const sun = new Date(y, m - 1, d - dow);
  return new Intl.DateTimeFormat("en-CA").format(sun);
}

Deno.serve(async (_req) => {
  const yesterday = getPTDateStr(-1);
  const results: Record<string, unknown> = { settled_date: yesterday };

  // Always settle yesterday's daily leaderboard
  const { error: dailyErr } = await supabase.rpc("settle_daily_leaderboard", {
    p_date: yesterday,
  });
  if (dailyErr) {
    console.error("settle_daily_leaderboard error:", dailyErr);
    results.daily_error = dailyErr.message;
  } else {
    results.daily = "ok";
  }

  // If yesterday was a Saturday, settle the week that just ended (Sun–Sat)
  const [y, m, d] = yesterday.split("-").map(Number);
  const yesterdayDate = new Date(y, m - 1, d);
  if (yesterdayDate.getDay() === 6) {
    const weekStart = getSundayOfWeek(yesterday);
    const { error: weeklyErr } = await supabase.rpc(
      "settle_weekly_leaderboard",
      { p_week_start: weekStart },
    );
    if (weeklyErr) {
      console.error("settle_weekly_leaderboard error:", weeklyErr);
      results.weekly_error = weeklyErr.message;
    } else {
      results.weekly = weekStart;
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
