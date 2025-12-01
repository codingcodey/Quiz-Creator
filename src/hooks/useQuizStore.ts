import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Quiz } from '../types/quiz';

const STORAGE_KEY = 'quiz-creator-quizzes';

export function useQuizStore() {
  const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>(STORAGE_KEY, []);

  const sortedQuizzes = useMemo(
    () => [...quizzes].sort((a, b) => b.updatedAt - a.updatedAt),
    [quizzes]
  );

  const getQuiz = useCallback(
    (id: string) => quizzes.find((q) => q.id === id),
    [quizzes]
  );

  const saveQuiz = useCallback(
    (quiz: Quiz) => {
      setQuizzes((prev) => {
        const idx = prev.findIndex((q) => q.id === quiz.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = quiz;
          return updated;
        }
        return [...prev, quiz];
      });
    },
    [setQuizzes]
  );

  const deleteQuiz = useCallback(
    (id: string) => setQuizzes((prev) => prev.filter((q) => q.id !== id)),
    [setQuizzes]
  );

  const exportQuiz = useCallback(
    (quizId: string) => {
      const quiz = quizzes.find((q) => q.id === quizId);
      if (!quiz) return;
      downloadQuiz(quiz);
    },
    [quizzes]
  );

  const exportQuizData = useCallback((quiz: Quiz) => downloadQuiz(quiz), []);

  return {
    quizzes: sortedQuizzes,
    getQuiz,
    saveQuiz,
    deleteQuiz,
    exportQuiz,
    exportQuizData,
  };
}

function downloadQuiz(quiz: Quiz) {
  const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${quiz.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
