-- Migration: add points column to quiz_attempts
-- Run this in the Supabase SQL editor.

-- 1. Add the column
ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS points integer;

-- 2. Backfill from existing answer_data JSON
UPDATE public.quiz_attempts
SET points = (answer_data->>'points')::integer
WHERE points IS NULL
  AND answer_data IS NOT NULL
  AND answer_data->>'points' IS NOT NULL;

-- 3. Trigger to auto-sync points from answer_data on any future insert/update
--    that doesn't explicitly set the column (keeps old app code working).
CREATE OR REPLACE FUNCTION public.sync_quiz_attempt_points()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.points IS NULL AND NEW.answer_data IS NOT NULL THEN
    NEW.points := (NEW.answer_data->>'points')::integer;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_quiz_attempt_points ON public.quiz_attempts;
CREATE TRIGGER trg_sync_quiz_attempt_points
  BEFORE INSERT OR UPDATE ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.sync_quiz_attempt_points();
