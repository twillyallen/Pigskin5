-- Migration: add twitter_handle to profiles
-- Run this in the Supabase SQL editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS twitter_handle text
  CHECK (twitter_handle IS NULL OR twitter_handle ~ '^[A-Za-z0-9_]{1,15}$');

-- No RLS change needed: the existing UPDATE policy already lets users update
-- their own row, so the new column is covered automatically.
