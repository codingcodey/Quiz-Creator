import { useCallback } from 'react';
import { MULTIPLAYER_ACHIEVEMENTS, type MultiplayerAchievement } from '../data/multiplayerAchievements';
import type { SessionParticipant } from '../types/multiplayer';

interface AchievementUnlock {
  achievement: MultiplayerAchievement;
  unlockedAt: number;
  progress?: number; // 0-100 percentage towards achievement if not fully unlocked
}

export function useMultiplayerAchievements() {
  // Check if player earned "Welcome to Multiplayer" achievement
  const checkFirstMultiplayerGame = useCallback(
    (gamesPlayedCount: number): MultiplayerAchievement | null => {
      if (gamesPlayedCount === 1) {
        return (
          MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'first_multiplayer_game') || null
        );
      }
      return null;
    },
    []
  );

  // Check games played milestones
  const checkMultiplayerGamesMilestones = useCallback(
    (gamesPlayedCount: number): MultiplayerAchievement[] => {
      const unlocked: MultiplayerAchievement[] = [];
      const milestones = [
        { games: 5, id: 'five_multiplayer_games' },
        { games: 10, id: 'ten_multiplayer_games' },
      ];

      for (const milestone of milestones) {
        if (gamesPlayedCount >= milestone.games) {
          const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === milestone.id);
          if (achievement) unlocked.push(achievement);
        }
      }
      return unlocked;
    },
    []
  );

  // Check competitive achievements based on game results
  const checkCompetitiveAchievements = useCallback(
    (
      rank: number,
      winsCount: number,
      score: number,
      maxStreak: number,
      totalQuestions: number,
      timeTaken: number,
      trailedByPoints: number
    ): MultiplayerAchievement[] => {
      const unlocked: MultiplayerAchievement[] = [];

      // Winner achievement
      if (rank === 1 && winsCount === 1) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'first_place_multiplayer');
        if (achievement) unlocked.push(achievement);
      }

      // Champion and Dominator
      if (winsCount === 5) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'win_five_games');
        if (achievement) unlocked.push(achievement);
      }

      if (winsCount === 20) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'win_twenty_games');
        if (achievement) unlocked.push(achievement);
      }

      // Perfect Round (100% accuracy)
      if (score === totalQuestions * 100) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'perfect_score');
        if (achievement) unlocked.push(achievement);
      }

      // Speed Demon (fastest completion)
      // Note: Requires tracking if player was fastest - handled elsewhere

      // Comeback King (won after trailing by 50+ points)
      if (rank === 1 && trailedByPoints >= 50) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'comeback_win');
        if (achievement) unlocked.push(achievement);
      }

      // Streak achievements
      if (maxStreak === 5) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'five_correct_streak');
        if (achievement) unlocked.push(achievement);
      }

      if (maxStreak === 10) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'ten_correct_streak');
        if (achievement) unlocked.push(achievement);
      }

      // Patient Player (50+ question game)
      if (totalQuestions >= 50) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'long_game_warrior');
        if (achievement) unlocked.push(achievement);
      }

      // Speedrunner (< 2 minutes average per question)
      if (totalQuestions > 0) {
        const avgTimePerQuestion = timeTaken / totalQuestions;
        if (avgTimePerQuestion < 120000) { // 2 minutes in ms
          const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'speedrun_specialist');
          if (achievement) unlocked.push(achievement);
        }
      }

      return unlocked;
    },
    []
  );

  // Check social achievements
  const checkSocialAchievements = useCallback(
    (
      hostedGamesCount: number,
      playersHosted: number,
      uniquePlayersCount: number,
      timePlayed: { hour: number }
    ): MultiplayerAchievement[] => {
      const unlocked: MultiplayerAchievement[] = [];

      // Host Level Up (5+ players)
      if (playersHosted >= 5) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'host_level_up');
        if (achievement) unlocked.push(achievement);
      }

      // Game Master (50 hosted games)
      if (hostedGamesCount >= 50) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'host_fifty_games');
        if (achievement) unlocked.push(achievement);
      }

      // Networker (10 different people)
      if (uniquePlayersCount >= 10) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'play_with_ten_people');
        if (achievement) unlocked.push(achievement);
      }

      // Social Butterfly (25 different people)
      if (uniquePlayersCount >= 25) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'social_butterfly');
        if (achievement) unlocked.push(achievement);
      }

      // Night Owl (play between midnight and 6 AM)
      if (timePlayed.hour >= 0 && timePlayed.hour < 6) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'late_night_player');
        if (achievement) unlocked.push(achievement);
      }

      return unlocked;
    },
    []
  );

  // Check mode-specific achievements
  const checkModeAchievements = useCallback(
    (
      gameMode: string,
      rank: number,
      score: number,
      totalQuestions: number,
      maxStreak?: number,
      coinsEarned?: number,
      wavesCompleted?: number,
      fishRarity?: string
    ): MultiplayerAchievement[] => {
      const unlocked: MultiplayerAchievement[] = [];
      const streak = maxStreak || 0;

      const modeAchievements: Record<string, { id: string; condition: () => boolean }[]> = {
        'classic_race': [
          {
            id: 'classic_race_win',
            condition: () => rank === 1,
          },
        ],
        'speed_quiz': [
          {
            id: 'speed_quiz_champion',
            condition: () => score === totalQuestions * 100,
          },
        ],
        'survival_mode': [
          {
            id: 'survival_master',
            condition: () => rank === 1,
          },
        ],
        'team_battle': [
          {
            id: 'team_battle_winner',
            condition: () => rank === 1,
          },
        ],
        'gold_quest': [
          {
            id: 'gold_quest_riches',
            condition: () => (coinsEarned || 0) >= 1000,
          },
        ],
        'tower_defense': [
          {
            id: 'tower_defense_fortress',
            condition: () => (wavesCompleted || 0) >= 10,
          },
        ],
        'fishing_frenzy': [
          {
            id: 'fishing_frenzy_jackpot',
            condition: () => fishRarity === 'legendary',
          },
        ],
        'jeopardy_mode': [
          {
            id: 'jeopardy_champion',
            condition: () => rank === 1,
          },
        ],
        'battle_royale': [
          {
            id: 'battle_royale_last_standing',
            condition: () => rank === 1,
          },
        ],
        'marathon_mode': [
          {
            id: 'marathon_champion',
            condition: () => totalQuestions >= 50 && rank === 1,
          },
        ],
        'elimination_round': [
          {
            id: 'elimination_survivor',
            condition: () => rank === 1,
          },
        ],
        'rapid_fire': [
          {
            id: 'rapid_fire_master',
            condition: () => streak >= 10,
          },
        ],
        'double_points': [
          {
            id: 'double_points_winner',
            condition: () => rank === 1,
          },
        ],
        'time_pressure': [
          {
            id: 'time_pressure_champion',
            condition: () => rank === 1,
          },
        ],
        'streak_master': [
          {
            id: 'streak_legend',
            condition: () => streak >= 15,
          },
        ],
      };

      const achievements = modeAchievements[gameMode] || [];
      for (const check of achievements) {
        if (check.condition()) {
          const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === check.id);
          if (achievement) unlocked.push(achievement);
        }
      }

      return unlocked;
    },
    []
  );

  // Check streak achievements (3 wins in a row, etc.)
  const checkStreakAchievements = useCallback(
    (winStreak: number, comebackWins: number): MultiplayerAchievement[] => {
      const unlocked: MultiplayerAchievement[] = [];

      if (winStreak >= 3) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'three_game_streak');
        if (achievement) unlocked.push(achievement);
      }

      if (comebackWins >= 3) {
        const achievement = MULTIPLAYER_ACHIEVEMENTS.find((a) => a.id === 'comeback_specialist');
        if (achievement) unlocked.push(achievement);
      }

      return unlocked;
    },
    []
  );

  // Comprehensive check for all achievements after game ends
  const checkAllAchievements = useCallback(
    (
      participant: SessionParticipant,
      rank: number,
      gameMode: string,
      totalQuestions: number,
      timeTaken: number,
      userStats: {
        gamesPlayedCount: number;
        winsCount: number;
        hostedGamesCount: number;
        playersHosted: number;
        uniquePlayersCount: number;
        winStreak: number;
        comebackWins: number;
        trailedByPoints: number;
        coinsEarned?: number;
        wavesCompleted?: number;
        fishRarity?: string;
      }
    ): AchievementUnlock[] => {
      const allUnlocked: MultiplayerAchievement[] = [];

      // Check all achievement categories
      const firstGame = checkFirstMultiplayerGame(userStats.gamesPlayedCount);
      if (firstGame) allUnlocked.push(firstGame);

      allUnlocked.push(...checkMultiplayerGamesMilestones(userStats.gamesPlayedCount));

      allUnlocked.push(
        ...checkCompetitiveAchievements(
          rank,
          userStats.winsCount,
          participant.current_score,
          participant.max_streak,
          totalQuestions,
          timeTaken,
          userStats.trailedByPoints
        )
      );

      const now = new Date();
      allUnlocked.push(
        ...checkSocialAchievements(
          userStats.hostedGamesCount,
          userStats.playersHosted,
          userStats.uniquePlayersCount,
          { hour: now.getHours() }
        )
      );

      allUnlocked.push(
        ...checkModeAchievements(
          gameMode,
          rank,
          participant.current_score,
          totalQuestions,
          participant.max_streak,
          userStats.coinsEarned,
          userStats.wavesCompleted,
          userStats.fishRarity
        )
      );

      allUnlocked.push(...checkStreakAchievements(userStats.winStreak, userStats.comebackWins));

      // Remove duplicates and create achievement unlock records
      const uniqueAchievements = Array.from(
        new Map(allUnlocked.map((a) => [a.id, a])).values()
      );

      return uniqueAchievements.map((achievement) => ({
        achievement,
        unlockedAt: Date.now(),
      }));
    },
    [
      checkFirstMultiplayerGame,
      checkMultiplayerGamesMilestones,
      checkCompetitiveAchievements,
      checkSocialAchievements,
      checkModeAchievements,
      checkStreakAchievements,
    ]
  );

  return {
    checkFirstMultiplayerGame,
    checkMultiplayerGamesMilestones,
    checkCompetitiveAchievements,
    checkSocialAchievements,
    checkModeAchievements,
    checkStreakAchievements,
    checkAllAchievements,
  };
}
