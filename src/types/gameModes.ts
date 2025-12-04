// Game mode specific types and interfaces

import type { GameMode, ScoringRules } from './multiplayer';

// Re-export GameMode for convenience
export type { GameMode } from './multiplayer';

// Helper to create a game mode definition
export function createGameMode(
  id: string,
  name: string,
  description: string,
  icon: string,
  config: Partial<GameMode>
): GameMode {
  return {
    id,
    name,
    description,
    icon,
    minPlayers: 2,
    maxPlayers: null,
    supportsTeams: false,
    revealPattern: 'host_controlled',
    scoring: {
      basePoints: 100,
      speedBonus: 50,
      streakMultiplier: 1.1,
    },
    config: [],
    mechanics: [],
    ...config,
  };
}

// ============================================================================
// CLASSIC RACE 🏁
// ============================================================================

export const CLASSIC_RACE_SCORING: ScoringRules = {
  basePoints: 100,
  speedBonus: 50, // Bonus for answering quickly
  streakMultiplier: 1.1, // 10% multiplier per streak
  correctBonus: 0,
  wrongPenalty: 0,
  timedBonusThreshold: 3000, // 3 seconds
  timedBonus: 25,
};

export const CLASSIC_RACE: GameMode = createGameMode(
  'classic_race',
  'Classic Race',
  'Speed + accuracy. First to answer correctly wins points.',
  '🏁',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: CLASSIC_RACE_SCORING,
    mechanics: ['speed', 'accuracy', 'streaks'],
    config: [
      {
        id: 'base_points',
        label: 'Base Points',
        type: 'number',
        default: 100,
        min: 10,
        max: 500,
        description: 'Points for each correct answer',
      },
      {
        id: 'speed_bonus',
        label: 'Speed Bonus',
        type: 'number',
        default: 50,
        min: 0,
        max: 200,
        description: 'Additional points for fast answers',
      },
    ],
  }
);

// ============================================================================
// POINTS BLITZ ⚡
// ============================================================================

export const POINTS_BLITZ_SCORING: ScoringRules = {
  basePoints: 1000, // 1st place
  custom: {
    placementPoints: [1000, 800, 600, 400, 200], // 1st through 5th
  },
};

export const POINTS_BLITZ: GameMode = createGameMode(
  'points_blitz',
  'Points Blitz',
  'Ranked by speed. Fastest correct answer gets most points.',
  '⚡',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: POINTS_BLITZ_SCORING,
    mechanics: ['ranking', 'speed'],
    config: [
      {
        id: 'first_place_points',
        label: '1st Place Points',
        type: 'number',
        default: 1000,
        min: 100,
        max: 2000,
      },
      {
        id: 'second_place_points',
        label: '2nd Place Points',
        type: 'number',
        default: 800,
        min: 50,
        max: 1500,
      },
    ],
  }
);

// ============================================================================
// SURVIVAL MODE 💀
// ============================================================================

export const SURVIVAL_MODE_SCORING: ScoringRules = {
  basePoints: 100,
  wrongPenalty: -1, // Elimination instead of points
  custom: {
    survivalBonus: 500, // Last player standing bonus
  },
};

export const SURVIVAL_MODE: GameMode = createGameMode(
  'survival_mode',
  'Elimination Challenge',
  'Wrong answer = eliminated. Last player standing wins!',
  '💀',
  {
    minPlayers: 3,
    revealPattern: 'host_controlled',
    scoring: SURVIVAL_MODE_SCORING,
    mechanics: ['elimination', 'pressure'],
    config: [
      {
        id: 'points_per_question',
        label: 'Points Per Question',
        type: 'number',
        default: 100,
        min: 10,
        max: 500,
      },
      {
        id: 'survival_bonus',
        label: 'Last Survivor Bonus',
        type: 'number',
        default: 500,
        min: 0,
        max: 1000,
      },
    ],
  }
);

// ============================================================================
// TEAM BATTLE 🤝
// ============================================================================

export const TEAM_BATTLE_SCORING: ScoringRules = {
  basePoints: 100,
  speedBonus: 50,
  streakMultiplier: 1.15,
  custom: {
    teamAveraging: true, // Average team member scores
  },
};

export const TEAM_BATTLE: GameMode = createGameMode(
  'team_battle',
  'Team Battle',
  'Compete in teams. Highest combined score wins.',
  '🤝',
  {
    minPlayers: 4,
    supportsTeams: true,
    revealPattern: 'host_controlled',
    scoring: TEAM_BATTLE_SCORING,
    mechanics: ['teams', 'cooperation'],
    config: [
      {
        id: 'team_count',
        label: 'Number of Teams',
        type: 'select',
        default: 2,
        options: [
          { label: '2 Teams', value: 2 },
          { label: '3 Teams', value: 3 },
          { label: '4 Teams', value: 4 },
        ],
      },
    ],
  }
);

// ============================================================================
// SPEED QUIZ 🚀
// ============================================================================

export const SPEED_QUIZ_SCORING: ScoringRules = {
  basePoints: 150,
  timedBonusThreshold: 3000,
  timedBonus: 50,
  wrongPenalty: -50,
  custom: {
    superFastBonus: 100, // Under 2 seconds
  },
};

export const SPEED_QUIZ: GameMode = createGameMode(
  'speed_quiz',
  'Speed Quiz',
  'Answer fast! Short time limits with speed bonuses.',
  '🚀',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: SPEED_QUIZ_SCORING,
    mechanics: ['speed', 'time_pressure'],
    config: [
      {
        id: 'time_per_question',
        label: 'Time Per Question',
        type: 'number',
        default: 8,
        min: 3,
        max: 15,
        description: 'Seconds',
      },
      {
        id: 'super_fast_threshold',
        label: 'Super Fast Threshold',
        type: 'number',
        default: 2,
        min: 1,
        max: 5,
        description: 'Seconds for super fast bonus',
      },
    ],
  }
);

// ============================================================================
// LIGHTNING ROUND ⚡⚡⚡
// ============================================================================

export const LIGHTNING_ROUND_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    streakBonus: 250, // Extra bonus for 5-question streak
  },
};

export const LIGHTNING_ROUND: GameMode = createGameMode(
  'lightning_round',
  'Lightning Round',
  '60-second blitz. Answer as many as you can!',
  '⚡⚡⚡',
  {
    minPlayers: 2,
    revealPattern: 'auto_advance',
    scoring: LIGHTNING_ROUND_SCORING,
    mechanics: ['speed', 'no_penalty'],
    config: [
      {
        id: 'round_duration',
        label: 'Round Duration',
        type: 'number',
        default: 60,
        min: 30,
        max: 120,
        description: 'Seconds',
      },
    ],
  }
);

// ============================================================================
// GOLD QUEST 💰
// ============================================================================

export const GOLD_QUEST_SCORING: ScoringRules = {
  basePoints: 0, // Points earned through betting
  custom: {
    startingCoins: 500,
    bettingOptions: [25, 50, 100, 200],
  },
};

export const GOLD_QUEST: GameMode = createGameMode(
  'gold_quest',
  'Gold Quest',
  'Bet coins on your confidence. Risk/reward strategy!',
  '💰',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: GOLD_QUEST_SCORING,
    mechanics: ['betting', 'strategy', 'risk_reward'],
    config: [
      {
        id: 'starting_coins',
        label: 'Starting Coins',
        type: 'number',
        default: 500,
        min: 100,
        max: 1000,
      },
      {
        id: 'min_bet',
        label: 'Minimum Bet',
        type: 'number',
        default: 25,
        min: 10,
        max: 100,
      },
    ],
  }
);

// ============================================================================
// TOWER DEFENSE 🏰
// ============================================================================

export const TOWER_DEFENSE_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    startingHP: 1000,
    damagePerWrong: 150,
    healPerCorrect: 100,
  },
};

export const TOWER_DEFENSE: GameMode = createGameMode(
  'tower_defense',
  'Fortress Duel',
  'Protect your fortress. Attack opponents\' fortresses!',
  '🏰',
  {
    minPlayers: 3,
    revealPattern: 'host_controlled',
    scoring: TOWER_DEFENSE_SCORING,
    mechanics: ['pvp', 'hp_system', 'elimination'],
    config: [
      {
        id: 'starting_hp',
        label: 'Starting HP',
        type: 'number',
        default: 1000,
        min: 500,
        max: 2000,
      },
      {
        id: 'damage_per_wrong',
        label: 'Damage Per Wrong Answer',
        type: 'number',
        default: 150,
        min: 50,
        max: 300,
      },
    ],
  }
);

// ============================================================================
// FISHING FRENZY 🎣
// ============================================================================

export const FISHING_FRENZY_SCORING: ScoringRules = {
  basePoints: 0,
  custom: {
    fishRarity: {
      legendary: { min: 0, max: 3000, points: 500 },
      rare: { min: 3000, max: 7000, points: 300 },
      common: { min: 7000, max: 10000, points: 100 },
      boot: { min: 10000, max: Infinity, points: 50 },
    },
  },
};

export const FISHING_FRENZY: GameMode = createGameMode(
  'fishing_frenzy',
  'Rapid Catch',
  'Answer fast to catch better treasures. Epic = 500pts!',
  '🎣',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: FISHING_FRENZY_SCORING,
    mechanics: ['speed', 'collection'],
    config: [
      {
        id: 'legendary_threshold',
        label: 'Legendary Fish Threshold',
        type: 'number',
        default: 3000,
        min: 1000,
        max: 5000,
        description: 'Milliseconds',
      },
    ],
  }
);

// ============================================================================
// MARATHON MODE 🏃
// ============================================================================

export const MARATHON_MODE_SCORING: ScoringRules = {
  basePoints: 100,
  speedBonus: 50,
  wrongPenalty: -25,
  custom: {
    completionBonus: 1000,
  },
};

export const MARATHON_MODE: GameMode = createGameMode(
  'marathon_mode',
  'Marathon Mode',
  'Complete all questions. Endurance test!',
  '🏃',
  {
    minPlayers: 2,
    supportsTeams: true,
    revealPattern: 'host_controlled',
    scoring: MARATHON_MODE_SCORING,
    mechanics: ['endurance', 'no_elimination'],
    config: [
      {
        id: 'completion_bonus',
        label: 'Completion Bonus',
        type: 'number',
        default: 1000,
        min: 500,
        max: 2000,
      },
    ],
  }
);

// ============================================================================
// PERFECT STREAK 🔥
// ============================================================================

export const PERFECT_STREAK_SCORING: ScoringRules = {
  basePoints: 100,
  streakMultiplier: 1.0, // 100 × streak number
  custom: {
    streakBased: true,
  },
};

export const PERFECT_STREAK: GameMode = createGameMode(
  'perfect_streak',
  'Perfect Streak',
  'Build the longest perfect streak. One mistake and reset!',
  '🔥',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: PERFECT_STREAK_SCORING,
    mechanics: ['streak', 'pressure'],
    config: [
      {
        id: 'streak_multiplier',
        label: 'Streak Point Multiplier',
        type: 'number',
        default: 100,
        min: 50,
        max: 200,
      },
    ],
  }
);

// ============================================================================
// JEOPARDY MODE 💡
// ============================================================================

export const JEOPARDY_MODE_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    difficulties: {
      easy: 100,
      medium: 200,
      hard: 300,
    },
    wrongAnswerPassThrough: true,
  },
};

export const JEOPARDY_MODE: GameMode = createGameMode(
  'jeopardy_mode',
  'Difficulty Picker',
  'Choose question difficulty. Wrong answer = skip to next.',
  '💡',
  {
    minPlayers: 2,
    supportsTeams: true,
    revealPattern: 'host_controlled',
    scoring: JEOPARDY_MODE_SCORING,
    mechanics: ['difficulty_selection', 'pass_through'],
    config: [
      {
        id: 'easy_value',
        label: 'Easy Question Points',
        type: 'number',
        default: 100,
        min: 50,
        max: 300,
      },
    ],
  }
);

// ============================================================================
// BATTLE ROYALE 👑
// ============================================================================

export const BATTLE_ROYALE_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    eliminationRound: 3, // Eliminate bottom player every 3 questions
  },
};

export const BATTLE_ROYALE: GameMode = createGameMode(
  'battle_royale',
  'Royal Rumble',
  'Bottom scorer eliminated every 3 questions. Last one standing wins!',
  '👑',
  {
    minPlayers: 5,
    revealPattern: 'host_controlled',
    scoring: BATTLE_ROYALE_SCORING,
    mechanics: ['elimination', 'rounds'],
    config: [
      {
        id: 'elimination_frequency',
        label: 'Eliminate Every X Questions',
        type: 'number',
        default: 3,
        min: 1,
        max: 10,
      },
    ],
  }
);

// ============================================================================
// RELAY RACE 🏃‍♂️
// ============================================================================

export const RELAY_RACE_SCORING: ScoringRules = {
  basePoints: 150,
  custom: {
    teamRelay: true,
    sequentialAnswering: true,
  },
};

export const RELAY_RACE: GameMode = createGameMode(
  'relay_race',
  'Relay Race',
  'Team members answer in sequence. Pass the baton!',
  '🏃‍♂️',
  {
    minPlayers: 6,
    supportsTeams: true,
    revealPattern: 'host_controlled',
    scoring: RELAY_RACE_SCORING,
    mechanics: ['teams', 'sequential', 'cooperation'],
    config: [
      {
        id: 'team_size',
        label: 'Minimum Team Size',
        type: 'number',
        default: 3,
        min: 2,
        max: 5,
      },
    ],
  }
);

// ============================================================================
// POWERUP MAYHEM 🎮
// ============================================================================

export const POWERUP_MAYHEM_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    powerupFrequency: 3, // Powerup every 3 correct answers
    powerupPool: ['fifty_fifty', 'time_freeze', 'sabotage', 'shield', 'double_points'],
  },
};

export const POWERUP_MAYHEM: GameMode = createGameMode(
  'powerup_mayhem',
  'Powerup Mayhem',
  'Earn and use strategic powerups!',
  '🎮',
  {
    minPlayers: 2,
    supportsTeams: true,
    revealPattern: 'host_controlled',
    scoring: POWERUP_MAYHEM_SCORING,
    mechanics: ['powerups', 'strategy'],
    config: [
      {
        id: 'powerup_frequency',
        label: 'Powerup Every X Correct',
        type: 'number',
        default: 3,
        min: 1,
        max: 10,
      },
    ],
  }
);

// ============================================================================
// AUCTION MODE 🔨
// ============================================================================

export const AUCTION_MODE_SCORING: ScoringRules = {
  basePoints: 0,
  custom: {
    startingBudget: 1000,
    correctAnswerBonus: 300,
    bidPassthrough: true,
  },
};

export const AUCTION_MODE: GameMode = createGameMode(
  'auction_mode',
  'Auction Mode',
  'Bid points for the right to answer questions!',
  '🔨',
  {
    minPlayers: 3,
    revealPattern: 'host_controlled',
    scoring: AUCTION_MODE_SCORING,
    mechanics: ['bidding', 'strategy'],
    config: [
      {
        id: 'starting_budget',
        label: 'Starting Budget',
        type: 'number',
        default: 1000,
        min: 500,
        max: 2000,
      },
    ],
  }
);

// ============================================================================
// ELIMINATION ROUND 💥
// ============================================================================

export const ELIMINATION_ROUND_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    wrongAnswerLives: 3,
    liveBonus: 50,
  },
};

export const ELIMINATION_ROUND: GameMode = createGameMode(
  'elimination_round',
  'Elimination Round',
  'Get 3 wrong answers and you\'re out! Last player standing wins.',
  '💥',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: ELIMINATION_ROUND_SCORING,
    mechanics: ['lives', 'elimination'],
    config: [
      {
        id: 'starting_lives',
        label: 'Starting Lives',
        type: 'number',
        default: 3,
        min: 1,
        max: 5,
        description: 'How many wrong answers before elimination',
      },
    ],
  }
);

// ============================================================================
// RAPID FIRE 🔫
// ============================================================================

export const RAPID_FIRE_SCORING: ScoringRules = {
  basePoints: 50,
  speedBonus: 100,
  custom: {
    timePerQuestion: 5000, // 5 seconds per question
    acceleratingDifficulty: true,
  },
};

export const RAPID_FIRE: GameMode = createGameMode(
  'rapid_fire',
  'Rapid Fire',
  'Answer as many questions as possible in lightning speed!',
  '🔫',
  {
    minPlayers: 1,
    revealPattern: 'host_controlled',
    scoring: RAPID_FIRE_SCORING,
    mechanics: ['speed', 'quantity'],
    config: [
      {
        id: 'time_per_question',
        label: 'Time Per Question (ms)',
        type: 'number',
        default: 5000,
        min: 2000,
        max: 15000,
        description: 'How long to answer each question',
      },
    ],
  }
);

// ============================================================================
// DOUBLE POINTS 💰
// ============================================================================

export const DOUBLE_POINTS_SCORING: ScoringRules = {
  basePoints: 200,
  speedBonus: 100,
  streakMultiplier: 1.2,
  custom: {
    doublePointThreshold: 5, // First 5 correct answers double points
  },
};

export const DOUBLE_POINTS: GameMode = createGameMode(
  'double_points',
  'Double Points',
  'First correct answers are worth double! Build momentum and maximize rewards.',
  '💰',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: DOUBLE_POINTS_SCORING,
    mechanics: ['points', 'momentum'],
    config: [
      {
        id: 'double_threshold',
        label: 'Double Points For First X Correct',
        type: 'number',
        default: 5,
        min: 1,
        max: 15,
      },
    ],
  }
);

// ============================================================================
// TIME PRESSURE ⏰
// ============================================================================

export const TIME_PRESSURE_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    decreasePerSecond: 10,
    minimumPoints: 10,
    bonusTimeForCorrect: 2000,
  },
};

export const TIME_PRESSURE: GameMode = createGameMode(
  'time_pressure',
  'Time Pressure',
  'Points decrease every second! Answer correctly to gain time.',
  '⏰',
  {
    minPlayers: 1,
    revealPattern: 'host_controlled',
    scoring: TIME_PRESSURE_SCORING,
    mechanics: ['time', 'pressure', 'strategy'],
    config: [
      {
        id: 'decrease_per_second',
        label: 'Points Lost Per Second',
        type: 'number',
        default: 10,
        min: 1,
        max: 50,
      },
      {
        id: 'bonus_time_seconds',
        label: 'Bonus Time for Correct Answer',
        type: 'number',
        default: 2,
        min: 1,
        max: 10,
      },
    ],
  }
);

// ============================================================================
// STREAK MASTER 🔥
// ============================================================================

export const STREAK_MASTER_SCORING: ScoringRules = {
  basePoints: 50,
  streakMultiplier: 1.5,
  custom: {
    streakBonus: 200,
    streakResetPenalty: -100,
  },
};

export const STREAK_MASTER: GameMode = createGameMode(
  'streak_master',
  'Streak Master',
  'Build the longest streak! Streaks are worth exponentially more.',
  '🔥',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: STREAK_MASTER_SCORING,
    mechanics: ['streaks', 'momentum', 'high_risk'],
    config: [
      {
        id: 'streak_multiplier',
        label: 'Streak Multiplier',
        type: 'number',
        default: 1.5,
        min: 1,
        max: 3,
        description: 'Multiplier for streak bonuses (e.g., 1.5x)',
      },
    ],
  }
);

// ============================================================================
// SPEED ACCURACY ⚡🎯
// ============================================================================

export const SPEED_ACCURACY_SCORING: ScoringRules = {
  basePoints: 100,
  speedBonus: 75,
  custom: {
    accuracyWeighting: true,
    accuracyMultiplier: 2.0, // Final score = base * speed_multiplier * accuracy_multiplier
  },
};

export const SPEED_ACCURACY: GameMode = createGameMode(
  'speed_accuracy',
  'Speed Accuracy',
  'Fastest AND most accurate wins! Balance speed with precision.',
  '⚡🎯',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: SPEED_ACCURACY_SCORING,
    mechanics: ['speed', 'accuracy', 'combined'],
    config: [
      {
        id: 'base_points',
        label: 'Base Points Per Question',
        type: 'number',
        default: 100,
        min: 50,
        max: 300,
        description: 'Points for each correct answer',
      },
      {
        id: 'accuracy_weight',
        label: 'Accuracy Multiplier',
        type: 'number',
        default: 2,
        min: 1,
        max: 5,
        description: 'How much accuracy affects final score',
      },
    ],
  }
);

// ============================================================================
// UNLIMITED QUESTIONS ♾️
// ============================================================================

export const UNLIMITED_QUESTIONS_SCORING: ScoringRules = {
  basePoints: 50,
  speedBonus: 25,
  custom: {
    repeatableQuestions: true,
    timerBased: true,
    countMultiplier: 1.1, // Score multiplier increases with each question answered
  },
};

export const UNLIMITED_QUESTIONS: GameMode = createGameMode(
  'unlimited_questions',
  'Unlimited Questions',
  'As many questions as possible in the time limit. Questions repeat!',
  '♾️',
  {
    minPlayers: 1,
    revealPattern: 'auto_advance',
    scoring: UNLIMITED_QUESTIONS_SCORING,
    mechanics: ['time_limited', 'no_penalty', 'quantity', 'repeating'],
    config: [
      {
        id: 'time_limit',
        label: 'Time Limit',
        type: 'number',
        default: 300,
        min: 60,
        max: 600,
        description: 'Seconds to answer as many questions as possible',
      },
      {
        id: 'points_per_question',
        label: 'Points Per Correct Answer',
        type: 'number',
        default: 50,
        min: 10,
        max: 200,
      },
    ],
  }
);

// ============================================================================
// CALIBRATED CHALLENGE 🎲
// ============================================================================

export const CALIBRATED_CHALLENGE_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    difficultyScaling: true,
    easyPoints: 50,
    mediumPoints: 100,
    hardPoints: 200,
  },
};

export const CALIBRATED_CHALLENGE: GameMode = createGameMode(
  'calibrated_challenge',
  'Calibrated Challenge',
  'Questions scale in difficulty based on your answers. Miss = easier questions!',
  '🎲',
  {
    minPlayers: 1,
    revealPattern: 'host_controlled',
    scoring: CALIBRATED_CHALLENGE_SCORING,
    mechanics: ['adaptive', 'difficulty_scaling'],
    config: [
      {
        id: 'difficulty_increase',
        label: 'Difficulty Increase on Correct',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Slow', value: 'slow' },
          { label: 'Medium', value: 'medium' },
          { label: 'Fast', value: 'fast' },
        ],
      },
    ],
  }
);

// ============================================================================
// MULTIPLIER MADNESS 🔢
// ============================================================================

export const MULTIPLIER_MADNESS_SCORING: ScoringRules = {
  basePoints: 100,
  custom: {
    multiplierStart: 1,
    multiplierIncrease: 0.5, // Increases by 0.5x per consecutive correct
    multiplierCap: 5, // Max 5x multiplier
  },
};

export const MULTIPLIER_MADNESS: GameMode = createGameMode(
  'multiplier_madness',
  'Multiplier Madness',
  'Points multiply with each consecutive correct answer! Up to 5x!',
  '🔢',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: MULTIPLIER_MADNESS_SCORING,
    mechanics: ['exponential', 'streaks', 'high_risk'],
    config: [
      {
        id: 'max_multiplier',
        label: 'Maximum Multiplier',
        type: 'number',
        default: 5,
        min: 2,
        max: 10,
      },
      {
        id: 'multiplier_increase',
        label: 'Multiplier Increase Per Correct',
        type: 'number',
        default: 0.5,
        min: 0.1,
        max: 1,
      },
    ],
  }
);

// ============================================================================
// PENALIZED MODE 📉
// ============================================================================

export const PENALIZED_MODE_SCORING: ScoringRules = {
  basePoints: 150,
  custom: {
    wrongAnswerPenalty: -75,
    penaltyMultiplier: true, // Penalty increases with consecutive wrongs
  },
};

export const PENALIZED_MODE: GameMode = createGameMode(
  'penalized_mode',
  'Penalized Mode',
  'High points, but wrong answers cost you! Risk management essential.',
  '📉',
  {
    minPlayers: 2,
    revealPattern: 'host_controlled',
    scoring: PENALIZED_MODE_SCORING,
    mechanics: ['penalty', 'risk', 'strategy'],
    config: [
      {
        id: 'wrong_penalty',
        label: 'Points Lost Per Wrong Answer',
        type: 'number',
        default: 75,
        min: 25,
        max: 300,
      },
      {
        id: 'penalty_scaling',
        label: 'Penalty Increases Each Wrong',
        type: 'select',
        default: 'linear',
        options: [
          { label: 'No Scaling', value: 'none' },
          { label: 'Linear', value: 'linear' },
          { label: 'Exponential', value: 'exponential' },
        ],
      },
    ],
  }
);

// ============================================================================
// REGISTRY - All modes
// ============================================================================

export const ALL_GAME_MODES: Record<string, GameMode> = {
  classic_race: CLASSIC_RACE,
  points_blitz: POINTS_BLITZ,
  survival_mode: SURVIVAL_MODE,
  team_battle: TEAM_BATTLE,
  speed_quiz: SPEED_QUIZ,
  lightning_round: LIGHTNING_ROUND,
  gold_quest: GOLD_QUEST,
  tower_defense: TOWER_DEFENSE,
  fishing_frenzy: FISHING_FRENZY,
  marathon_mode: MARATHON_MODE,
  perfect_streak: PERFECT_STREAK,
  jeopardy_mode: JEOPARDY_MODE,
  battle_royale: BATTLE_ROYALE,
  relay_race: RELAY_RACE,
  powerup_mayhem: POWERUP_MAYHEM,
  auction_mode: AUCTION_MODE,
  elimination_round: ELIMINATION_ROUND,
  rapid_fire: RAPID_FIRE,
  double_points: DOUBLE_POINTS,
  time_pressure: TIME_PRESSURE,
  streak_master: STREAK_MASTER,
  speed_accuracy: SPEED_ACCURACY,
  unlimited_questions: UNLIMITED_QUESTIONS,
  calibrated_challenge: CALIBRATED_CHALLENGE,
  multiplier_madness: MULTIPLIER_MADNESS,
  penalized_mode: PENALIZED_MODE,
};

export function getGameMode(id: string): GameMode | undefined {
  return ALL_GAME_MODES[id];
}

export function getAllGameModes(): GameMode[] {
  return Object.values(ALL_GAME_MODES);
}
