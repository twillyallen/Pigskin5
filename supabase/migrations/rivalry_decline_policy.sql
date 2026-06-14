-- Run this in the Supabase SQL editor if you already ran rivalry_targeted_challenge.sql
-- without this policy. Without it, the challenged user cannot update the challenge
-- status to 'declined' and declines fail silently.

CREATE POLICY "challenged_user_decline"
  ON public.rivalry_challenges
  FOR UPDATE
  USING (challenged_user_id = auth.uid())
  WITH CHECK (challenged_user_id = auth.uid());
