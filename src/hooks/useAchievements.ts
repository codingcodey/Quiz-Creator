import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quiz' | 'streak' | 'score' | 'milestone' | 'special';
  requirement: number;
  unlockedAt?: number;
}

interface AchievementProgress {
  achievementId: string;
  currentValue: number;
}

const ACHIEVEMENTS_KEY = 'quiz-creator-achievements';
const PROGRESS_KEY = 'quiz-creator-achievement-progress';

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  // Quiz achievements
  { id: 'first-quiz', name: 'Getting Started', description: 'Complete your first quiz', icon: '🎯', category: 'quiz', requirement: 1 },
  { id: 'quiz-5', name: 'Quiz Enthusiast', description: 'Complete 5 quizzes', icon: '📚', category: 'quiz', requirement: 5 },
  { id: 'quiz-25', name: 'Quiz Master', description: 'Complete 25 quizzes', icon: '🏆', category: 'quiz', requirement: 25 },
  { id: 'quiz-100', name: 'Quiz Legend', description: 'Complete 100 quizzes', icon: '👑', category: 'quiz', requirement: 100 },
  
  // Streak achievements
  { id: 'streak-3', name: 'On Fire', description: 'Get a 3-question streak', icon: '🔥', category: 'streak', requirement: 3 },
  { id: 'streak-5', name: 'Unstoppable', description: 'Get a 5-question streak', icon: '⚡', category: 'streak', requirement: 5 },
  { id: 'streak-10', name: 'Genius Mode', description: 'Get a 10-question streak', icon: '🧠', category: 'streak', requirement: 10 },
  { id: 'streak-20', name: 'Legendary Streak', description: 'Get a 20-question streak', icon: '💎', category: 'streak', requirement: 20 },
  
  // Score achievements
  { id: 'perfect-score', name: 'Perfect!', description: 'Get 100% on a quiz', icon: '✨', category: 'score', requirement: 100 },
  { id: 'perfect-5', name: 'Perfectionist', description: 'Get 5 perfect scores', icon: '🌟', category: 'score', requirement: 5 },
  { id: 'perfect-25', name: 'Flawless', description: 'Get 25 perfect scores', icon: '💯', category: 'score', requirement: 25 },
  
  // Creator achievements
  { id: 'creator-1', name: 'Quiz Creator', description: 'Create your first quiz', icon: '✏️', category: 'milestone', requirement: 1 },
  { id: 'creator-5', name: 'Prolific Creator', description: 'Create 5 quizzes', icon: '📝', category: 'milestone', requirement: 5 },
  { id: 'creator-10', name: 'Quiz Factory', description: 'Create 10 quizzes', icon: '🏭', category: 'milestone', requirement: 10 },
  
  // Special achievements
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a timed quiz with time to spare', icon: '⏱️', category: 'special', requirement: 1 },
  { id: 'night-owl', name: 'Night Owl', description: 'Complete a quiz after midnight', icon: '🦉', category: 'special', requirement: 1 },
  { id: 'early-bird', name: 'Early Bird', description: 'Complete a quiz before 6 AM', icon: '🐦', category: 'special', requirement: 1 },
  { id: 'sharing-caring', name: 'Sharing is Caring', description: 'Share a quiz with others', icon: '🤝', category: 'special', requirement: 1 },
];

export function useAchievements() {
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<Achievement[]>(ACHIEVEMENTS_KEY, []);
  const [progress, setProgress] = useLocalStorage<AchievementProgress[]>(PROGRESS_KEY, []);

  const isUnlocked = useCallback(
    (achievementId: string) => unlockedAchievements.some((a) => a.id === achievementId),
    [unlockedAchievements]
  );

  const getProgress = useCallback(
    (achievementId: string) => {
      const p = progress.find((p) => p.achievementId === achievementId);
      const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
      return {
        current: p?.currentValue || 0,
        required: def?.requirement || 0,
        percentage: def ? ((p?.currentValue || 0) / def.requirement) * 100 : 0,
      };
    },
    [progress]
  );

  const updateProgress = useCallback(
    (achievementId: string, value: number) => {
      const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
      if (!def) return null;

      // Update progress
      setProgress((prev) => {
        const existing = prev.find((p) => p.achievementId === achievementId);
        if (existing) {
          return prev.map((p) =>
            p.achievementId === achievementId
              ? { ...p, currentValue: Math.max(p.currentValue, value) }
              : p
          );
        }
        return [...prev, { achievementId, currentValue: value }];
      });

      // Check if achievement should be unlocked
      if (value >= def.requirement && !isUnlocked(achievementId)) {
        const unlockedAchievement: Achievement = {
          ...def,
          unlockedAt: Date.now(),
        };
        setUnlockedAchievements((prev) => [...prev, unlockedAchievement]);
        return unlockedAchievement;
      }

      return null;
    },
    [isUnlocked, setProgress, setUnlockedAchievements]
  );

  const checkQuizCompletion = useCallback(
    (score: number, maxStreak: number, timeRemaining?: number) => {
      const newAchievements: Achievement[] = [];

      // Quiz count
      const quizCount = unlockedAchievements.filter((a) => a.category === 'quiz').length + 1;
      
      // First quiz
      let result = updateProgress('first-quiz', 1);
      if (result) newAchievements.push(result);

      // Quiz milestones
      result = updateProgress('quiz-5', quizCount);
      if (result) newAchievements.push(result);
      result = updateProgress('quiz-25', quizCount);
      if (result) newAchievements.push(result);
      result = updateProgress('quiz-100', quizCount);
      if (result) newAchievements.push(result);

      // Streak achievements
      result = updateProgress('streak-3', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-5', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-10', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-20', maxStreak);
      if (result) newAchievements.push(result);

      // Perfect score
      if (score === 100) {
        result = updateProgress('perfect-score', 1);
        if (result) newAchievements.push(result);
        
        const perfectCount = (getProgress('perfect-5').current || 0) + 1;
        result = updateProgress('perfect-5', perfectCount);
        if (result) newAchievements.push(result);
        result = updateProgress('perfect-25', perfectCount);
        if (result) newAchievements.push(result);
      }

      // Speed demon
      if (timeRemaining && timeRemaining > 0) {
        result = updateProgress('speed-demon', 1);
        if (result) newAchievements.push(result);
      }

      // Time-based achievements
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) {
        result = updateProgress('night-owl', 1);
        if (result) newAchievements.push(result);
      }
      if (hour >= 5 && hour < 6) {
        result = updateProgress('early-bird', 1);
        if (result) newAchievements.push(result);
      }

      return newAchievements;
    },
    [unlockedAchievements, updateProgress, getProgress]
  );

  const checkQuizCreated = useCallback(() => {
    const newAchievements: Achievement[] = [];
    const createdCount = (getProgress('creator-1').current || 0) + 1;

    let result = updateProgress('creator-1', createdCount);
    if (result) newAchievements.push(result);
    result = updateProgress('creator-5', createdCount);
    if (result) newAchievements.push(result);
    result = updateProgress('creator-10', createdCount);
    if (result) newAchievements.push(result);

    return newAchievements;
  }, [updateProgress, getProgress]);

  const checkQuizShared = useCallback(() => {
    const result = updateProgress('sharing-caring', 1);
    return result ? [result] : [];
  }, [updateProgress]);

  const allAchievements = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      unlockedAt: unlockedAchievements.find((a) => a.id === def.id)?.unlockedAt,
    }));
  }, [unlockedAchievements]);

  const stats = useMemo(() => ({
    total: ACHIEVEMENT_DEFINITIONS.length,
    unlocked: unlockedAchievements.length,
    percentage: (unlockedAchievements.length / ACHIEVEMENT_DEFINITIONS.length) * 100,
  }), [unlockedAchievements.length]);

  return {
    achievements: allAchievements,
    unlockedAchievements,
    isUnlocked,
    getProgress,
    updateProgress,
    checkQuizCompletion,
    checkQuizCreated,
    checkQuizShared,
    stats,
  };
}

