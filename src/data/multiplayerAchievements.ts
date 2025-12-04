export interface MultiplayerAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'social' | 'competitive' | 'mode';
  condition: string;
}

export const MULTIPLAYER_ACHIEVEMENTS: MultiplayerAchievement[] = [
  // Social Achievements
  {
    id: 'first_multiplayer_game',
    name: 'Welcome to Multiplayer',
    description: 'Complete your first multiplayer game',
    icon: '👋',
    points: 10,
    category: 'social',
    condition: 'Complete 1 multiplayer game',
  },
  {
    id: 'five_multiplayer_games',
    name: 'Party Animal',
    description: 'Complete 5 multiplayer games',
    icon: '🎉',
    points: 25,
    category: 'social',
    condition: 'Complete 5 multiplayer games',
  },
  {
    id: 'ten_multiplayer_games',
    name: 'Multiplayer Master',
    description: 'Complete 10 multiplayer games',
    icon: '🏆',
    points: 50,
    category: 'social',
    condition: 'Complete 10 multiplayer games',
  },
  {
    id: 'host_fifty_games',
    name: 'Game Master',
    description: 'Host 50 multiplayer games',
    icon: '👑',
    points: 75,
    category: 'social',
    condition: 'Host 50 multiplayer games',
  },
  {
    id: 'play_with_ten_people',
    name: 'Networker',
    description: 'Play with 10 different people in multiplayer',
    icon: '🤝',
    points: 40,
    category: 'social',
    condition: 'Play with 10 different players',
  },

  // Competitive Achievements
  {
    id: 'first_place_multiplayer',
    name: 'Winner!',
    description: 'Win your first multiplayer game',
    icon: '🥇',
    points: 20,
    category: 'competitive',
    condition: 'Win 1 multiplayer game',
  },
  {
    id: 'win_five_games',
    name: 'Champion',
    description: 'Win 5 multiplayer games',
    icon: '🏅',
    points: 50,
    category: 'competitive',
    condition: 'Win 5 multiplayer games',
  },
  {
    id: 'win_twenty_games',
    name: 'Dominator',
    description: 'Win 20 multiplayer games',
    icon: '⚡',
    points: 100,
    category: 'competitive',
    condition: 'Win 20 multiplayer games',
  },
  {
    id: 'perfect_score',
    name: 'Perfect Round',
    description: 'Score 100% in a multiplayer game',
    icon: '💯',
    points: 60,
    category: 'competitive',
    condition: 'Get 100% accuracy in one game',
  },
  {
    id: 'fastest_time',
    name: 'Speed Demon',
    description: 'Be the fastest to complete all questions',
    icon: '🚀',
    points: 35,
    category: 'competitive',
    condition: 'Finish first in 1 game (by time)',
  },
  {
    id: 'comeback_win',
    name: 'Comeback King',
    description: 'Win a game after trailing by 50+ points',
    icon: '💪',
    points: 45,
    category: 'competitive',
    condition: 'Win after trailing significantly',
  },

  // Streak Achievements
  {
    id: 'five_correct_streak',
    name: 'On Fire! 🔥',
    description: 'Get 5 correct answers in a row',
    icon: '🔥',
    points: 15,
    category: 'competitive',
    condition: 'Achieve 5-answer streak',
  },
  {
    id: 'ten_correct_streak',
    name: 'Unstoppable',
    description: 'Get 10 correct answers in a row',
    icon: '⭐',
    points: 35,
    category: 'competitive',
    condition: 'Achieve 10-answer streak',
  },
  {
    id: 'perfect_game_streak',
    name: 'Perfect Streaker',
    description: 'Never break your streak in a full game',
    icon: '✨',
    points: 75,
    category: 'competitive',
    condition: 'Complete game without breaking streak',
  },
  {
    id: 'three_game_streak',
    name: 'Winning Streak',
    description: 'Win 3 games in a row',
    icon: '🎯',
    points: 50,
    category: 'competitive',
    condition: 'Win 3 consecutive games',
  },

  // Mode-Specific Achievements
  {
    id: 'classic_race_win',
    name: 'Racer',
    description: 'Win in Classic Race mode',
    icon: '🏁',
    points: 15,
    category: 'mode',
    condition: 'Win Classic Race game',
  },
  {
    id: 'speed_quiz_champion',
    name: 'Lightning Quick',
    description: 'Complete a Speed Quiz with 100% accuracy',
    icon: '⚡',
    points: 30,
    category: 'mode',
    condition: 'Perfect Speed Quiz game',
  },
  {
    id: 'survival_master',
    name: 'Survivor',
    description: 'Win a Survival game',
    icon: '💪',
    points: 25,
    category: 'mode',
    condition: 'Win Survival game',
  },
  {
    id: 'team_battle_winner',
    name: 'Team Player',
    description: 'Win a Team Battle game',
    icon: '🤝',
    points: 20,
    category: 'mode',
    condition: 'Win Team Battle game',
  },
  {
    id: 'gold_quest_riches',
    name: 'Golden Touch',
    description: 'Earn 1000 coins in Gold Quest mode',
    icon: '💰',
    points: 40,
    category: 'mode',
    condition: 'Earn 1000 coins in Gold Quest',
  },
  {
    id: 'tower_defense_fortress',
    name: 'Fort Builder',
    description: 'Survive all 10 waves in Tower Defense',
    icon: '🏰',
    points: 50,
    category: 'mode',
    condition: 'Complete all 10 Tower Defense waves',
  },
  {
    id: 'fishing_frenzy_jackpot',
    name: 'Master Fisher',
    description: 'Catch a legendary fish in Fishing Frenzy',
    icon: '🎣',
    points: 35,
    category: 'mode',
    condition: 'Catch legendary fish',
  },
  {
    id: 'jeopardy_champion',
    name: 'Quiz Master',
    description: 'Win a Jeopardy mode game',
    icon: '📺',
    points: 25,
    category: 'mode',
    condition: 'Win Jeopardy game',
  },
  {
    id: 'battle_royale_last_standing',
    name: 'Last One Standing',
    description: 'Be the last player remaining in Battle Royale',
    icon: '⚔️',
    points: 60,
    category: 'mode',
    condition: 'Win Battle Royale game',
  },
  {
    id: 'marathon_champion',
    name: 'Endurance Runner',
    description: 'Complete a Marathon mode (50+ questions)',
    icon: '🏃',
    points: 45,
    category: 'mode',
    condition: 'Finish Marathon game',
  },

  // Special Achievements
  {
    id: 'host_level_up',
    name: 'Host Experience',
    description: 'Host a game with 5+ players',
    icon: '👨‍💼',
    points: 30,
    category: 'social',
    condition: 'Host game with 5+ players',
  },
  {
    id: 'late_night_player',
    name: 'Night Owl',
    description: 'Play a multiplayer game between midnight and 6 AM',
    icon: '🦉',
    points: 25,
    category: 'social',
    condition: 'Play game late night',
  },
  {
    id: 'cross_timezone',
    name: 'Global Player',
    description: 'Play with someone from a different timezone',
    icon: '🌍',
    points: 20,
    category: 'social',
    condition: 'Play with different timezone',
  },
  {
    id: 'long_game_warrior',
    name: 'Patient Player',
    description: 'Complete a game with 50+ questions',
    icon: '⏱️',
    points: 35,
    category: 'competitive',
    condition: 'Complete 50+ question game',
  },
  {
    id: 'comeback_specialist',
    name: 'Never Give Up',
    description: 'Win 3 games after being in last place at halftime',
    icon: '🎯',
    points: 60,
    category: 'competitive',
    condition: 'Win 3 comeback games',
  },
  {
    id: 'speedrun_specialist',
    name: 'Speedrunner',
    description: 'Complete any game in under 2 minutes average per question',
    icon: '🏃‍♂️',
    points: 40,
    category: 'competitive',
    condition: 'Fast game completion',
  },
  {
    id: 'accuracy_expert',
    name: 'Accuracy Expert',
    description: 'Maintain 95%+ accuracy across 10 multiplayer games',
    icon: '🎯',
    points: 50,
    category: 'competitive',
    condition: 'Maintain 95% accuracy',
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Play with 25 different people',
    icon: '🦋',
    points: 100,
    category: 'social',
    condition: 'Play with 25 different players',
  },
];

export function getMultiplayerAchievementById(id: string): MultiplayerAchievement | undefined {
  return MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAllMultiplayerAchievements(): MultiplayerAchievement[] {
  return MULTIPLAYER_ACHIEVEMENTS;
}

export function getMultiplayerAchievementsByCategory(
  category: 'social' | 'competitive' | 'mode'
): MultiplayerAchievement[] {
  return MULTIPLAYER_ACHIEVEMENTS.filter((a) => a.category === category);
}
