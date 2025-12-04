// Multiplayer quiz session types

export type SessionStatus = 'lobby' | 'starting' | 'in_progress' | 'finished' | 'abandoned';
export type RevealPattern = 'all_at_once' | 'host_controlled' | 'auto_advance';

export interface MultiplayerSession {
  id: string;
  room_code: string;
  quiz_id: string;
  host_user_id: string;

  game_mode: string;
  mode_config: Record<string, any>;

  status: SessionStatus;
  current_question_index: number;
  question_started_at?: number; // Unix timestamp
  question_time_limit?: number; // seconds

  created_at: number;
  started_at?: number;
  finished_at?: number;
  expires_at: number;

  quiz_snapshot: any; // Full quiz data at game start
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;

  display_name: string;
  avatar_url?: string;

  joined_at: number;
  last_seen_at: number;
  is_connected: boolean;
  is_kicked: boolean;

  current_score: number;
  current_streak: number;
  max_streak: number;
  total_time_spent: number;

  mode_data: Record<string, any>; // Mode-specific stats (tower HP, coins, fish, etc.)
  team_id?: string;
  finished_position?: number; // 1st, 2nd, 3rd, etc.
}

export interface ParticipantAnswer {
  id: string;
  session_id: string;
  participant_id: string;

  question_index: number;
  question_id: string;

  selected_option_ids?: string[];
  typed_answer?: string;

  is_correct: boolean;
  time_taken: number; // milliseconds
  answered_at: number; // Unix timestamp

  points_awarded: number;
  streak_at_answer: number;
}

// Real-time events
export interface RealtimeEvent {
  type: 'host:kick_player' | 'host:game_starting' | 'host:game_started' |
        'host:question_revealed' | 'host:question_locked' | 'host:show_results' |
        'host:next_question' | 'host:game_ended' | 'player:answer_submitted' |
        'mode:tower_damage' | 'mode:fish_caught' | 'mode:powerup_used' |
        'question_revealed' | 'round_started' | 'results_shown' | 'participant_answered' |
        'game_finished' | 'game_ended_early';
  data: any;
  timestamp?: number;
}

export interface PresenceData {
  user_id: string;
  display_name: string;
  is_host: boolean;
  is_connected: boolean;
  joined_at: number;
}

// Scoring
export interface ScoringRules {
  basePoints: number;
  speedBonus?: number;
  streakMultiplier?: number;
  correctBonus?: number;
  wrongPenalty?: number;
  timedBonusThreshold?: number; // milliseconds
  timedBonus?: number;
  custom?: Record<string, any>;
}

// Mode configuration
export interface GameModeConfig {
  id: string;
  label: string;
  type: 'number' | 'boolean' | 'select' | 'text';
  default: any;
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: any }>;
  description?: string;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  minPlayers: number;
  maxPlayers: number | null;
  supportsTeams: boolean;

  revealPattern: RevealPattern;
  scoring: ScoringRules;
  config: GameModeConfig[];
  mechanics: string[]; // e.g., ['elimination', 'powerups', 'betting']

  // Component references (optional, can be lazy loaded)
  gameComponent?: string; // Component name
  bigScreenComponent?: string; // Component name
}

// Powerups (for Powerup Mayhem mode)
export interface Powerup {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number; // Points to activate
  effect: 'fifty_fifty' | 'time_freeze' | 'sabotage' | 'shield' | 'double_points';
  duration?: number; // milliseconds
}

// Achievement tracking
export interface MultiplayerAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'competitive' | 'mode' | 'team';
  condition: string; // e.g., 'win_10_games', 'survive_5_eliminations'
  points: number;
}

// Game state for host
export type HostGameState = 'LOBBY' | 'STARTING' | 'QUESTION_REVEAL' | 'ANSWERING' | 'RESULTS' | 'NEXT' | 'FINISHED';

export interface HostGameContext {
  state: HostGameState;
  session: MultiplayerSession;
  participants: SessionParticipant[];
  currentQuestion?: any;
  answers: Map<string, ParticipantAnswer>;
  startCountdown?: number; // 3, 2, 1
  questionTimer?: number; // milliseconds remaining
  results?: QuestionResults;
}

export interface QuestionResults {
  questionIndex: number;
  questionId: string;
  correctAnswer: any;
  participantResults: Array<{
    participantId: string;
    isCorrect: boolean;
    pointsAwarded: number;
    timeSpent: number;
  }>;
}

// Final leaderboard
export interface FinalLeaderboard {
  rankings: Array<{
    position: number;
    participant: SessionParticipant;
    finalScore: number;
    accuracy: number;
    avgTimePerQuestion: number;
    awards: string[]; // e.g., ['fastest', 'most_streak', 'comeback']
  }>;
  sessionStats: {
    totalDuration: number;
    totalQuestions: number;
    averageScore: number;
  };
}

// Connection state
export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface ConnectionStatus {
  state: ConnectionState;
  lastUpdate: number;
  errorMessage?: string;
  reconnectAttempts: number;
}
