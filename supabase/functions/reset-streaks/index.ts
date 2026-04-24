import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Returns "YYYY-MM-DD" in Pacific Time, with an optional day offset
function getPTDateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(d);
}

Deno.serve(async (_req) => {
  // Any profile with no quiz_attempt on or after yesterday's PT date has missed a day
  const yesterday = getPTDateStr(-1);

  const { data: count, error } = await supabase.rpc("reset_stale_streaks", {
    p_cutoff_date: yesterday,
  });

  if (error) {
    console.error("reset_stale_streaks error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  console.log(`Streak reset: ${count} profiles cleared`);
  return new Response(JSON.stringify({ reset: count }), { status: 200 });
});
