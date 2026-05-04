-- Run this once in the Supabase SQL Editor to schedule the weekly winner tweet.
-- Fires every Sunday at 10:00 AM PT (17:00 UTC during PDT / 18:00 UTC during PST).
--
-- Requires pg_cron and pg_net extensions (enabled by default on Supabase).
-- Find your SERVICE_ROLE_KEY in the Supabase dashboard: Project Settings > API.

select cron.unschedule('weekly-winner-tweet')
from cron.job
where jobname = 'weekly-winner-tweet';

select cron.schedule(
  'weekly-winner-tweet',
  '0 17 * * 0',  -- Every Sunday at 17:00 UTC (10:00 AM PT)
  $$
  select
    net.http_post(
      url     := 'https://fhjywfejdrjaflvaphhp.supabase.co/functions/v1/post-weekly-winner',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
      body    := '{}'::jsonb
    )
  $$
);
