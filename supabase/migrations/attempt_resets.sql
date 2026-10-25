-- Run this once in the Supabase SQL editor.
-- Lets an admin grant a signed-in player a fresh attempt at a day's quiz.
-- On page load the client checks this table; if it finds a reset it hasn't
-- applied yet, it wipes that day's local "already played" flags so the start
-- screen shows again. Players can only read their own rows — there is no
-- INSERT/UPDATE/DELETE policy, so only the SQL editor (service role) can grant one.

CREATE TABLE IF NOT EXISTS public.attempt_resets (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_date  DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attempt_resets_user_date
  ON public.attempt_resets (user_id, quiz_date);

ALTER TABLE public.attempt_resets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_attempt_resets"
  ON public.attempt_resets
  FOR SELECT
  USING (user_id = auth.uid());

-- To give a player another attempt (deletes their server row and flags the reset):
--
-- DELETE FROM quiz_attempts
-- WHERE quiz_date = '2026-10-25'
--   AND user_id = (SELECT id FROM profiles WHERE username = 'Cheater69420');
--
-- INSERT INTO attempt_resets (user_id, quiz_date)
-- SELECT id, '2026-10-25' FROM profiles WHERE username = 'Cheater69420';
