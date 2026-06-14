-- ─────────────────────────────────────────────────────────────────────────────
-- Pigskin IQ: schema additions, triggers, settle functions, and backfill
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. New tracking columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_quizzes_completed INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_wins              INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_wins             INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_podium_2nd       INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_podium_3rd       INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pigskin_iq              INT NOT NULL DEFAULT 0;

-- 2. Idempotency table: tracks which dates/weeks have already been settled
CREATE TABLE IF NOT EXISTS public.leaderboard_settlements (
  settlement_key TEXT        PRIMARY KEY,
  settled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: increment total_quizzes_completed on each new quiz attempt INSERT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_quiz_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET total_quizzes_completed = total_quizzes_completed + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_quiz_attempt_insert ON public.quiz_attempts;
CREATE TRIGGER on_quiz_attempt_insert
AFTER INSERT ON public.quiz_attempts
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION public.increment_quiz_count();

-- ─────────────────────────────────────────────────────────────────────────────
-- Pure IQ calculation — called by the trigger and by the one-time backfill
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.pigskin_iq_from_columns(
  p_quizzes        INT,
  p_touchdowns     INT,
  p_daily_wins     INT,
  p_weekly_wins    INT,
  p_weekly_2nd     INT,
  p_weekly_3rd     INT,
  p_rivalries      INT,
  p_longest_streak INT,
  p_achievements   TEXT[]
) RETURNS INT LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_iq  INT := 0;
  v_ach TEXT;
  v_pts INT;
BEGIN
  -- Repeatable-action points
  v_iq := COALESCE(p_quizzes,     0) * 100
        + COALESCE(p_touchdowns,  0) * 250
        + COALESCE(p_daily_wins,  0) * 500
        + COALESCE(p_weekly_wins, 0) * 2500
        + COALESCE(p_weekly_2nd,  0) * 750
        + COALESCE(p_weekly_3rd,  0) * 500
        + COALESCE(p_rivalries,   0) * 300;

  -- Streak milestones (each tier is additive — hitting 30 also grants 7 and 14)
  IF COALESCE(p_longest_streak, 0) >= 100 THEN v_iq := v_iq + 2500; END IF;
  IF COALESCE(p_longest_streak, 0) >= 50  THEN v_iq := v_iq + 1500; END IF;
  IF COALESCE(p_longest_streak, 0) >= 30  THEN v_iq := v_iq + 1000; END IF;
  IF COALESCE(p_longest_streak, 0) >= 14  THEN v_iq := v_iq + 500;  END IF;
  IF COALESCE(p_longest_streak, 0) >= 7   THEN v_iq := v_iq + 250;  END IF;

  -- Achievement bonuses (one-time per badge)
  FOREACH v_ach IN ARRAY COALESCE(p_achievements, '{}')
  LOOP
    v_pts := CASE v_ach
      WHEN 'first_blood'        THEN 50
      WHEN 'touchdown'          THEN 100
      WHEN 'grinder'            THEN 150
      WHEN 'century'            THEN 500
      WHEN 'field_general'      THEN 200
      WHEN 'franchise_qb'       THEN 500
      WHEN 'pick_six'           THEN 25
      WHEN 'gunslinger'         THEN 300
      WHEN 'on_fire'            THEN 150
      WHEN 'triple_crown'       THEN 150
      WHEN 'perfect_season'     THEN 400
      WHEN 'iron_man'           THEN 750
      WHEN 'comeback_player'    THEN 150
      WHEN 'unbreakable'        THEN 200
      WHEN 'daily_bread'        THEN 100
      WHEN 'brady_mode'         THEN 400
      WHEN 'bridesmaid'         THEN 100
      WHEN 'weekly_warrior'     THEN 500
      WHEN 'dynasty_talks'      THEN 1000
      WHEN 'i_got_opps'         THEN 100
      WHEN 'body_count'         THEN 300
      WHEN 'untouchable'        THEN 500
      WHEN 'game_7_built_diffy' THEN 300
      WHEN 'lebroning'          THEN 400
      WHEN 'want_the_smoke'     THEN 150
      WHEN 'sweep'              THEN 250
      ELSE 0
    END;
    v_iq := v_iq + v_pts;
  END LOOP;

  RETURN v_iq;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: recompute pigskin_iq whenever a relevant profile column changes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_pigskin_iq()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.pigskin_iq := public.pigskin_iq_from_columns(
    NEW.total_quizzes_completed,
    NEW.total_touchdowns,
    NEW.daily_wins,
    NEW.weekly_wins,
    NEW.weekly_podium_2nd,
    NEW.weekly_podium_3rd,
    NEW.rivalries_won,
    NEW.longest_streak,
    NEW.achievements
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_pigskin_iq ON public.profiles;
CREATE TRIGGER sync_pigskin_iq
BEFORE UPDATE OF
  total_quizzes_completed, total_touchdowns,
  daily_wins, weekly_wins, weekly_podium_2nd, weekly_podium_3rd,
  rivalries_won, longest_streak, achievements
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_pigskin_iq();

-- ─────────────────────────────────────────────────────────────────────────────
-- settle_daily_leaderboard: awards daily_wins to the day's #1 ranked user.
-- Safe to call multiple times — skips if already settled.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.settle_daily_leaderboard(p_date DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_key TEXT := 'daily:' || p_date::TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.leaderboard_settlements WHERE settlement_key = v_key
  ) THEN
    RETURN;
  END IF;

  -- Points DESC, earliest submission wins ties (mirrors app sort logic)
  WITH ranked AS (
    SELECT user_id,
           ROW_NUMBER() OVER (ORDER BY points DESC, submitted_at ASC) AS rn
    FROM public.quiz_attempts
    WHERE quiz_date::DATE = p_date
      AND user_id IS NOT NULL
  )
  UPDATE public.profiles
  SET daily_wins = daily_wins + 1
  WHERE id = (SELECT user_id FROM ranked WHERE rn = 1 LIMIT 1);

  INSERT INTO public.leaderboard_settlements (settlement_key)
  VALUES (v_key)
  ON CONFLICT DO NOTHING;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- settle_weekly_leaderboard: awards weekly podium for a Sun–Sat week.
-- p_week_start must be a Sunday. Safe to call multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.settle_weekly_leaderboard(p_week_start DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_key TEXT := 'weekly:' || p_week_start::TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.leaderboard_settlements WHERE settlement_key = v_key
  ) THEN
    RETURN;
  END IF;

  WITH week_totals AS (
    SELECT user_id, SUM(points) AS total_pts
    FROM public.quiz_attempts
    WHERE quiz_date::DATE >= p_week_start
      AND quiz_date::DATE <= p_week_start + INTERVAL '6 days'
      AND user_id IS NOT NULL
    GROUP BY user_id
    HAVING SUM(points) > 0
  ),
  -- DENSE_RANK so tied 1st-place users both get a win, and the next user is 2nd (not 3rd)
  ranked AS (
    SELECT user_id,
           DENSE_RANK() OVER (ORDER BY total_pts DESC) AS rnk
    FROM week_totals
  )
  UPDATE public.profiles p
  SET
    weekly_wins       = p.weekly_wins       + CASE WHEN r.rnk = 1 THEN 1 ELSE 0 END,
    weekly_podium_2nd = p.weekly_podium_2nd + CASE WHEN r.rnk = 2 THEN 1 ELSE 0 END,
    weekly_podium_3rd = p.weekly_podium_3rd + CASE WHEN r.rnk = 3 THEN 1 ELSE 0 END
  FROM ranked r
  WHERE p.id = r.user_id
    AND r.rnk <= 3;

  INSERT INTO public.leaderboard_settlements (settlement_key)
  VALUES (v_key)
  ON CONFLICT DO NOTHING;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Backfill: populate new columns from existing quiz_attempts data
-- ─────────────────────────────────────────────────────────────────────────────

-- total_quizzes_completed
UPDATE public.profiles p
SET total_quizzes_completed = (
  SELECT COUNT(*)::INT
  FROM public.quiz_attempts qa
  WHERE qa.user_id = p.id
);

-- daily_wins (points DESC, then earliest submission — same tie-break as the app)
WITH ranked AS (
  SELECT user_id,
         quiz_date,
         ROW_NUMBER() OVER (
           PARTITION BY quiz_date
           ORDER BY points DESC, submitted_at ASC
         ) AS rn
  FROM public.quiz_attempts
  WHERE user_id IS NOT NULL
),
wins AS (
  SELECT user_id, COUNT(*)::INT AS cnt
  FROM ranked
  WHERE rn = 1
  GROUP BY user_id
)
UPDATE public.profiles p
SET daily_wins = COALESCE(w.cnt, 0)
FROM wins w
WHERE p.id = w.user_id;

-- weekly podium (Sun–Sat weeks that have fully ended before today)
-- DATE_TRUNC('week', date) anchors to Monday; shifting +1 day then subtracting gives Sunday
WITH week_totals AS (
  SELECT
    user_id,
    (DATE_TRUNC('week', quiz_date::DATE + INTERVAL '1 day') - INTERVAL '1 day')::DATE AS week_start,
    SUM(points) AS total_pts
  FROM public.quiz_attempts
  WHERE user_id IS NOT NULL
  GROUP BY user_id,
           (DATE_TRUNC('week', quiz_date::DATE + INTERVAL '1 day') - INTERVAL '1 day')::DATE
),
complete_weeks AS (
  SELECT * FROM week_totals
  WHERE (week_start + INTERVAL '6 days')::DATE < CURRENT_DATE
    AND total_pts > 0
),
ranked AS (
  SELECT user_id,
         DENSE_RANK() OVER (PARTITION BY week_start ORDER BY total_pts DESC) AS rnk
  FROM complete_weeks
),
podium AS (
  SELECT
    user_id,
    COUNT(*) FILTER (WHERE rnk = 1)::INT AS wins,
    COUNT(*) FILTER (WHERE rnk = 2)::INT AS seconds,
    COUNT(*) FILTER (WHERE rnk = 3)::INT AS thirds
  FROM ranked
  GROUP BY user_id
)
UPDATE public.profiles p
SET
  weekly_wins       = COALESCE(po.wins,    0),
  weekly_podium_2nd = COALESCE(po.seconds, 0),
  weekly_podium_3rd = COALESCE(po.thirds,  0)
FROM podium po
WHERE p.id = po.user_id;

-- pigskin_iq: full initial computation for every profile
UPDATE public.profiles
SET pigskin_iq = public.pigskin_iq_from_columns(
  total_quizzes_completed,
  total_touchdowns,
  daily_wins,
  weekly_wins,
  weekly_podium_2nd,
  weekly_podium_3rd,
  rivalries_won,
  longest_streak,
  achievements
);

-- Mark all historical dates as settled so the edge function never double-counts
INSERT INTO public.leaderboard_settlements (settlement_key)
SELECT 'daily:' || quiz_date
FROM public.quiz_attempts
WHERE user_id IS NOT NULL
GROUP BY quiz_date
ON CONFLICT DO NOTHING;

INSERT INTO public.leaderboard_settlements (settlement_key)
SELECT DISTINCT
  'weekly:' || (
    DATE_TRUNC('week', quiz_date::DATE + INTERVAL '1 day') - INTERVAL '1 day'
  )::DATE::TEXT
FROM public.quiz_attempts
WHERE user_id IS NOT NULL
  AND (
    DATE_TRUNC('week', quiz_date::DATE + INTERVAL '1 day') - INTERVAL '1 day' + INTERVAL '6 days'
  )::DATE < CURRENT_DATE
ON CONFLICT DO NOTHING;
