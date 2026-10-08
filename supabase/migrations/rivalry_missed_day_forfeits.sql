-- Missed-day rules for rivalries, and the daily job that enforces them.
--
--   • Day 1 grace: if only one player plays on the day the rivalry starts,
--     the day is a "no contest" — no winner, no series change.
--   • Day 2+: a player who misses a day forfeits it; the other player
--     gets the day win.
--   • If a forfeited day gives the other player their 4th win, the series
--     ends with status 'forfeit' (shown as "won by forfeit").
--   • Both players miss any day: series ends as 'mutual_miss' (unchanged).
--
-- Previously settle_missed_rivalry_days() existed but was never scheduled,
-- so one-sided days were never settled at all.


-- ── settle_rivalry_day ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.settle_rivalry_day(
  p_rivalry_id UUID,
  p_for_date   DATE DEFAULT (NOW() AT TIME ZONE 'UTC')::DATE - 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_game       rivalry_games%ROWTYPE;
  v_rivalry    rivalries%ROWTYPE;
  v_found      BOOLEAN;
  v_start      DATE;
  v_winner     INT;  -- 1 or 2
  v_by_forfeit BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_rivalry FROM rivalries WHERE id = p_rivalry_id FOR UPDATE;
  IF NOT FOUND OR v_rivalry.status <> 'active' THEN RETURN; END IF;

  v_start := (v_rivalry.started_at AT TIME ZONE 'UTC')::DATE;
  IF p_for_date < v_start THEN RETURN; END IF;

  SELECT * INTO v_game
  FROM rivalry_games
  WHERE rivalry_id = p_rivalry_id AND game_date = p_for_date;
  v_found := FOUND;

  -- Already settled — never double-count a day
  IF v_found AND v_game.day_winner IS NOT NULL THEN RETURN; END IF;

  -- Both missed: mutual miss → end series
  IF NOT v_found OR (v_game.player1_score IS NULL AND v_game.player2_score IS NULL) THEN
    UPDATE rivalries SET status = 'mutual_miss', ended_at = NOW() WHERE id = p_rivalry_id;
    UPDATE profiles SET rivalries_active = GREATEST(rivalries_active - 1, 0)
    WHERE id IN (v_rivalry.player1_id, v_rivalry.player2_id);
    RETURN;
  END IF;

  IF v_game.player1_score IS NULL OR v_game.player2_score IS NULL THEN
    -- Day 1 grace: no contest, leave day_winner NULL
    IF p_for_date = v_start THEN RETURN; END IF;

    -- Day 2+: the player who missed forfeits the day
    v_winner     := CASE WHEN v_game.player1_score IS NULL THEN 2 ELSE 1 END;
    v_by_forfeit := TRUE;
  ELSIF v_game.player1_score > v_game.player2_score THEN
    v_winner := 1;
  ELSIF v_game.player2_score > v_game.player1_score THEN
    v_winner := 2;
  ELSE
    -- Tie: faster time wins (lower = better)
    IF v_game.player1_time_secs <= v_game.player2_time_secs THEN
      v_winner := 1;
    ELSE
      v_winner := 2;
    END IF;
  END IF;

  -- Record day winner
  UPDATE rivalry_games SET day_winner = v_winner WHERE id = v_game.id;

  -- Increment series wins
  IF v_winner = 1 THEN
    UPDATE rivalries SET player1_wins = player1_wins + 1 WHERE id = p_rivalry_id;
  ELSE
    UPDATE rivalries SET player2_wins = player2_wins + 1 WHERE id = p_rivalry_id;
  END IF;

  -- Re-fetch to check series end
  SELECT * INTO v_rivalry FROM rivalries WHERE id = p_rivalry_id;

  IF v_rivalry.player1_wins >= 4 OR v_rivalry.player2_wins >= 4 THEN
    -- Clinched on a forfeited day → series ends by forfeit.
    -- end_rivalry_series preserves the 'forfeit' status (see fix_forfeit_status.sql).
    IF v_by_forfeit THEN
      UPDATE rivalries SET status = 'forfeit' WHERE id = p_rivalry_id;
    END IF;
    PERFORM public.end_rivalry_series(p_rivalry_id);
  END IF;
END;
$$;


-- ── settle_missed_rivalry_days ────────────────────────────
-- Run daily via cron. Settles every unsettled day from each active rivalry's
-- start through yesterday, in order — so a missed cron run (or days left
-- unsettled before this job existed) still gets caught up.
CREATE OR REPLACE FUNCTION public.settle_missed_rivalry_days()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rivalry   RECORD;
  v_day       DATE;
  v_yesterday DATE := (NOW() AT TIME ZONE 'UTC')::DATE - 1;
  v_count     INT  := 0;
BEGIN
  FOR v_rivalry IN
    SELECT id, started_at FROM rivalries WHERE status = 'active'
  LOOP
    FOR v_day IN
      SELECT d::DATE
      FROM generate_series((v_rivalry.started_at AT TIME ZONE 'UTC')::DATE, v_yesterday, INTERVAL '1 day') AS d
    LOOP
      -- Stop once the series has ended (4 wins, forfeit, or mutual miss)
      EXIT WHEN (SELECT status FROM rivalries WHERE id = v_rivalry.id) <> 'active';

      IF NOT EXISTS (
        SELECT 1 FROM rivalry_games
        WHERE rivalry_id = v_rivalry.id AND game_date = v_day AND day_winner IS NOT NULL
      ) THEN
        PERFORM public.settle_rivalry_day(v_rivalry.id, v_day);
        v_count := v_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  RETURN v_count;
END;
$$;


-- ── Schedule the daily job (00:05 UTC, just after the rivalry day rolls over) ──
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'settle-missed-rivalry-days',
  '5 0 * * *',
  $$SELECT public.settle_missed_rivalry_days();$$
);
