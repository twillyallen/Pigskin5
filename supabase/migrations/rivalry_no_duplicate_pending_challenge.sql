-- Prevent a user from sending more than one pending challenge to the same player.
-- Only applies to targeted challenges (challenged_user_id IS NOT NULL).
-- Uses a partial unique index so old/expired/declined rows are unaffected.

CREATE UNIQUE INDEX IF NOT EXISTS rivalry_challenges_no_duplicate_pending
  ON public.rivalry_challenges(challenger_id, challenged_user_id)
  WHERE status = 'pending' AND challenged_user_id IS NOT NULL;
