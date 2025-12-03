// Game mode specific types and interfaces

import { GameMode, ScoringRules, GameModeConfig, RevealPattern } from './multiplayer';

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
  'Survival Mode',
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
  'Tower Defense',
  'Protect your tower. Attack opponents\' towers!',
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
  'Fishing Frenzy',
  'Answer fast to catch better fish. Legendary = 500pts!',
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
  'Jeopardy Mode',
  'Choose question difficulty. Wrong answer = pass to next correct.',
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
  'Battle Royale',
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
};

export function getGameMode(id: string): GameMode | undefined {
  return ALL_GAME_MODES[id];
}

export function getAllGameModes(): GameMode[] {
  return Object.values(ALL_GAME_MODES);
}
