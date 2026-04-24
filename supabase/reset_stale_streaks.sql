-- Run this once in the Supabase SQL Editor to create the function
-- called by the reset-streaks Edge Function.
--
-- It resets current_streak and current_td_streak to 0 for any profile
-- that has no quiz_attempts on or after p_cutoff_date (yesterday PT).
-- Returns the number of profiles affected.

CREATE OR REPLACE FUNCTION reset_stale_streaks(p_cutoff_date text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE profiles
  SET current_streak = 0, current_td_streak = 0
  WHERE (current_streak > 0 OR current_td_streak > 0)
    AND id NOT IN (
      SELECT DISTINCT user_id
      FROM quiz_attempts
      WHERE quiz_date >= p_cutoff_date
    );

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
