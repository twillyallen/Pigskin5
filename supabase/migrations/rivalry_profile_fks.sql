-- Run this in the Supabase SQL editor after rivalry_schema.sql.
-- Adds FK references from rivalry tables → profiles so Supabase
-- can resolve joins like player1_id(username, current_display_name).

ALTER TABLE public.rivalry_challenges
  ADD CONSTRAINT fk_challenger_profile
  FOREIGN KEY (challenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE
  NOT VALID;

ALTER TABLE public.rivalries
  ADD CONSTRAINT fk_player1_profile
  FOREIGN KEY (player1_id) REFERENCES public.profiles(id) ON DELETE CASCADE
  NOT VALID;

ALTER TABLE public.rivalries
  ADD CONSTRAINT fk_player2_profile
  FOREIGN KEY (player2_id) REFERENCES public.profiles(id) ON DELETE CASCADE
  NOT VALID;
