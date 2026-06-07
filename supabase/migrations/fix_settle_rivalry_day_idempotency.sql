-- Fix: settle_rivalry_day was not idempotent — calling it twice for the same day
-- would increment wins twice. This could happen when a client-side settle (both
-- players just played) raced with the daily cron (settle_missed_rivalry_days).
-- Guard added: if day_winner is already set, return immediately.

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
  v_game     rivalry_games%ROWTYPE;
  v_rivalry  rivalries%ROWTYPE;
  v_winner   INT;  -- 1, 2, or 0 (tie → time)
BEGIN
  SELECT * INTO v_rivalry FROM rivalries WHERE id = p_rivalry_id FOR UPDATE;
  IF NOT FOUND OR v_rivalry.status <> 'active' THEN RETURN; END IF;

  SELECT * INTO v_game
  FROM rivalry_games
  WHERE rivalry_id = p_rivalry_id AND game_date = p_for_date;

  -- Both missed: mutual miss → end series
  IF NOT FOUND OR (v_game.player1_score IS NULL AND v_game.player2_score IS NULL) THEN
    UPDATE rivalries SET status = 'mutual_miss', ended_at = NOW() WHERE id = p_rivalry_id;
    UPDATE profiles SET rivalries_active = GREATEST(rivalries_active - 1, 0)
    WHERE id IN (v_rivalry.player1_id, v_rivalry.player2_id);
    RETURN;
  END IF;

  -- Idempotency guard: day already settled, do not double-count wins
  IF v_game.day_winner IS NOT NULL THEN RETURN; END IF;

  -- One or both played: determine winner
  IF v_game.player1_score IS NULL THEN
    -- Player 1 missed
    v_winner := 2;
  ELSIF v_game.player2_score IS NULL THEN
    -- Player 2 missed
    v_winner := 1;
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
    PERFORM public.end_rivalry_series(p_rivalry_id);
  END IF;
END;
$$;
