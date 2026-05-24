-- ============================================================
-- RIVALRY FEATURE SCHEMA
-- Run this against your Supabase project via the SQL editor
-- or `supabase db push` after placing in migrations/.
-- ============================================================


-- ── 1. rivalry_challenges ─────────────────────────────────
-- Tracks pending invite links. Expires at midnight UTC of the creation day.
CREATE TABLE IF NOT EXISTS public.rivalry_challenges (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','accepted','declined','expired')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  rivalry_id    UUID        -- filled in after the rivalry row is created on acceptance
);

CREATE INDEX IF NOT EXISTS rivalry_challenges_challenger_idx ON public.rivalry_challenges(challenger_id);
CREATE INDEX IF NOT EXISTS rivalry_challenges_status_idx      ON public.rivalry_challenges(status);


-- ── 2. rivalries ─────────────────────────────────────────
-- One row per head-to-head series (Best of 7).
CREATE TABLE IF NOT EXISTS public.rivalries (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id   UUID        REFERENCES public.rivalry_challenges(id),
  player1_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player1_wins   INT         NOT NULL DEFAULT 0 CHECK (player1_wins >= 0),
  player2_wins   INT         NOT NULL DEFAULT 0 CHECK (player2_wins >= 0),
  status         TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','complete','forfeit','mutual_miss')),
  winner_id      UUID        REFERENCES auth.users(id),
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at       TIMESTAMPTZ,
  recap_image_url TEXT,       -- server-generated series recap graphic URL
  CONSTRAINT no_self_rivalry CHECK (player1_id <> player2_id)
);

CREATE INDEX IF NOT EXISTS rivalries_player1_idx ON public.rivalries(player1_id);
CREATE INDEX IF NOT EXISTS rivalries_player2_idx ON public.rivalries(player2_id);
CREATE INDEX IF NOT EXISTS rivalries_status_idx  ON public.rivalries(status);

-- Back-fill challenge → rivalry link
ALTER TABLE public.rivalry_challenges
  ADD CONSTRAINT fk_challenge_rivalry
  FOREIGN KEY (rivalry_id) REFERENCES public.rivalries(id) ON DELETE SET NULL
  NOT VALID;


-- ── 3. rivalry_games ─────────────────────────────────────
-- One row per (rivalry, date). Created on first play, settled at midnight.
CREATE TABLE IF NOT EXISTS public.rivalry_games (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  rivalry_id          UUID        NOT NULL REFERENCES public.rivalries(id) ON DELETE CASCADE,
  game_date           DATE        NOT NULL,

  player1_score       INT         CHECK (player1_score BETWEEN 0 AND 5),
  player1_time_secs   NUMERIC(6,2),
  player1_picks       JSONB,
  player1_played_at   TIMESTAMPTZ,

  player2_score       INT         CHECK (player2_score BETWEEN 0 AND 5),
  player2_time_secs   NUMERIC(6,2),
  player2_picks       JSONB,
  player2_played_at   TIMESTAMPTZ,

  -- 1 = player1 wins, 2 = player2 wins, 0 = tie settled by time, NULL = not yet settled
  day_winner          INT         CHECK (day_winner IN (0, 1, 2)),

  UNIQUE (rivalry_id, game_date)
);

CREATE INDEX IF NOT EXISTS rivalry_games_rivalry_date_idx ON public.rivalry_games(rivalry_id, game_date);


-- ── 4. rivalry_daily_questions ───────────────────────────
-- Stores the 5 question indices (into rivalry-questions.js) assigned to each
-- rivalry for a given calendar day. Both players see identical questions.
CREATE TABLE IF NOT EXISTS public.rivalry_daily_questions (
  rivalry_id       UUID  NOT NULL REFERENCES public.rivalries(id) ON DELETE CASCADE,
  question_date    DATE  NOT NULL,
  question_indices INT[] NOT NULL,   -- array of 5 indices into RIVALRY_QUESTIONS
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (rivalry_id, question_date)
);


-- ── 5. rivalry_alltime ───────────────────────────────────
-- Cumulative series record between any two players (upserted when a series ends).
-- player_a_id is always the smaller UUID to avoid double-counting.
CREATE TABLE IF NOT EXISTS public.rivalry_alltime (
  player_a_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_b_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  a_series_won INT  NOT NULL DEFAULT 0,
  b_series_won INT  NOT NULL DEFAULT 0,
  total_series INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (player_a_id, player_b_id),
  CONSTRAINT ordered_ids CHECK (player_a_id < player_b_id)
);


-- ── 6. Profile columns for rivalry stats ─────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS rivalries_won        INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rivalries_challenged INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rivalries_active     INT NOT NULL DEFAULT 0;


-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.rivalry_challenges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rivalries             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rivalry_games         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rivalry_daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rivalry_alltime       ENABLE ROW LEVEL SECURITY;

-- rivalry_challenges: challenger can read/write their own; recipient reads by ID (anon OK for link lookup)
CREATE POLICY "challenger_manage_own"
  ON public.rivalry_challenges
  FOR ALL
  USING (challenger_id = auth.uid())
  WITH CHECK (challenger_id = auth.uid());

CREATE POLICY "anyone_read_challenge_by_id"
  ON public.rivalry_challenges
  FOR SELECT
  USING (true);  -- link lookup requires reading the row; protected by opaque UUID

-- rivalries: both players can read; only system functions write
CREATE POLICY "players_read_own_rivalries"
  ON public.rivalries
  FOR SELECT
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "players_insert_rivalries"
  ON public.rivalries
  FOR INSERT
  WITH CHECK (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "players_update_own_rivalries"
  ON public.rivalries
  FOR UPDATE
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

-- rivalry_games: both players in the rivalry can read; each player inserts/updates their own score
CREATE POLICY "rivalry_game_read"
  ON public.rivalry_games
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rivalries r
      WHERE r.id = rivalry_games.rivalry_id
        AND (r.player1_id = auth.uid() OR r.player2_id = auth.uid())
    )
  );

CREATE POLICY "rivalry_game_upsert"
  ON public.rivalry_games
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rivalries r
      WHERE r.id = rivalry_games.rivalry_id
        AND (r.player1_id = auth.uid() OR r.player2_id = auth.uid())
    )
  );

CREATE POLICY "rivalry_game_update"
  ON public.rivalry_games
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.rivalries r
      WHERE r.id = rivalry_games.rivalry_id
        AND (r.player1_id = auth.uid() OR r.player2_id = auth.uid())
    )
  );

-- rivalry_daily_questions: both players in the rivalry can read and insert (first-write wins via PK)
CREATE POLICY "rivalry_questions_read"
  ON public.rivalry_daily_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rivalries r
      WHERE r.id = rivalry_daily_questions.rivalry_id
        AND (r.player1_id = auth.uid() OR r.player2_id = auth.uid())
    )
  );

CREATE POLICY "rivalry_questions_insert"
  ON public.rivalry_daily_questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rivalries r
      WHERE r.id = rivalry_daily_questions.rivalry_id
        AND (r.player1_id = auth.uid() OR r.player2_id = auth.uid())
    )
  );

-- rivalry_alltime: anyone can read; only the system upserts via SECURITY DEFINER function
CREATE POLICY "alltime_read"
  ON public.rivalry_alltime
  FOR SELECT
  USING (player_a_id = auth.uid() OR player_b_id = auth.uid());


-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- ── accept_rivalry_challenge ─────────────────────────────
-- Atomically: mark challenge accepted, create rivalry, link back.
-- Returns the new rivalry UUID or raises an exception.
CREATE OR REPLACE FUNCTION public.accept_rivalry_challenge(
  p_challenge_id UUID,
  p_acceptor_id  UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge    rivalry_challenges%ROWTYPE;
  v_rivalry_id   UUID;
  v_active_count INT;
BEGIN
  -- Lock and fetch challenge
  SELECT * INTO v_challenge
  FROM rivalry_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'challenge_not_found';
  END IF;

  IF v_challenge.status <> 'pending' THEN
    RAISE EXCEPTION 'challenge_not_pending';
  END IF;

  IF v_challenge.expires_at < NOW() THEN
    UPDATE rivalry_challenges SET status = 'expired' WHERE id = p_challenge_id;
    RAISE EXCEPTION 'challenge_expired';
  END IF;

  IF v_challenge.challenger_id = p_acceptor_id THEN
    RAISE EXCEPTION 'self_challenge';
  END IF;

  -- Check acceptor's active rivalry count (max 5)
  SELECT COUNT(*) INTO v_active_count
  FROM rivalries
  WHERE status = 'active' AND (player1_id = p_acceptor_id OR player2_id = p_acceptor_id);

  IF v_active_count >= 5 THEN
    RAISE EXCEPTION 'slots_full';
  END IF;

  -- Also check challenger's slot count
  SELECT COUNT(*) INTO v_active_count
  FROM rivalries
  WHERE status = 'active' AND (player1_id = v_challenge.challenger_id OR player2_id = v_challenge.challenger_id);

  IF v_active_count >= 5 THEN
    RAISE EXCEPTION 'challenger_slots_full';
  END IF;

  -- Create rivalry (challenger = player1, acceptor = player2)
  INSERT INTO rivalries (player1_id, player2_id, challenge_id, started_at)
  VALUES (v_challenge.challenger_id, p_acceptor_id, p_challenge_id, NOW())
  RETURNING id INTO v_rivalry_id;

  -- Update challenge
  UPDATE rivalry_challenges
  SET status = 'accepted', rivalry_id = v_rivalry_id
  WHERE id = p_challenge_id;

  -- Increment active rivalry counts on profiles
  UPDATE profiles
  SET rivalries_active = rivalries_active + 1
  WHERE id IN (v_challenge.challenger_id, p_acceptor_id);

  -- Increment rivalries_challenged on challenger's profile
  UPDATE profiles
  SET rivalries_challenged = rivalries_challenged + 1
  WHERE id = v_challenge.challenger_id;

  RETURN v_rivalry_id;
END;
$$;


-- ── settle_rivalry_day ────────────────────────────────────
-- Determines the winner of a single game day and updates series wins.
-- Called after each player submits, or by a cron for missed days.
-- p_for_date = the game_date to settle (defaults to yesterday UTC for cron use).
CREATE OR REPLACE FUNCTION public.settle_rivalry_day(
  p_rivalry_id UUID,
  p_for_date   DATE DEFAULT (NOW() AT TIME ZONE 'UTC')::DATE - 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_game     rivalry_games%ROWTYPE;
  v_rivalry  rivalries%ROWTYPE;
  v_winner   INT;  -- 1, 2, or 0 (tie → time)
BEGIN
  SELECT * INTO v_rivalry FROM rivalries WHERE id = p_rivalry_id FOR UPDATE;
  IF NOT FOUND OR v_rivalry.status <> 'active' THEN RETURN; END IF;

  SELECT * INTO v_game
  FROM rivalry_games
  WHERE rivalry_id = p_rivalry_id AND game_date = p_for_date;

  -- Both missed: mutual miss → end series
  IF NOT FOUND OR (v_game.player1_score IS NULL AND v_game.player2_score IS NULL) THEN
    UPDATE rivalries SET status = 'mutual_miss', ended_at = NOW() WHERE id = p_rivalry_id;
    UPDATE profiles SET rivalries_active = GREATEST(rivalries_active - 1, 0)
    WHERE id IN (v_rivalry.player1_id, v_rivalry.player2_id);
    RETURN;
  END IF;

  -- One or both played: determine winner
  IF v_game.player1_score IS NULL THEN
    -- Player 1 missed
    v_winner := 2;
  ELSIF v_game.player2_score IS NULL THEN
    -- Player 2 missed
    v_winner := 1;
  ELSIF v_game.player1_score > v_game.player2_score THEN
    v_winner := 1;
  ELSIF v_game.player2_score > v_game.player1_score THEN
    v_winner := 2;
  ELSE
    -- Tie: faster time wins (lower = better)
    IF v_game.player1_time_secs <= v_game.player2_time_secs THEN
      v_winner := 1;
    ELSE
      v_winner := 2;
    END IF;
  END IF;

  -- Record day winner
  UPDATE rivalry_games SET day_winner = v_winner WHERE id = v_game.id;

  -- Increment series wins
  IF v_winner = 1 THEN
    UPDATE rivalries SET player1_wins = player1_wins + 1 WHERE id = p_rivalry_id;
  ELSE
    UPDATE rivalries SET player2_wins = player2_wins + 1 WHERE id = p_rivalry_id;
  END IF;

  -- Re-fetch to check series end
  SELECT * INTO v_rivalry FROM rivalries WHERE id = p_rivalry_id;

  IF v_rivalry.player1_wins >= 4 OR v_rivalry.player2_wins >= 4 THEN
    PERFORM public.end_rivalry_series(p_rivalry_id);
  END IF;
END;
$$;


-- ── end_rivalry_series ────────────────────────────────────
-- Marks a rivalry complete, updates profiles, updates all-time records.
CREATE OR REPLACE FUNCTION public.end_rivalry_series(p_rivalry_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rivalry  rivalries%ROWTYPE;
  v_winner   UUID;
  v_loser    UUID;
  v_a        UUID;
  v_b        UUID;
BEGIN
  SELECT * INTO v_rivalry FROM rivalries WHERE id = p_rivalry_id;
  IF NOT FOUND THEN RETURN; END IF;

  IF v_rivalry.player1_wins >= 4 THEN
    v_winner := v_rivalry.player1_id;
    v_loser  := v_rivalry.player2_id;
  ELSE
    v_winner := v_rivalry.player2_id;
    v_loser  := v_rivalry.player1_id;
  END IF;

  UPDATE rivalries
  SET status = 'complete', winner_id = v_winner, ended_at = NOW()
  WHERE id = p_rivalry_id;

  -- Update profile stats
  UPDATE profiles SET rivalries_won = rivalries_won + 1,
                      rivalries_active = GREATEST(rivalries_active - 1, 0)
  WHERE id = v_winner;

  UPDATE profiles SET rivalries_active = GREATEST(rivalries_active - 1, 0)
  WHERE id = v_loser;

  -- Upsert all-time record (ordered IDs to avoid duplicates)
  IF v_rivalry.player1_id < v_rivalry.player2_id THEN
    v_a := v_rivalry.player1_id;
    v_b := v_rivalry.player2_id;
  ELSE
    v_a := v_rivalry.player2_id;
    v_b := v_rivalry.player1_id;
  END IF;

  INSERT INTO rivalry_alltime (player_a_id, player_b_id, a_series_won, b_series_won, total_series)
  VALUES (
    v_a, v_b,
    CASE WHEN v_winner = v_a THEN 1 ELSE 0 END,
    CASE WHEN v_winner = v_b THEN 1 ELSE 0 END,
    1
  )
  ON CONFLICT (player_a_id, player_b_id) DO UPDATE
    SET a_series_won = rivalry_alltime.a_series_won + CASE WHEN v_winner = v_a THEN 1 ELSE 0 END,
        b_series_won = rivalry_alltime.b_series_won + CASE WHEN v_winner = v_b THEN 1 ELSE 0 END,
        total_series = rivalry_alltime.total_series + 1;
END;
$$;


-- ── forfeit_rivalry ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.forfeit_rivalry(
  p_rivalry_id  UUID,
  p_forfeiter_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rivalry rivalries%ROWTYPE;
  v_winner  UUID;
BEGIN
  SELECT * INTO v_rivalry FROM rivalries WHERE id = p_rivalry_id;
  IF NOT FOUND OR v_rivalry.status <> 'active' THEN RETURN; END IF;

  IF v_rivalry.player1_id <> p_forfeiter_id AND v_rivalry.player2_id <> p_forfeiter_id THEN
    RAISE EXCEPTION 'not_in_rivalry';
  END IF;

  v_winner := CASE
    WHEN v_rivalry.player1_id = p_forfeiter_id THEN v_rivalry.player2_id
    ELSE v_rivalry.player1_id
  END;

  -- Give winner the remaining wins needed to reach 4
  IF v_rivalry.player1_id = v_winner THEN
    UPDATE rivalries SET player1_wins = 4, status = 'forfeit', winner_id = v_winner, ended_at = NOW()
    WHERE id = p_rivalry_id;
  ELSE
    UPDATE rivalries SET player2_wins = 4, status = 'forfeit', winner_id = v_winner, ended_at = NOW()
    WHERE id = p_rivalry_id;
  END IF;

  -- Update profile stats
  UPDATE profiles SET rivalries_won = rivalries_won + 1,
                      rivalries_active = GREATEST(rivalries_active - 1, 0)
  WHERE id = v_winner;

  UPDATE profiles SET rivalries_active = GREATEST(rivalries_active - 1, 0)
  WHERE id = p_forfeiter_id;

  -- Update all-time record
  PERFORM public.end_rivalry_series(p_rivalry_id);
END;
$$;


-- ── expire_stale_challenges ───────────────────────────────
-- Run daily via cron: marks pending challenges past their expiry as expired.
CREATE OR REPLACE FUNCTION public.expire_stale_challenges()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE rivalry_challenges
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


-- ── settle_missed_rivalry_days ────────────────────────────
-- Run daily via cron: for every active rivalry, settle yesterday if not yet settled.
CREATE OR REPLACE FUNCTION public.settle_missed_rivalry_days()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rivalry   RECORD;
  v_yesterday DATE := (NOW() AT TIME ZONE 'UTC')::DATE - 1;
  v_count     INT  := 0;
BEGIN
  FOR v_rivalry IN
    SELECT id FROM rivalries WHERE status = 'active'
  LOOP
    -- Only settle if the day hasn't been settled yet (day_winner IS NULL)
    IF NOT EXISTS (
      SELECT 1 FROM rivalry_games
      WHERE rivalry_id = v_rivalry.id AND game_date = v_yesterday AND day_winner IS NOT NULL
    ) THEN
      PERFORM public.settle_rivalry_day(v_rivalry.id, v_yesterday);
      v_count := v_count + 1;
    END IF;
  END LOOP;
  RETURN v_count;
END;
$$;
