-- Multiplayer Quiz System - Supabase Migration
-- Run this SQL in your Supabase dashboard: SQL Editor -> New Query

-- ============================================================================
-- MULTIPLAYER SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS multiplayer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(4) NOT NULL UNIQUE CHECK (room_code ~ '^[0-9]{4}$'),
  quiz_id VARCHAR(255) NOT NULL,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  game_mode VARCHAR(50) NOT NULL DEFAULT 'classic_race',
  mode_config JSONB DEFAULT '{}',

  status VARCHAR(20) NOT NULL DEFAULT 'lobby'
    CHECK (status IN ('lobby', 'starting', 'in_progress', 'finished', 'abandoned')),
  current_question_index INTEGER DEFAULT 0,
  question_started_at BIGINT,
  question_time_limit INTEGER,

  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  started_at BIGINT,
  finished_at BIGINT,
  expires_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 + 7200000),

  quiz_snapshot JSONB NOT NULL
);

-- ============================================================================
-- SESSION PARTICIPANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES multiplayer_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,

  joined_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  last_seen_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  is_connected BOOLEAN DEFAULT true,
  is_kicked BOOLEAN DEFAULT false,

  current_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,

  mode_data JSONB DEFAULT '{}',
  team_id VARCHAR(20),
  finished_position INTEGER,

  UNIQUE(session_id, user_id)
);

-- ============================================================================
-- PARTICIPANT ANSWERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS participant_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES multiplayer_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,

  question_index INTEGER NOT NULL,
  question_id VARCHAR(255) NOT NULL,

  selected_option_ids TEXT[],
  typed_answer TEXT,

  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL,
  answered_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,

  points_awarded INTEGER DEFAULT 0,
  streak_at_answer INTEGER DEFAULT 0,

  UNIQUE(session_id, participant_id, question_index)
);

-- ============================================================================
-- SESSION EVENTS LOG (for analytics/replay)
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES multiplayer_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_room_code
  ON multiplayer_sessions(room_code)
  WHERE status != 'finished';

CREATE INDEX IF NOT EXISTS idx_host_active
  ON multiplayer_sessions(host_user_id, status)
  WHERE status IN ('lobby', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_session_participants
  ON session_participants(session_id);

CREATE INDEX IF NOT EXISTS idx_leaderboard
  ON session_participants(session_id, current_score DESC, total_time_spent ASC);

CREATE INDEX IF NOT EXISTS idx_session_answers
  ON participant_answers(session_id, question_index);

CREATE INDEX IF NOT EXISTS idx_session_status
  ON multiplayer_sessions(status, expires_at);

-- ============================================================================
-- ROOM CODE GENERATOR FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_unique_room_code()
RETURNS VARCHAR(4) AS $$
DECLARE
  new_code VARCHAR(4);
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    IF NOT EXISTS (
      SELECT 1 FROM multiplayer_sessions
      WHERE room_code = new_code
      AND status IN ('lobby', 'in_progress')
      AND expires_at > EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
    ) THEN
      RETURN new_code;
    END IF;
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique room code';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CLEANUP FUNCTION (for expired sessions)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM multiplayer_sessions
    WHERE expires_at < EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
      AND status IN ('finished', 'abandoned')
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE multiplayer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;

-- Multiplayer Sessions Policies

-- Anyone can view active sessions (for joining)
DROP POLICY IF EXISTS "Public view active sessions" ON multiplayer_sessions;
CREATE POLICY "Public view active sessions" ON multiplayer_sessions FOR SELECT
  USING (status IN ('lobby', 'in_progress') AND expires_at > EXTRACT(EPOCH FROM NOW())::BIGINT * 1000);

-- Hosts can create/update/delete their sessions
DROP POLICY IF EXISTS "Hosts manage sessions" ON multiplayer_sessions;
CREATE POLICY "Hosts manage sessions" ON multiplayer_sessions
  FOR ALL USING (auth.uid() = host_user_id);

-- Session Participants Policies

-- Users can join sessions and update their own participation
DROP POLICY IF EXISTS "Users manage participation" ON session_participants;
CREATE POLICY "Users manage participation" ON session_participants
  FOR ALL USING (
    user_id = auth.uid()
    OR session_id IN (
      SELECT id FROM multiplayer_sessions WHERE host_user_id = auth.uid()
    )
  );

-- Participant Answers Policies

-- Users can submit their own answers
DROP POLICY IF EXISTS "Users submit answers" ON participant_answers;
CREATE POLICY "Users submit answers" ON participant_answers FOR INSERT
  WITH CHECK (
    participant_id IN (
      SELECT id FROM session_participants WHERE user_id = auth.uid()
    )
  );

-- Users can view session answers they're part of
DROP POLICY IF EXISTS "View session answers" ON participant_answers;
CREATE POLICY "View session answers" ON participant_answers FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM session_participants WHERE user_id = auth.uid()
    )
  );

-- Session Events Policies

-- Users can view events for sessions they're in
DROP POLICY IF EXISTS "View session events" ON session_events;
CREATE POLICY "View session events" ON session_events FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM multiplayer_sessions
      WHERE host_user_id = auth.uid()
    )
    OR session_id IN (
      SELECT session_id FROM session_participants WHERE user_id = auth.uid()
    )
  );

-- Hosts can insert events
DROP POLICY IF EXISTS "Hosts insert events" ON session_events;
CREATE POLICY "Hosts insert events" ON session_events FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND session_id IN (
      SELECT id FROM multiplayer_sessions WHERE host_user_id = auth.uid()
    )
  );

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================
-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE participant_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE session_events;
