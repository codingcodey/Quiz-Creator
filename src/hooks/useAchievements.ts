import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quiz' | 'streak' | 'score' | 'milestone' | 'special' | 'explorer' | 'speed' | 'dedication';
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
  // Quiz completion achievements
  { id: 'first-quiz', name: 'Getting Started', description: 'Complete your first quiz', icon: '🎯', category: 'quiz', requirement: 1 },
  { id: 'quiz-5', name: 'Quiz Enthusiast', description: 'Complete 5 quizzes', icon: '📚', category: 'quiz', requirement: 5 },
  { id: 'quiz-10', name: 'Quiz Addict', description: 'Complete 10 quizzes', icon: '🎮', category: 'quiz', requirement: 10 },
  { id: 'quiz-25', name: 'Quiz Master', description: 'Complete 25 quizzes', icon: '🏆', category: 'quiz', requirement: 25 },
  { id: 'quiz-50', name: 'Quiz Champion', description: 'Complete 50 quizzes', icon: '🥇', category: 'quiz', requirement: 50 },
  { id: 'quiz-100', name: 'Quiz Legend', description: 'Complete 100 quizzes', icon: '👑', category: 'quiz', requirement: 100 },
  { id: 'quiz-250', name: 'Quiz Virtuoso', description: 'Complete 250 quizzes', icon: '⭐', category: 'quiz', requirement: 250 },
  { id: 'quiz-500', name: 'Quiz Immortal', description: 'Complete 500 quizzes', icon: '🔱', category: 'quiz', requirement: 500 },
  
  // Streak achievements
  { id: 'streak-3', name: 'On Fire', description: 'Get a 3-question streak', icon: '🔥', category: 'streak', requirement: 3 },
  { id: 'streak-5', name: 'Unstoppable', description: 'Get a 5-question streak', icon: '⚡', category: 'streak', requirement: 5 },
  { id: 'streak-10', name: 'Genius Mode', description: 'Get a 10-question streak', icon: '🧠', category: 'streak', requirement: 10 },
  { id: 'streak-15', name: 'Mind Reader', description: 'Get a 15-question streak', icon: '🔮', category: 'streak', requirement: 15 },
  { id: 'streak-20', name: 'Legendary Streak', description: 'Get a 20-question streak', icon: '💎', category: 'streak', requirement: 20 },
  { id: 'streak-30', name: 'Streak Master', description: 'Get a 30-question streak', icon: '🌈', category: 'streak', requirement: 30 },
  { id: 'streak-50', name: 'Untouchable', description: 'Get a 50-question streak', icon: '🦄', category: 'streak', requirement: 50 },
  
  // Score achievements
  { id: 'perfect-score', name: 'Perfect!', description: 'Get 100% on a quiz', icon: '✨', category: 'score', requirement: 100 },
  { id: 'perfect-5', name: 'Perfectionist', description: 'Get 5 perfect scores', icon: '🌠', category: 'score', requirement: 5 },
  { id: 'perfect-10', name: 'Ace Student', description: 'Get 10 perfect scores', icon: '🎓', category: 'score', requirement: 10 },
  { id: 'perfect-25', name: 'Flawless', description: 'Get 25 perfect scores', icon: '💯', category: 'score', requirement: 25 },
  { id: 'perfect-50', name: 'Perfectionist Pro', description: 'Get 50 perfect scores', icon: '🎖️', category: 'score', requirement: 50 },
  { id: 'score-90', name: 'A+ Student', description: 'Score 90% or higher 10 times', icon: '📊', category: 'score', requirement: 10 },
  { id: 'score-80', name: 'Solid Performer', description: 'Score 80% or higher 20 times', icon: '📈', category: 'score', requirement: 20 },
  { id: 'comeback', name: 'Comeback Kid', description: 'Score higher than your previous attempt', icon: '↗️', category: 'score', requirement: 1 },
  
  // Creator achievements
  { id: 'creator-1', name: 'Quiz Creator', description: 'Create your first quiz', icon: '✏️', category: 'milestone', requirement: 1 },
  { id: 'creator-5', name: 'Prolific Creator', description: 'Create 5 quizzes', icon: '🖊️', category: 'milestone', requirement: 5 },
  { id: 'creator-10', name: 'Quiz Factory', description: 'Create 10 quizzes', icon: '🏭', category: 'milestone', requirement: 10 },
  { id: 'creator-25', name: 'Content Machine', description: 'Create 25 quizzes', icon: '🎨', category: 'milestone', requirement: 25 },
  { id: 'creator-50', name: 'Quiz Architect', description: 'Create 50 quizzes', icon: '🏗️', category: 'milestone', requirement: 50 },
  { id: 'big-quiz', name: 'Epic Quest', description: 'Create a quiz with 20+ questions', icon: '📋', category: 'milestone', requirement: 20 },
  { id: 'huge-quiz', name: 'Quiz Marathon Creator', description: 'Create a quiz with 50+ questions', icon: '🏃', category: 'milestone', requirement: 50 },
  
  // Explorer achievements - trying different things
  { id: 'explorer-template', name: 'Template Explorer', description: 'Use 5 different templates', icon: '🗺️', category: 'explorer', requirement: 5 },
  { id: 'explorer-all-types', name: 'Question Master', description: 'Answer all question types (MC, multi-select, type-in)', icon: '🎲', category: 'explorer', requirement: 3 },
  { id: 'timed-quiz', name: 'Time Warrior', description: 'Complete 5 timed quizzes', icon: '⏰', category: 'explorer', requirement: 5 },
  { id: 'shuffled-quiz', name: 'Chaos Champion', description: 'Complete 5 shuffled quizzes', icon: '🔀', category: 'explorer', requirement: 5 },
  { id: 'hint-user', name: 'Hint Hunter', description: 'Use hints in 10 quizzes', icon: '💡', category: 'explorer', requirement: 10 },
  { id: 'no-hints', name: 'No Help Needed', description: 'Complete 10 quizzes without using hints', icon: '🦸', category: 'explorer', requirement: 10 },
  
  // Speed achievements
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a timed quiz with time to spare', icon: '⏱️', category: 'speed', requirement: 1 },
  { id: 'lightning-fast', name: 'Lightning Fast', description: 'Answer a question in under 3 seconds', icon: '⚡', category: 'speed', requirement: 1 },
  { id: 'quick-thinker', name: 'Quick Thinker', description: 'Complete a 10+ question quiz in under 2 minutes', icon: '🚀', category: 'speed', requirement: 1 },
  { id: 'speed-streak', name: 'Speed Streak', description: 'Answer 5 questions correctly under 5 seconds each', icon: '💨', category: 'speed', requirement: 5 },
  { id: 'time-master', name: 'Time Master', description: 'Complete 10 timed quizzes with time remaining', icon: '⏳', category: 'speed', requirement: 10 },
  
  // Special time-based achievements
  { id: 'night-owl', name: 'Night Owl', description: 'Complete a quiz after midnight', icon: '🦉', category: 'special', requirement: 1 },
  { id: 'early-bird', name: 'Early Bird', description: 'Complete a quiz before 6 AM', icon: '🐦', category: 'special', requirement: 1 },
  { id: 'lunch-learner', name: 'Lunch Learner', description: 'Complete a quiz between 12-1 PM', icon: '🥪', category: 'special', requirement: 1 },
  { id: 'weekend-warrior', name: 'Weekend Warrior', description: 'Complete a quiz on Saturday or Sunday', icon: '🎉', category: 'special', requirement: 1 },
  
  // Dedication achievements
  { id: 'daily-player', name: 'Daily Habit', description: 'Play quizzes 7 days in a row', icon: '📅', category: 'dedication', requirement: 7 },
  { id: 'weekly-streak', name: 'Weekly Dedication', description: 'Play quizzes 14 days in a row', icon: '🗓️', category: 'dedication', requirement: 14 },
  { id: 'monthly-master', name: 'Monthly Master', description: 'Play quizzes 30 days in a row', icon: '📆', category: 'dedication', requirement: 30 },
  { id: 'questions-100', name: 'Century Club', description: 'Answer 100 questions total', icon: '💯', category: 'dedication', requirement: 100 },
  { id: 'questions-500', name: 'Question Crusher', description: 'Answer 500 questions total', icon: '🔨', category: 'dedication', requirement: 500 },
  { id: 'questions-1000', name: 'Thousand Questions', description: 'Answer 1000 questions total', icon: '🏔️', category: 'dedication', requirement: 1000 },
  { id: 'hours-played-1', name: 'First Hour', description: 'Spend 1 hour playing quizzes', icon: '⌚', category: 'dedication', requirement: 1 },
  { id: 'hours-played-10', name: 'Dedicated Learner', description: 'Spend 10 hours playing quizzes', icon: '📖', category: 'dedication', requirement: 10 },
  
  // Sharing achievements
  { id: 'sharing-caring', name: 'Sharing is Caring', description: 'Share a quiz with others', icon: '🤝', category: 'special', requirement: 1 },
  { id: 'social-butterfly', name: 'Social Butterfly', description: 'Share 10 quizzes', icon: '🦋', category: 'special', requirement: 10 },
  
  // Fun & special achievements
  { id: 'first-try-perfect', name: 'Beginner\'s Luck', description: 'Get 100% on your first ever quiz', icon: '🍀', category: 'special', requirement: 1 },
  { id: 'favorites', name: 'Collector', description: 'Mark 5 quizzes as favorites', icon: '🌟', category: 'special', requirement: 5 },
  { id: 'organized', name: 'Organization Pro', description: 'Create 3 folders to organize quizzes', icon: '📁', category: 'special', requirement: 3 },
  { id: 'variety-king', name: 'Variety King', description: 'Complete quizzes in 5 different categories', icon: '🎭', category: 'special', requirement: 5 },
  { id: 'persistence', name: 'Never Give Up', description: 'Retry a quiz 5 times', icon: '💪', category: 'special', requirement: 5 },
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

  const incrementProgress = useCallback(
    (achievementId: string) => {
      const current = getProgress(achievementId).current;
      return updateProgress(achievementId, current + 1);
    },
    [getProgress, updateProgress]
  );

  const checkQuizCompletion = useCallback(
    (
      score: number, 
      maxStreak: number, 
      timeRemaining?: number,
      questionCount?: number,
      timeSpent?: number,
      usedHints?: boolean,
      isTimed?: boolean,
      isShuffled?: boolean,
      previousScore?: number,
      isFirstQuiz?: boolean
    ) => {
      const newAchievements: Achievement[] = [];

      // Quiz count - increment total
      let result = incrementProgress('first-quiz');
      if (result) newAchievements.push(result);
      
      // Get updated quiz count (after increment)
      const quizCount = getProgress('first-quiz').current;
      
      // Quiz milestones
      result = updateProgress('quiz-5', quizCount);
      if (result) newAchievements.push(result);
      result = updateProgress('quiz-10', quizCount);
      if (result) newAchievements.push(result);
      result = updateProgress('quiz-25', quizCount);
      if (result) newAchievements.push(result);
      result = updateProgress('quiz-50', quizCount);
      if (result) newAchievements.push(result);
      result = updateProgress('quiz-100', quizCount);
      if (result) newAchievements.push(result);
      result = updateProgress('quiz-250', quizCount);
      if (result) newAchievements.push(result);
      result = updateProgress('quiz-500', quizCount);
      if (result) newAchievements.push(result);

      // Streak achievements
      result = updateProgress('streak-3', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-5', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-10', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-15', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-20', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-30', maxStreak);
      if (result) newAchievements.push(result);
      result = updateProgress('streak-50', maxStreak);
      if (result) newAchievements.push(result);

      // Perfect score
      if (score === 100) {
        result = updateProgress('perfect-score', 1);
        if (result) newAchievements.push(result);
        
        const perfectCount = getProgress('perfect-5').current + 1;
        result = updateProgress('perfect-5', perfectCount);
        if (result) newAchievements.push(result);
        result = updateProgress('perfect-10', perfectCount);
        if (result) newAchievements.push(result);
        result = updateProgress('perfect-25', perfectCount);
        if (result) newAchievements.push(result);
        result = updateProgress('perfect-50', perfectCount);
        if (result) newAchievements.push(result);

        // First try perfect
        if (isFirstQuiz) {
          result = updateProgress('first-try-perfect', 1);
          if (result) newAchievements.push(result);
        }
      }

      // Score 90%+
      if (score >= 90) {
        result = incrementProgress('score-90');
        if (result) newAchievements.push(result);
      }

      // Score 80%+
      if (score >= 80) {
        result = incrementProgress('score-80');
        if (result) newAchievements.push(result);
      }

      // Comeback - scored higher than before
      if (previousScore !== undefined && score > previousScore) {
        result = updateProgress('comeback', 1);
        if (result) newAchievements.push(result);
      }

      // Speed demon - timed quiz with time remaining
      if (timeRemaining && timeRemaining > 0) {
        result = updateProgress('speed-demon', 1);
        if (result) newAchievements.push(result);

        result = incrementProgress('time-master');
        if (result) newAchievements.push(result);
      }

      // Quick thinker - 10+ questions in under 2 minutes
      if (questionCount && questionCount >= 10 && timeSpent && timeSpent < 120) {
        result = updateProgress('quick-thinker', 1);
        if (result) newAchievements.push(result);
      }

      // Timed quiz completion
      if (isTimed) {
        result = incrementProgress('timed-quiz');
        if (result) newAchievements.push(result);
      }

      // Shuffled quiz completion
      if (isShuffled) {
        result = incrementProgress('shuffled-quiz');
        if (result) newAchievements.push(result);
      }

      // Hint usage
      if (usedHints) {
        result = incrementProgress('hint-user');
        if (result) newAchievements.push(result);
      } else {
        result = incrementProgress('no-hints');
        if (result) newAchievements.push(result);
      }

      // Questions answered
      if (questionCount) {
        const totalQuestions = getProgress('questions-100').current + questionCount;
        result = updateProgress('questions-100', totalQuestions);
        if (result) newAchievements.push(result);
        result = updateProgress('questions-500', totalQuestions);
        if (result) newAchievements.push(result);
        result = updateProgress('questions-1000', totalQuestions);
        if (result) newAchievements.push(result);
      }

      // Time-based achievements
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      
      if (hour >= 0 && hour < 5) {
        result = updateProgress('night-owl', 1);
        if (result) newAchievements.push(result);
      }
      if (hour >= 5 && hour < 6) {
        result = updateProgress('early-bird', 1);
        if (result) newAchievements.push(result);
      }
      if (hour >= 12 && hour < 13) {
        result = updateProgress('lunch-learner', 1);
        if (result) newAchievements.push(result);
      }
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        result = updateProgress('weekend-warrior', 1);
        if (result) newAchievements.push(result);
      }

      return newAchievements;
    },
    [updateProgress, getProgress, incrementProgress]
  );

  const checkQuizCreated = useCallback((questionCount?: number) => {
    const newAchievements: Achievement[] = [];
    const createdCount = getProgress('creator-1').current + 1;

    let result = updateProgress('creator-1', createdCount);
    if (result) newAchievements.push(result);
    result = updateProgress('creator-5', createdCount);
    if (result) newAchievements.push(result);
    result = updateProgress('creator-10', createdCount);
    if (result) newAchievements.push(result);
    result = updateProgress('creator-25', createdCount);
    if (result) newAchievements.push(result);
    result = updateProgress('creator-50', createdCount);
    if (result) newAchievements.push(result);

    // Big quiz achievements
    if (questionCount && questionCount >= 20) {
      result = updateProgress('big-quiz', questionCount);
      if (result) newAchievements.push(result);
    }
    if (questionCount && questionCount >= 50) {
      result = updateProgress('huge-quiz', questionCount);
      if (result) newAchievements.push(result);
    }

    return newAchievements;
  }, [updateProgress, getProgress]);

  const checkQuizShared = useCallback(() => {
    const newAchievements: Achievement[] = [];
    
    let result = updateProgress('sharing-caring', 1);
    if (result) newAchievements.push(result);

    const shareCount = getProgress('social-butterfly').current + 1;
    result = updateProgress('social-butterfly', shareCount);
    if (result) newAchievements.push(result);

    return newAchievements;
  }, [updateProgress, getProgress]);

  const checkTemplateUsed = useCallback(() => {
    const newAchievements: Achievement[] = [];
    
    // Track templates used
    const result = incrementProgress('explorer-template');
    if (result) newAchievements.push(result);

    return newAchievements;
  }, [incrementProgress]);

  const checkFavorited = useCallback(() => {
    const newAchievements: Achievement[] = [];
    const result = incrementProgress('favorites');
    if (result) newAchievements.push(result);
    return newAchievements;
  }, [incrementProgress]);

  const checkFolderCreated = useCallback(() => {
    const newAchievements: Achievement[] = [];
    const result = incrementProgress('organized');
    if (result) newAchievements.push(result);
    return newAchievements;
  }, [incrementProgress]);

  const checkRetry = useCallback(() => {
    const newAchievements: Achievement[] = [];
    const result = incrementProgress('persistence');
    if (result) newAchievements.push(result);
    return newAchievements;
  }, [incrementProgress]);

  const checkQuestionTypes = useCallback((types: string[]) => {
    const newAchievements: Achievement[] = [];
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size >= 3) {
      const result = updateProgress('explorer-all-types', uniqueTypes.size);
      if (result) newAchievements.push(result);
    }
    return newAchievements;
  }, [updateProgress]);

  const checkFastAnswer = useCallback((answerTime: number) => {
    const newAchievements: Achievement[] = [];
    if (answerTime < 3) {
      const result = updateProgress('lightning-fast', 1);
      if (result) newAchievements.push(result);
    }
    return newAchievements;
  }, [updateProgress]);

  const allAchievements = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      unlockedAt: unlockedAchievements.find((a) => a.id === def.id)?.unlockedAt,
    }));
  }, [unlockedAchievements]);

  const achievementsByCategory = useMemo(() => {
    const categories = [...new Set(ACHIEVEMENT_DEFINITIONS.map(a => a.category))];
    return categories.map(category => ({
      category,
      achievements: allAchievements.filter(a => a.category === category),
      unlockedCount: allAchievements.filter(a => a.category === category && a.unlockedAt).length,
      totalCount: allAchievements.filter(a => a.category === category).length,
    }));
  }, [allAchievements]);

  const stats = useMemo(() => ({
    total: ACHIEVEMENT_DEFINITIONS.length,
    unlocked: unlockedAchievements.length,
    percentage: (unlockedAchievements.length / ACHIEVEMENT_DEFINITIONS.length) * 100,
  }), [unlockedAchievements.length]);

  return {
    achievements: allAchievements,
    achievementsByCategory,
    unlockedAchievements,
    isUnlocked,
    getProgress,
    updateProgress,
    incrementProgress,
    checkQuizCompletion,
    checkQuizCreated,
    checkQuizShared,
    checkTemplateUsed,
    checkFavorited,
    checkFolderCreated,
    checkRetry,
    checkQuestionTypes,
    checkFastAnswer,
    stats,
  };
}
