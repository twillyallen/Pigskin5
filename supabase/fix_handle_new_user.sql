-- Fix: handle_new_user trigger was catching all exceptions and re-raising the
-- generic "database error saving new user" message, hiding the real failure.
-- This replacement only inserts the two columns the trigger is responsible for
-- (id + a placeholder username), lets all other columns use their DB defaults,
-- and removes the exception block so real errors surface immediately.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
