-- ─────────────────────────────────────────────────────────────────────────────
-- Self-healing leaderboard settlement
--
-- profiles.daily_wins / weekly_wins / weekly_podium_* only move when
-- settle_daily_leaderboard / settle_weekly_leaderboard run. Those were only
-- reachable through the settle-leaderboards edge function, which had no
-- schedule, so every week since the original backfill went unsettled.
--
-- settle_pending_leaderboards() settles EVERY finished day/week that isn't in
-- leaderboard_settlements yet, so a missed run is caught up on the next one.
-- Both settle_* functions are idempotent, so re-running is always safe.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.settle_pending_leaderboards()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  -- Quiz days roll over in Pacific Time; cron runs in UTC
  v_today_pt DATE := (NOW() AT TIME ZONE 'America/Los_Angeles')::DATE;
  v_day      DATE;
  v_week     DATE;
  v_days     INT := 0;
  v_weeks    INT := 0;
BEGIN
  -- Finished days (before today PT) not yet settled
  FOR v_day IN
    SELECT DISTINCT quiz_date::DATE
    FROM public.quiz_attempts
    WHERE user_id IS NOT NULL
      AND quiz_date::DATE < v_today_pt
      AND NOT EXISTS (
        SELECT 1 FROM public.leaderboard_settlements
        WHERE settlement_key = 'daily:' || quiz_date::DATE::TEXT
      )
    ORDER BY 1
  LOOP
    PERFORM public.settle_daily_leaderboard(v_day);
    v_days := v_days + 1;
  END LOOP;

  -- Finished Sun–Sat weeks (Saturday before today PT) not yet settled
  FOR v_week IN
    SELECT DISTINCT (quiz_date::DATE - EXTRACT(DOW FROM quiz_date::DATE)::INT) AS wk
    FROM public.quiz_attempts
    WHERE user_id IS NOT NULL
      AND (quiz_date::DATE - EXTRACT(DOW FROM quiz_date::DATE)::INT + 6) < v_today_pt
      AND NOT EXISTS (
        SELECT 1 FROM public.leaderboard_settlements
        WHERE settlement_key = 'weekly:' ||
          (quiz_date::DATE - EXTRACT(DOW FROM quiz_date::DATE)::INT)::TEXT
      )
    ORDER BY 1
  LOOP
    PERFORM public.settle_weekly_leaderboard(v_week);
    v_weeks := v_weeks + 1;
  END LOOP;

  RETURN jsonb_build_object('days_settled', v_days, 'weeks_settled', v_weeks);
END;
$$;

-- Catch up everything missed so far
SELECT public.settle_pending_leaderboards();

-- Run hourly so it never depends on a single run succeeding. Hourly also means
-- the PT day rollover is picked up within the hour regardless of DST.
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'settle-pending-leaderboards',
  '10 * * * *',
  $$SELECT public.settle_pending_leaderboards();$$
);
