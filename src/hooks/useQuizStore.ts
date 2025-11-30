import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Quiz, Question, QuizOption } from '../types/quiz';
import { createQuiz, createQuestion, createOption, isValidQuiz } from '../types/quiz';

const STORAGE_KEY = 'quiz-creator-quizzes';

export function useQuizStore() {
  const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>(STORAGE_KEY, []);

  // Get all quizzes sorted by update time (newest first)
  const sortedQuizzes = useMemo(() => {
    return [...quizzes].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [quizzes]);

  // Get a single quiz by ID
  const getQuiz = useCallback(
    (id: string) => quizzes.find((q) => q.id === id),
    [quizzes]
  );

  // Create a new quiz
  const addQuiz = useCallback((initialData?: Partial<Quiz>) => {
    const newQuiz = createQuiz(initialData);
    setQuizzes((prev) => [...prev, newQuiz]);
    return newQuiz;
  }, [setQuizzes]);

  // Update an existing quiz
  const updateQuiz = useCallback(
    (id: string, updates: Partial<Quiz>) => {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === id
            ? { ...quiz, ...updates, updatedAt: Date.now() }
            : quiz
        )
      );
    },
    [setQuizzes]
  );

  // Delete a quiz
  const deleteQuiz = useCallback(
    (id: string) => {
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    },
    [setQuizzes]
  );

  // Add a question to a quiz
  const addQuestion = useCallback(
    (quizId: string, type: Question['type']) => {
      const newQuestion = createQuestion(type);
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? {
                ...quiz,
                questions: [...quiz.questions, newQuestion],
                updatedAt: Date.now(),
              }
            : quiz
        )
      );
      return newQuestion;
    },
    [setQuizzes]
  );

  // Update a question in a quiz
  const updateQuestion = useCallback(
    (quizId: string, questionId: string, updates: Partial<Question>) => {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? {
                ...quiz,
                questions: quiz.questions.map((q) =>
                  q.id === questionId ? { ...q, ...updates } : q
                ),
                updatedAt: Date.now(),
              }
            : quiz
        )
      );
    },
    [setQuizzes]
  );

  // Delete a question from a quiz
  const deleteQuestion = useCallback(
    (quizId: string, questionId: string) => {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? {
                ...quiz,
                questions: quiz.questions.filter((q) => q.id !== questionId),
                updatedAt: Date.now(),
              }
            : quiz
        )
      );
    },
    [setQuizzes]
  );

  // Reorder questions in a quiz
  const reorderQuestions = useCallback(
    (quizId: string, fromIndex: number, toIndex: number) => {
      setQuizzes((prev) =>
        prev.map((quiz) => {
          if (quiz.id !== quizId) return quiz;
          const newQuestions = [...quiz.questions];
          const [removed] = newQuestions.splice(fromIndex, 1);
          newQuestions.splice(toIndex, 0, removed);
          return { ...quiz, questions: newQuestions, updatedAt: Date.now() };
        })
      );
    },
    [setQuizzes]
  );

  // Add an option to a multiple-choice question
  const addOption = useCallback(
    (quizId: string, questionId: string) => {
      const newOption = createOption();
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? {
                ...quiz,
                questions: quiz.questions.map((q) =>
                  q.id === questionId && q.options
                    ? { ...q, options: [...q.options, newOption] }
                    : q
                ),
                updatedAt: Date.now(),
              }
            : quiz
        )
      );
      return newOption;
    },
    [setQuizzes]
  );

  // Update an option in a multiple-choice question
  const updateOption = useCallback(
    (
      quizId: string,
      questionId: string,
      optionId: string,
      updates: Partial<QuizOption>
    ) => {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? {
                ...quiz,
                questions: quiz.questions.map((q) =>
                  q.id === questionId && q.options
                    ? {
                        ...q,
                        options: q.options.map((opt) =>
                          opt.id === optionId ? { ...opt, ...updates } : opt
                        ),
                      }
                    : q
                ),
                updatedAt: Date.now(),
              }
            : quiz
        )
      );
    },
    [setQuizzes]
  );

  // Delete an option from a multiple-choice question
  const deleteOption = useCallback(
    (quizId: string, questionId: string, optionId: string) => {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? {
                ...quiz,
                questions: quiz.questions.map((q) =>
                  q.id === questionId && q.options
                    ? { ...q, options: q.options.filter((opt) => opt.id !== optionId) }
                    : q
                ),
                updatedAt: Date.now(),
              }
            : quiz
        )
      );
    },
    [setQuizzes]
  );

  // Save a complete quiz (replaces existing or adds new)
  const saveQuiz = useCallback((quiz: Quiz) => {
    setQuizzes((prev) => {
      const existingIndex = prev.findIndex((q) => q.id === quiz.id);
      if (existingIndex >= 0) {
        // Update existing quiz
        const updated = [...prev];
        updated[existingIndex] = quiz;
        return updated;
      } else {
        // Add new quiz
        return [...prev, quiz];
      }
    });
  }, [setQuizzes]);

  // Duplicate a quiz
  const duplicateQuiz = useCallback((quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return null;
    
    const duplicatedQuiz = createQuiz({
      ...quiz,
      id: crypto.randomUUID(),
      title: quiz.title,
      questions: quiz.questions.map((q) => ({
        ...q,
        id: crypto.randomUUID(),
        options: q.options?.map((opt) => ({
          ...opt,
          id: crypto.randomUUID(),
        })),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    setQuizzes((prev) => [...prev, duplicatedQuiz]);
    return duplicatedQuiz;
  }, [quizzes, setQuizzes]);

  // Export a quiz by ID
  const exportQuiz = useCallback((quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return null;
    
    const dataStr = JSON.stringify(quiz, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quiz.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [quizzes]);

  // Export a quiz object directly (for editor draft)
  const exportQuizData = useCallback((quiz: Quiz) => {
    const dataStr = JSON.stringify(quiz, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quiz.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Import a quiz from JSON (creates new quiz)
  const importQuiz = useCallback((jsonString: string) => {
    try {
      const quiz = JSON.parse(jsonString);
      
      // Validate the imported data is a valid quiz
      if (!isValidQuiz(quiz)) {
        console.error('Invalid quiz format');
        return null;
      }
      
      // Generate new IDs to avoid conflicts
      const newQuiz = createQuiz({
        ...quiz,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setQuizzes((prev) => [...prev, newQuiz]);
      return newQuiz;
    } catch (error) {
      console.error('Failed to import quiz:', error);
      return null;
    }
  }, [setQuizzes]);

  return {
    quizzes: sortedQuizzes,
    getQuiz,
    addQuiz,
    saveQuiz,
    updateQuiz,
    deleteQuiz,
    duplicateQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    addOption,
    updateOption,
    deleteOption,
    exportQuiz,
    exportQuizData,
    importQuiz,
  };
}
