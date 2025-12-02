import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { QuizAttempt, QuizAnalytics } from '../types/quiz';

const ATTEMPTS_KEY = 'quiz-creator-attempts';

export function useQuizAttempts() {
  const [attempts, setAttempts] = useLocalStorage<QuizAttempt[]>(ATTEMPTS_KEY, []);

  const saveAttempt = useCallback(
    (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
      const newAttempt: QuizAttempt = {
        ...attempt,
        id: crypto.randomUUID(),
        completedAt: Date.now(),
      };
      setAttempts((prev) => [newAttempt, ...prev]);
      return newAttempt;
    },
    [setAttempts]
  );

  const getAttemptsForQuiz = useCallback(
    (quizId: string) => attempts.filter((a) => a.quizId === quizId),
    [attempts]
  );

  const getAnalyticsForQuiz = useCallback(
    (quizId: string): QuizAnalytics | null => {
      const quizAttempts = attempts.filter((a) => a.quizId === quizId);
      if (quizAttempts.length === 0) return null;

      // Aggregate question stats
      const questionStatsMap = new Map<string, { correct: number; total: number; totalTime: number }>();
      
      quizAttempts.forEach((attempt) => {
        attempt.answers.forEach((answer) => {
          const existing = questionStatsMap.get(answer.questionId) || { correct: 0, total: 0, totalTime: 0 };
          questionStatsMap.set(answer.questionId, {
            correct: existing.correct + (answer.isCorrect ? 1 : 0),
            total: existing.total + 1,
            totalTime: existing.totalTime + answer.timeSpent,
          });
        });
      });

      const questionStats = Array.from(questionStatsMap.entries()).map(([questionId, stats]) => ({
        questionId,
        timesAnswered: stats.total,
        timesCorrect: stats.correct,
        averageTime: stats.total > 0 ? stats.totalTime / stats.total : 0,
      }));

      return {
        quizId,
        totalAttempts: quizAttempts.length,
        averageScore: quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length,
        bestScore: Math.max(...quizAttempts.map((a) => a.percentage)),
        averageTime: quizAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / quizAttempts.length,
        questionStats,
      };
    },
    [attempts]
  );

  const getRecentAttempts = useCallback(
    (limit = 10) => attempts.slice(0, limit),
    [attempts]
  );

  const getProgressOverTime = useCallback(
    (quizId: string) => {
      const quizAttempts = attempts
        .filter((a) => a.quizId === quizId)
        .sort((a, b) => a.completedAt - b.completedAt);
      
      return quizAttempts.map((attempt, index) => ({
        attemptNumber: index + 1,
        score: attempt.percentage,
        date: attempt.completedAt,
        improvement: index > 0 ? attempt.percentage - quizAttempts[index - 1].percentage : 0,
      }));
    },
    [attempts]
  );

  const clearAttemptsForQuiz = useCallback(
    (quizId: string) => {
      setAttempts((prev) => prev.filter((a) => a.quizId !== quizId));
    },
    [setAttempts]
  );

  const totalStats = useMemo(() => {
    if (attempts.length === 0) return null;
    
    const uniqueQuizzes = new Set(attempts.map((a) => a.quizId)).size;
    const totalScore = attempts.reduce((sum, a) => sum + a.percentage, 0);
    const bestStreak = Math.max(...attempts.map((a) => a.maxStreak), 0);
    
    return {
      totalAttempts: attempts.length,
      uniqueQuizzes,
      averageScore: totalScore / attempts.length,
      bestStreak,
      totalTimeSpent: attempts.reduce((sum, a) => sum + a.timeSpent, 0),
    };
  }, [attempts]);

  return {
    attempts,
    saveAttempt,
    getAttemptsForQuiz,
    getAnalyticsForQuiz,
    getRecentAttempts,
    getProgressOverTime,
    clearAttemptsForQuiz,
    totalStats,
  };
}

