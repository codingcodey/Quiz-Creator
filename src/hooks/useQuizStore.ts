import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Quiz, QuizSettings } from '../types/quiz';
import { generateShareId, DEFAULT_SETTINGS } from '../types/quiz';

const STORAGE_KEY = 'quiz-creator-quizzes';

export function useQuizStore() {
  const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>(STORAGE_KEY, []);

  // Migrate old quizzes to include settings if missing
  const migratedQuizzes = useMemo(() => {
    return quizzes.map((quiz) => ({
      ...quiz,
      settings: quiz.settings || { ...DEFAULT_SETTINGS },
      tags: quiz.tags || [],
      isFavorite: quiz.isFavorite || false,
      playCount: quiz.playCount || 0,
    }));
  }, [quizzes]);

  const sortedQuizzes = useMemo(
    () => [...migratedQuizzes].sort((a, b) => b.updatedAt - a.updatedAt),
    [migratedQuizzes]
  );

  const getQuiz = useCallback(
    (id: string) => migratedQuizzes.find((q) => q.id === id),
    [migratedQuizzes]
  );

  const getQuizByShareId = useCallback(
    (shareId: string) => migratedQuizzes.find((q) => q.settings?.shareId === shareId),
    [migratedQuizzes]
  );

  const saveQuiz = useCallback(
    (quiz: Quiz) => {
      const quizWithSettings = {
        ...quiz,
        settings: quiz.settings || { ...DEFAULT_SETTINGS },
      };
      setQuizzes((prev) => {
        const idx = prev.findIndex((q) => q.id === quiz.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = quizWithSettings;
          return updated;
        }
        return [...prev, quizWithSettings];
      });
    },
    [setQuizzes]
  );

  const deleteQuiz = useCallback(
    (id: string) => setQuizzes((prev) => prev.filter((q) => q.id !== id)),
    [setQuizzes]
  );

  const updateQuiz = useCallback(
    (id: string, updates: Partial<Quiz>) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, ...updates, updatedAt: Date.now() } : q
        )
      );
    },
    [setQuizzes]
  );

  const updateQuizSettings = useCallback(
    (id: string, settings: Partial<QuizSettings>) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, settings: { ...q.settings, ...settings }, updatedAt: Date.now() }
            : q
        )
      );
    },
    [setQuizzes]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
        )
      );
    },
    [setQuizzes]
  );

  const setQuizFolder = useCallback(
    (quizId: string, folderId: string | undefined) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId ? { ...q, folderId } : q
        )
      );
    },
    [setQuizzes]
  );

  const addQuizTag = useCallback(
    (quizId: string, tag: string) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId && !q.tags?.includes(tag)
            ? { ...q, tags: [...(q.tags || []), tag] }
            : q
        )
      );
    },
    [setQuizzes]
  );

  const removeQuizTag = useCallback(
    (quizId: string, tag: string) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId
            ? { ...q, tags: (q.tags || []).filter((t) => t !== tag) }
            : q
        )
      );
    },
    [setQuizzes]
  );

  const enableSharing = useCallback(
    (quizId: string) => {
      const shareId = generateShareId();
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId
            ? { ...q, settings: { ...q.settings, isPublic: true, shareId } }
            : q
        )
      );
      return shareId;
    },
    [setQuizzes]
  );

  const disableSharing = useCallback(
    (quizId: string) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId
            ? { ...q, settings: { ...q.settings, isPublic: false, shareId: undefined } }
            : q
        )
      );
    },
    [setQuizzes]
  );

  const incrementPlayCount = useCallback(
    (quizId: string) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId ? { ...q, playCount: (q.playCount || 0) + 1 } : q
        )
      );
    },
    [setQuizzes]
  );

  const exportQuiz = useCallback(
    (quizId: string) => {
      const quiz = migratedQuizzes.find((q) => q.id === quizId);
      if (!quiz) return;
      downloadQuiz(quiz);
    },
    [migratedQuizzes]
  );

  const exportQuizData = useCallback((quiz: Quiz) => downloadQuiz(quiz), []);

  // Search and filter functions
  const searchQuizzes = useCallback(
    (query: string) => {
      const lower = query.toLowerCase();
      return sortedQuizzes.filter(
        (q) =>
          q.title.toLowerCase().includes(lower) ||
          q.description.toLowerCase().includes(lower) ||
          q.tags?.some((t) => t.toLowerCase().includes(lower))
      );
    },
    [sortedQuizzes]
  );

  const getQuizzesByFolder = useCallback(
    (folderId: string | null) => {
      if (folderId === null) {
        return sortedQuizzes.filter((q) => !q.folderId);
      }
      return sortedQuizzes.filter((q) => q.folderId === folderId);
    },
    [sortedQuizzes]
  );

  const getQuizzesByTag = useCallback(
    (tag: string) => sortedQuizzes.filter((q) => q.tags?.includes(tag)),
    [sortedQuizzes]
  );

  const getFavoriteQuizzes = useCallback(
    () => sortedQuizzes.filter((q) => q.isFavorite),
    [sortedQuizzes]
  );

  const getAllTags = useMemo(() => {
    const tagSet = new Set<string>();
    migratedQuizzes.forEach((q) => q.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [migratedQuizzes]);

  return {
    quizzes: sortedQuizzes,
    getQuiz,
    getQuizByShareId,
    saveQuiz,
    deleteQuiz,
    updateQuiz,
    updateQuizSettings,
    toggleFavorite,
    setQuizFolder,
    addQuizTag,
    removeQuizTag,
    enableSharing,
    disableSharing,
    incrementPlayCount,
    exportQuiz,
    exportQuizData,
    searchQuizzes,
    getQuizzesByFolder,
    getQuizzesByTag,
    getFavoriteQuizzes,
    getAllTags,
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
