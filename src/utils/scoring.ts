import { ScoringRules } from '../types/multiplayer';
import { ALL_GAME_MODES } from '../types/gameModes';

// Calculate points for an answer
export function calculatePoints(
  isCorrect: boolean,
  timeTakenMs: number,
  gameMode: string,
  currentStreak: number = 0,
  modeData?: Record<string, any>
): number {
  const mode = ALL_GAME_MODES[gameMode];
  if (!mode) return 0;

  const rules = mode.scoring;

  // If wrong answer, apply penalty
  if (!isCorrect) {
    return rules.wrongPenalty || 0;
  }

  let points = rules.basePoints || 0;

  // Speed bonus
  if (rules.speedBonus && timeTakenMs < 10000) {
    const speedPercentage = timeTakenMs / 10000;
    points += Math.floor(rules.speedBonus * (1 - speedPercentage));
  }

  // Timed bonus
  if (
    rules.timedBonusThreshold &&
    rules.timedBonus &&
    timeTakenMs < rules.timedBonusThreshold
  ) {
    points += rules.timedBonus;
  }

  // Streak multiplier
  if (rules.streakMultiplier && currentStreak > 0) {
    if (typeof rules.streakMultiplier === 'number' && rules.streakMultiplier > 1) {
      // Multiplicative streak (e.g., 1.1x per streak)
      points *= Math.pow(rules.streakMultiplier, currentStreak);
    }
  }

  // Mode-specific custom scoring
  if (gameMode === 'perfect_streak' && rules.custom?.streakBased) {
    // 100 × streak number
    points = (rules.basePoints || 100) * currentStreak;
  }

  if (gameMode === 'gold_quest' && modeData?.bet) {
    // Return the bet amount as bonus
    return modeData.bet;
  }

  if (gameMode === 'fishing_frenzy' && rules.custom?.fishRarity) {
    // Determine rarity based on time
    const rarity = rules.custom.fishRarity;
    for (const [name, range] of Object.entries(rarity)) {
      if (timeTakenMs >= range.min && timeTakenMs < range.max) {
        return range.points;
      }
    }
    return rarity.boot?.points || 0;
  }

  if (gameMode === 'jeopardy_mode' && modeData?.difficulty) {
    // Points based on selected difficulty
    const difficulties = rules.custom?.difficulties || {};
    return difficulties[modeData.difficulty] || rules.basePoints || 0;
  }

  if (gameMode === 'auction_mode' && modeData?.bid) {
    // Return bid amount as bonus + flat bonus
    return modeData.bid + (rules.custom?.correctAnswerBonus || 0);
  }

  return Math.floor(points);
}

// Rank participants by score
export function rankParticipants(
  participants: Array<{
    id: string;
    current_score: number;
    total_time_spent: number;
    display_name: string;
  }>
): Array<{
  rank: number;
  participantId: string;
  displayName: string;
  score: number;
  timeSpent: number;
}> {
  // Sort by score (descending), then by time (ascending)
  const sorted = [...participants].sort((a, b) => {
    if (b.current_score !== a.current_score) {
      return b.current_score - a.current_score;
    }
    return a.total_time_spent - b.total_time_spent;
  });

  return sorted.map((p, index) => ({
    rank: index + 1,
    participantId: p.id,
    displayName: p.display_name,
    score: p.current_score,
    timeSpent: p.total_time_spent,
  }));
}

// Get medal/award for position
export function getMedalForRank(rank: number): string | null {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
}

// Calculate accuracy percentage
export function calculateAccuracy(correctAnswers: number, totalAnswers: number): number {
  if (totalAnswers === 0) return 0;
  return Math.round((correctAnswers / totalAnswers) * 100);
}

// Format time duration
export function formatTimeDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs}s`;
  }

  return `${minutes}m ${secs}s`;
}

// Calculate average time per question
export function calculateAvgTimePerQuestion(
  totalTimeSpentMs: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round(totalTimeSpentMs / totalQuestions);
}

// Determine awards/achievements for a participant
export function determineAwards(
  participant: {
    id: string;
    current_score: number;
    current_streak: number;
    max_streak: number;
    total_time_spent: number;
  },
  allParticipants: typeof participant[],
  totalQuestions: number
): string[] {
  const awards: string[] = [];

  // Fastest (lowest total time)
  const fastestTime = Math.min(...allParticipants.map((p) => p.total_time_spent));
  if (participant.total_time_spent === fastestTime && participant.total_time_spent > 0) {
    awards.push('⚡ Fastest');
  }

  // Perfect game (100% accuracy)
  const correctAnswers = participant.current_streak;
  if (correctAnswers === totalQuestions && totalQuestions > 0) {
    awards.push('💯 Perfect!');
  }

  // Highest streak
  const maxStreakInGame = Math.max(...allParticipants.map((p) => p.max_streak));
  if (participant.max_streak === maxStreakInGame && participant.max_streak > 2) {
    awards.push('🔥 Hottest Streak');
  }

  // Comeback (was low, ended high)
  // This would require tracking position changes over questions

  return awards;
}

// Get color for score range
export function getScoreColor(
  score: number,
  totalPossible: number
): 'success' | 'warning' | 'error' {
  const percentage = (score / totalPossible) * 100;

  if (percentage >= 80) return 'success';
  if (percentage >= 50) return 'warning';
  return 'error';
}

// Classic Race scoring breakdown
export function scoreClassicRace(
  isCorrect: boolean,
  timeTakenMs: number,
  currentStreak: number
): number {
  if (!isCorrect) return 0;

  let points = 100; // Base

  // Speed bonus (max 50 points for answering in <2 seconds)
  const speedBonus = Math.max(0, 50 * (1 - timeTakenMs / 10000));
  points += speedBonus;

  // Streak multiplier (1.1x per streak)
  points *= Math.pow(1.1, currentStreak);

  return Math.floor(points);
}

// Points Blitz scoring
export function scorePointsBlitz(position: number): number {
  const placements = [1000, 800, 600, 400, 200];
  return placements[position - 1] || Math.max(0, 200 - (position - 5) * 50);
}

// Tower Defense damage calculation
export function calculateTowerDamage(
  isCorrect: boolean,
  defenderHP: number
): number {
  return isCorrect ? 0 : 150; // 150 damage for wrong answer
}

// Fishing Frenzy rarity calculation
export function getFishRarity(timeTakenMs: number): {
  name: string;
  points: number;
  emoji: string;
} {
  if (timeTakenMs < 3000) {
    return { name: 'Legendary', points: 500, emoji: '✨' };
  }
  if (timeTakenMs < 7000) {
    return { name: 'Rare', points: 300, emoji: '💎' };
  }
  if (timeTakenMs < 10000) {
    return { name: 'Common', points: 100, emoji: '🐟' };
  }
  return { name: 'Boot', points: 50, emoji: '👢' };
}

// Gold Quest coin calculation
export function calculateGoldQuestCoins(
  startingCoins: number,
  bet: number,
  isCorrect: boolean
): number {
  if (isCorrect) {
    return startingCoins + bet;
  } else {
    return Math.max(0, startingCoins - bet);
  }
}
