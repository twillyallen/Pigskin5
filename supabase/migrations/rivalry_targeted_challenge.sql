-- Add targeted challenge support so a specific player can be challenged
-- directly from their player card — no shareable link required.
-- The challenge shows up in their Rivalries Box and they can accept/decline in-app.

ALTER TABLE public.rivalry_challenges
  ADD COLUMN IF NOT EXISTS challenged_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS rivalry_challenges_challenged_user_idx
  ON public.rivalry_challenges(challenged_user_id)
  WHERE challenged_user_id IS NOT NULL;

-- Allow the challenged player to decline (set status = 'declined') on challenges directed at them.
-- Without this, the existing challenger_manage_own policy blocks the UPDATE and declines fail silently.
CREATE POLICY "challenged_user_decline"
  ON public.rivalry_challenges
  FOR UPDATE
  USING (challenged_user_id = auth.uid())
  WITH CHECK (challenged_user_id = auth.uid());
