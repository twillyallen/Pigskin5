import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Settles every finished day/week that hasn't been settled yet (see
// settle_pending_leaderboards.sql). pg_cron already runs this hourly; the edge
// function is kept for manual triggering.
Deno.serve(async (_req) => {
  const { data, error } = await supabase.rpc("settle_pending_leaderboards");
  if (error) {
    console.error("settle_pending_leaderboards error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
