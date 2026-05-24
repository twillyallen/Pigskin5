-- Fix: end_rivalry_series was unconditionally setting status = 'complete',
-- overwriting the 'forfeit' status set by forfeit_rivalry right before calling it.
-- Now status is only changed to 'complete' when it is still 'active';
-- 'forfeit' (and any other terminal status) is preserved.

CREATE OR REPLACE FUNCTION public.end_rivalry_series(p_rivalry_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rivalry  rivalries%ROWTYPE;
  v_winner   UUID;
  v_loser    UUID;
  v_a        UUID;
  v_b        UUID;
BEGIN
  SELECT * INTO v_rivalry FROM rivalries WHERE id = p_rivalry_id;
  IF NOT FOUND THEN RETURN; END IF;

  IF v_rivalry.player1_wins >= 4 THEN
    v_winner := v_rivalry.player1_id;
    v_loser  := v_rivalry.player2_id;
  ELSE
    v_winner := v_rivalry.player2_id;
    v_loser  := v_rivalry.player1_id;
  END IF;

  -- Only flip status to 'complete' when still 'active'.
  -- forfeit_rivalry sets status = 'forfeit' before calling here; preserve it.
  UPDATE rivalries
  SET status    = CASE WHEN status = 'active' THEN 'complete' ELSE status END,
      winner_id = v_winner,
      ended_at  = NOW()
  WHERE id = p_rivalry_id;

  -- Update profile stats
  UPDATE profiles SET rivalries_won = rivalries_won + 1,
                      rivalries_active = GREATEST(rivalries_active - 1, 0)
  WHERE id = v_winner;

  UPDATE profiles SET rivalries_active = GREATEST(rivalries_active - 1, 0)
  WHERE id = v_loser;

  -- Upsert all-time record (ordered IDs to avoid duplicates)
  IF v_rivalry.player1_id < v_rivalry.player2_id THEN
    v_a := v_rivalry.player1_id;
    v_b := v_rivalry.player2_id;
  ELSE
    v_a := v_rivalry.player2_id;
    v_b := v_rivalry.player1_id;
  END IF;

  INSERT INTO rivalry_alltime (player_a_id, player_b_id, a_series_won, b_series_won, total_series)
  VALUES (
    v_a, v_b,
    CASE WHEN v_winner = v_a THEN 1 ELSE 0 END,
    CASE WHEN v_winner = v_b THEN 1 ELSE 0 END,
    1
  )
  ON CONFLICT (player_a_id, player_b_id) DO UPDATE
    SET a_series_won = rivalry_alltime.a_series_won + CASE WHEN v_winner = v_a THEN 1 ELSE 0 END,
        b_series_won = rivalry_alltime.b_series_won + CASE WHEN v_winner = v_b THEN 1 ELSE 0 END,
        total_series = rivalry_alltime.total_series + 1;
END;
$$;
