import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Quiz, Question, QuizAttempt } from '../types/quiz';
import { shuffleArray } from '../types/quiz';
import { ThemeToggle } from './ThemeToggle';
import { Timer, CircularTimer } from './Timer';

interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  onExitDemoMode?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onComplete?: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  previousAttempts?: QuizAttempt[];
}

interface Answer {
  questionId: string;
  selectedOptionIds?: string[];
  typedAnswer?: string;
  isCorrect?: boolean;
  hasSubmitted?: boolean;
  timeSpent: number;
}

type GameState = 'intro' | 'playing' | 'feedback' | 'results';

export function QuizPlayer({ quiz, onBack, onExitDemoMode, theme, onToggleTheme, onComplete, previousAttempts = [] }: QuizPlayerProps) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number | null>(null);
  const hasCompletedRef = useRef(false);

  // Prepare shuffled questions and options based on settings
  const preparedQuestions = useMemo(() => {
    let questions = [...quiz.questions];
    
    if (quiz.settings?.shuffleQuestions) {
      questions = shuffleArray(questions);
    }
    
    if (quiz.settings?.shuffleOptions) {
      questions = questions.map((q) => ({
        ...q,
        options: q.options ? shuffleArray(q.options) : undefined,
      }));
    }
    
    return questions;
  }, [quiz.questions, quiz.settings?.shuffleQuestions, quiz.settings?.shuffleOptions]);

  const currentQuestion = preparedQuestions[currentIndex];
  const totalQuestions = preparedQuestions.length;

  const currentScore = useMemo(() => answers.filter((a) => a.isCorrect).length, [answers]);

  // Best previous score
  const bestPreviousScore = useMemo(() => {
    if (previousAttempts.length === 0) return null;
    return Math.max(...previousAttempts.map((a) => a.percentage));
  }, [previousAttempts]);

  const results = useMemo(() => {
    if (gameState !== 'results') return null;
    const correct = answers.filter((a) => a.isCorrect).length;
    const questionResults = preparedQuestions.map((question) => {
      const answer = answers.find((a) => a.questionId === question.id);
      return { question, answer, isCorrect: answer?.isCorrect ?? false };
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
      maxStreak,
      questionResults,
      totalTimeSpent,
      isNewBest: bestPreviousScore === null || Math.round((correct / totalQuestions) * 100) > bestPreviousScore,
    };
  }, [gameState, preparedQuestions, answers, totalQuestions, maxStreak, totalTimeSpent, bestPreviousScore]);

  // Call onComplete when results are ready
  useEffect(() => {
    if (gameState === 'results' && results && onComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete({
        quizId: quiz.id,
        score: results.correct,
        totalQuestions: results.total,
        percentage: results.percentage,
        maxStreak: results.maxStreak,
        timeSpent: results.totalTimeSpent,
        timeRemaining: totalTimeRemaining ?? undefined,
        answers: answers.map((a) => ({
          questionId: a.questionId,
          isCorrect: a.isCorrect ?? false,
          timeSpent: a.timeSpent,
        })),
      });
    }
  }, [gameState, results, onComplete, quiz.id, answers, totalTimeRemaining]);

  const getCurrentAnswer = useCallback(
    () => answers.find((a) => a.questionId === currentQuestion?.id),
    [answers, currentQuestion?.id]
  );

  const checkAnswer = useCallback((question: Question, answer: Answer): boolean => {
    if (question.type === 'multiple-choice' || question.type === 'multi-select') {
      const correctIds = question.options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) ?? [];
      const selectedIds = answer?.selectedOptionIds ?? [];
      return correctIds.length === selectedIds.length && correctIds.every((id) => selectedIds.includes(id));
    } else if (question.type === 'type-in') {
      const expectedAnswer = (question.expectedAnswer?.toLowerCase().trim() ?? '');
      const typedAnswer = (answer?.typedAnswer?.toLowerCase().trim() ?? '');
      // Check if the typed answer contains the expected answer (not case sensitive)
      return typedAnswer.includes(expectedAnswer) && expectedAnswer.length > 0;
    }
    return false;
  }, []);

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion || gameState === 'feedback') return;
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) => (a.questionId === currentQuestion.id ? { ...a, selectedOptionIds: [optionId] } : a));
      }
      return [...prev, { questionId: currentQuestion.id, selectedOptionIds: [optionId], timeSpent: 0 }];
    });
  };

  const handleMultiOptionToggle = (optionId: string) => {
    if (!currentQuestion || gameState === 'feedback') return;
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      const selectedIds = existing?.selectedOptionIds ?? [];
      const newSelectedIds = selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId];
      if (existing) {
        return prev.map((a) => (a.questionId === currentQuestion.id ? { ...a, selectedOptionIds: newSelectedIds } : a));
      }
      return [...prev, { questionId: currentQuestion.id, selectedOptionIds: newSelectedIds, timeSpent: 0 }];
    });
  };

  const handleTypedAnswer = (value: string) => {
    if (!currentQuestion || gameState === 'feedback') return;
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) => (a.questionId === currentQuestion.id ? { ...a, typedAnswer: value } : a));
      }
      return [...prev, { questionId: currentQuestion.id, typedAnswer: value, timeSpent: 0 }];
    });
  };

  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = checkAnswer(currentQuestion, currentAnswer);
    
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === currentQuestion.id ? { ...a, isCorrect, hasSubmitted: true, timeSpent } : a))
    );
    setTotalTimeSpent((prev) => prev + timeSpent);

    if (isCorrect) {
      setStreak((prev) => {
        const newStreak = prev + 1;
        setMaxStreak((max) => Math.max(max, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    setShowHint(false);
    setGameState('feedback');
  }, [currentQuestion, getCurrentAnswer, checkAnswer, questionStartTime]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setGameState('playing');
      setShowHint(false);
      setQuestionStartTime(Date.now());
    } else {
      setGameState('results');
    }
  }, [currentIndex, totalQuestions]);

  const handleStartQuiz = () => {
    setGameState('playing');
    setQuestionStartTime(Date.now());
    hasCompletedRef.current = false;
    if (quiz.settings?.totalTimeLimit) {
      setTotalTimeRemaining(quiz.settings.totalTimeLimit);
    }
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalTimeSpent(0);
    setShowHint(false);
    setGameState('intro');
    hasCompletedRef.current = false;
  };

  // Handle time up for question timer
  const handleQuestionTimeUp = useCallback(() => {
    if (gameState === 'playing') {
      // Auto-submit with current answer (or no answer)
      const currentAnswer = getCurrentAnswer();
      const timeSpent = quiz.settings?.timePerQuestion || 0;
      
      if (currentAnswer) {
        const isCorrect = checkAnswer(currentQuestion, currentAnswer);
        setAnswers((prev) =>
          prev.map((a) => (a.questionId === currentQuestion.id ? { ...a, isCorrect, hasSubmitted: true, timeSpent } : a))
        );
        if (isCorrect) {
          setStreak((prev) => {
            const newStreak = prev + 1;
            setMaxStreak((max) => Math.max(max, newStreak));
            return newStreak;
          });
        } else {
          setStreak(0);
        }
      } else {
        // No answer provided
        setAnswers((prev) => [
          ...prev,
          { questionId: currentQuestion.id, isCorrect: false, hasSubmitted: true, timeSpent },
        ]);
        setStreak(0);
      }
      setTotalTimeSpent((prev) => prev + timeSpent);
      setGameState('feedback');
    }
  }, [gameState, getCurrentAnswer, checkAnswer, currentQuestion, quiz.settings?.timePerQuestion]);

  // Handle total time up
  const handleTotalTimeUp = useCallback(() => {
    // End quiz immediately
    setGameState('results');
  }, []);

  const currentAnswer = getCurrentAnswer();
  const hasAnswered =
    currentQuestion?.type === 'multiple-choice' || currentQuestion?.type === 'multi-select'
      ? (currentAnswer?.selectedOptionIds?.length ?? 0) > 0
      : (currentAnswer?.typedAnswer?.trim().length ?? 0) > 0;

  // Get timer duration for current question
  const questionTimerDuration = useMemo(() => {
    if (currentQuestion?.timeLimit) return currentQuestion.timeLimit;
    if (quiz.settings?.timerEnabled && quiz.settings?.timePerQuestion) {
      return quiz.settings.timePerQuestion;
    }
    return null;
  }, [currentQuestion?.timeLimit, quiz.settings?.timerEnabled, quiz.settings?.timePerQuestion]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'intro') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartQuiz();
        }
        return;
      }

      if (gameState === 'playing' && currentQuestion) {
        // Number keys for option selection (1-9)
        if (currentQuestion.type === 'multiple-choice' && currentQuestion.options) {
          const num = parseInt(e.key);
          if (num >= 1 && num <= currentQuestion.options.length) {
            handleOptionSelect(currentQuestion.options[num - 1].id);
          }
        }
        // Enter to submit
        if (e.key === 'Enter' && hasAnswered) {
          e.preventDefault();
          handleSubmitAnswer();
        }
        // H for hint
        if (e.key === 'h' && quiz.settings?.showHints && currentQuestion.hint) {
          setShowHint((prev) => !prev);
        }
      }

      if (gameState === 'feedback') {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentQuestion, hasAnswered, handleSubmitAnswer, handleNext, quiz.settings?.showHints]);

  // Question dots component
  const QuestionDots = () => (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {preparedQuestions.map((q, idx) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const isCurrent = idx === currentIndex;
        const isAnswered = answer?.hasSubmitted;
        const isCorrect = answer?.isCorrect;

        let dotClass = 'bg-bg-tertiary';
        if (isAnswered) {
          dotClass = isCorrect ? 'bg-success' : 'bg-error';
        } else if (isCurrent) {
          dotClass = 'bg-accent';
        }

        return (
          <div
            key={q.id}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${dotClass} ${
              isCurrent ? 'scale-125' : ''
            }`}
          />
        );
      })}
    </div>
  );

  // Intro Screen
  if (gameState === 'intro') {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-6 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 0%, var(--color-accent-muted) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 80% 100%, var(--color-accent-muted) 0%, transparent 50%),
            var(--color-bg-primary)
          `,
        }}
      >
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-2xl animate-orb-1" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
        </div>

        <div className="fixed top-4 right-4 z-50 opacity-0 animate-fade-in stagger-1">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="max-w-lg w-full text-center relative z-10">
          {quiz.coverImage ? (
            <div className="relative w-28 h-28 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl opacity-0 animate-fade-in-scale stagger-1 animate-float-subtle">
              <img src={quiz.coverImage} alt={quiz.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-28 h-28 mx-auto mb-6 rounded-2xl bg-bg-secondary border border-border flex items-center justify-center opacity-0 animate-fade-in-scale stagger-1 animate-float-subtle">
              <span className="text-4xl text-accent font-serif">Q</span>
            </div>
          )}

          <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-2 opacity-0 animate-fade-in-up stagger-2">{quiz.title}</h1>
          {quiz.description && <p className="text-text-secondary mb-6 opacity-0 animate-fade-in-up stagger-3">{quiz.description}</p>}

          <div className="flex items-center justify-center gap-4 mb-8 text-sm text-text-muted opacity-0 animate-fade-in-up stagger-3 flex-wrap">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {totalQuestions} questions
            </span>
            {quiz.settings?.timerEnabled && (
              <span className="flex items-center gap-1.5 text-warning">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timed
              </span>
            )}
            {quiz.settings?.shuffleQuestions && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Shuffled
              </span>
            )}
          </div>

          {/* Previous attempts info */}
          {previousAttempts.length > 0 && (
            <div className="mb-6 p-4 bg-bg-secondary/50 border border-border rounded-xl opacity-0 animate-fade-in-up stagger-3">
              <p className="text-sm text-text-secondary">
                You've played this quiz <span className="text-accent font-medium">{previousAttempts.length}</span> time{previousAttempts.length !== 1 ? 's' : ''}.
                Best score: <span className="text-accent font-medium">{bestPreviousScore}%</span>
              </p>
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            className="btn-shimmer w-full py-4 bg-accent text-bg-primary rounded-xl font-medium text-lg hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-3 opacity-0 animate-fade-in-up stagger-4"
          >
            {previousAttempts.length > 0 ? 'Play Again' : 'Start Quiz'}
          </button>
          <button
            onClick={onExitDemoMode || onBack}
            className="w-full py-3.5 text-text-secondary hover:text-text-primary transition-colors opacity-0 animate-fade-in stagger-5 min-h-[44px] rounded-lg hover:bg-bg-secondary/50"
          >
            Back to Dashboard
          </button>
          <p className="mt-4 text-xs text-text-muted opacity-0 animate-fade-in stagger-5">Press Enter or Space to start</p>
        </div>
      </div>
    );
  }

  // Results Screen
  if (gameState === 'results' && results) {
    const getEmoji = () => {
      if (results.percentage === 100) return '🏆';
      if (results.percentage >= 80) return '🎉';
      if (results.percentage >= 60) return '👍';
      if (results.percentage >= 40) return '📚';
      return '💪';
    };

    const getMessage = () => {
      if (results.percentage === 100) return 'Perfect Score!';
      if (results.percentage >= 80) return 'Excellent Work!';
      if (results.percentage >= 60) return 'Good Job!';
      if (results.percentage >= 40) return 'Keep Practicing!';
      return 'Room to Grow!';
    };

    return (
      <div
        className="min-h-screen py-12 px-6 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 0%, var(--color-accent-muted) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 80% 100%, var(--color-accent-muted) 0%, transparent 50%),
            var(--color-bg-primary)
          `,
        }}
      >
        {/* Celebration orbs for good scores */}
        {results.percentage >= 60 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-success/10 rounded-full blur-2xl animate-orb-1" />
            <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
          </div>
        )}

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4 opacity-0 animate-feature-pop stagger-1">
              <span className="text-4xl">{getEmoji()}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-1 opacity-0 animate-fade-in-up stagger-2">{getMessage()}</h1>
            <p className="text-text-secondary text-sm opacity-0 animate-fade-in stagger-3">{quiz.title}</p>
            
            {/* New best badge */}
            {results.isNewBest && previousAttempts.length > 0 && (
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-success/20 text-success rounded-full text-sm font-medium opacity-0 animate-fade-in-up stagger-3">
                <span>🎉</span> New Personal Best!
              </div>
            )}
          </div>

          <div className="bg-bg-secondary border border-border rounded-2xl p-6 mb-6 text-center opacity-0 animate-card-entrance stagger-3">
            <p className="text-6xl font-bold text-accent mb-1 animate-count-up">{results.percentage}%</p>
            <p className="text-text-secondary">
              <span className="text-text-primary font-semibold">{results.correct}</span> of{' '}
              <span className="text-text-primary font-semibold">{results.total}</span> correct
            </p>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border text-sm">
              <div className="text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <p className="text-xl font-bold text-accent">{results.maxStreak}</p>
                <p className="text-text-muted">Best Streak 🔥</p>
              </div>
              <div className="text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <p className="text-xl font-bold text-success">{results.correct}</p>
                <p className="text-text-muted">Correct ✓</p>
              </div>
              <div className="text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <p className="text-xl font-bold text-error">{results.total - results.correct}</p>
                <p className="text-text-muted">Wrong ✗</p>
              </div>
            </div>
            
            {/* Time spent */}
            {results.totalTimeSpent > 0 && (
              <div className="mt-4 pt-4 border-t border-border opacity-0 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <p className="text-sm text-text-muted">
                  Completed in <span className="text-accent font-medium">{Math.floor(results.totalTimeSpent / 60)}:{(results.totalTimeSpent % 60).toString().padStart(2, '0')}</span>
                </p>
              </div>
            )}
          </div>

          <QuestionDots />

          <div className="space-y-3 mb-6 mt-4">
            <h2 className="font-serif text-lg text-text-primary opacity-0 animate-fade-in-up stagger-4">Review</h2>
            {results.questionResults.map((result, index) => (
              <div
                key={result.question.id}
                className={`bg-bg-secondary border rounded-xl p-3 opacity-0 animate-fade-in-up hover:-translate-y-0.5 transition-all duration-300 ${result.isCorrect ? 'border-success/30' : 'border-error/30'}`}
                style={{ animationDelay: `${0.5 + index * 0.05}s` }}
              >
                <div className="flex items-start gap-2">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${result.isCorrect ? 'bg-success' : 'bg-error'}`}>
                    {result.isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted">Q{index + 1}</p>
                    <p className="text-text-primary text-sm">{result.question.text}</p>
                    {/* Show explanation if available */}
                    {quiz.settings?.showExplanations && result.question.explanation && (
                      <p className="text-xs text-text-muted mt-1 italic">{result.question.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center opacity-0 animate-fade-in-up stagger-5">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-300"
            >
              Play Again
            </button>
            <button
              onClick={onExitDemoMode || onBack}
              className="btn-shimmer px-5 py-2.5 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:translate-y-0 transition-all duration-300"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `
          radial-gradient(ellipse 100% 70% at 50% 0%, var(--color-accent-muted) 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 80% 100%, var(--color-accent-muted) 0%, transparent 50%),
          var(--color-bg-primary)
        `,
      }}
    >
      <header className="sticky top-0 z-20 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        <div className="hidden md:block fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={onExitDemoMode || onBack} className="flex items-center gap-2 px-3 py-2.5 text-text-secondary hover:text-text-primary transition-all duration-300 group rounded-lg hover:bg-bg-secondary min-h-[44px]">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Exit</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Question Timer */}
              {questionTimerDuration && gameState === 'playing' && (
                <Timer
                  key={currentIndex}
                  initialTime={questionTimerDuration}
                  onTimeUp={handleQuestionTimeUp}
                  isPaused={gameState !== 'playing'}
                  size="sm"
                />
              )}
              
              {/* Total Timer */}
              {quiz.settings?.totalTimeLimit && (
                <CircularTimer
                  initialTime={quiz.settings.totalTimeLimit}
                  onTimeUp={handleTotalTimeUp}
                  isPaused={gameState !== 'playing'}
                  radius={20}
                />
              )}
              
              {streak > 0 && (
                <div className="flex items-center gap-1 text-orange-400 text-sm">
                  <span>🔥</span>
                  <span className="font-bold">{streak}</span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-accent font-bold">{currentScore}</span>
                <span className="text-text-muted">/{totalQuestions}</span>
              </div>
              <div className="md:hidden">
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              </div>
            </div>
          </div>

          <QuestionDots />
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-6 py-6">
        <div className="flex-1" key={currentIndex}>
          <div className="flex items-center gap-2 mb-3 animate-fade-in">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-sm">
              {currentIndex + 1}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              currentQuestion.type === 'multiple-choice' ? 'bg-accent/20 text-accent'
                : currentQuestion.type === 'multi-select' ? 'bg-purple-500/20 text-purple-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {currentQuestion.type === 'multiple-choice' ? 'Single Choice' : currentQuestion.type === 'multi-select' ? 'Select All' : 'Type Answer'}
            </span>
          </div>

          <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-5 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.05s' }}>{currentQuestion.text}</h2>

          {currentQuestion.image && (
            <div className="mb-5">
              <img src={currentQuestion.image} alt="Question" className="max-w-full max-h-48 rounded-xl shadow-lg" />
            </div>
          )}

          {/* Hint button and display */}
          {quiz.settings?.showHints && currentQuestion.hint && gameState === 'playing' && (
            <div className="mb-4">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {showHint ? 'Hide Hint' : 'Show Hint'} (H)
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-accent/10 border border-accent/30 rounded-lg text-sm text-accent animate-fade-in">
                  💡 {currentQuestion.hint}
                </div>
              )}
            </div>
          )}

          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentAnswer?.selectedOptionIds?.includes(option.id);
                const showFeedback = gameState === 'feedback';
                const isCorrect = option.isCorrect;

                let btnClass = 'border-border bg-bg-secondary text-text-secondary hover:border-accent/50';
                if (isSelected && !showFeedback) btnClass = 'border-accent bg-accent/10 text-text-primary ring-2 ring-accent/30';
                else if (showFeedback && isCorrect) btnClass = 'border-success bg-success/20 text-success';
                else if (showFeedback && isSelected) btnClass = 'border-error bg-error/20 text-error';
                else if (showFeedback) btnClass = 'border-border/50 bg-bg-secondary/50 text-text-muted';

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={showFeedback}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 opacity-0 animate-fade-in-up ${btnClass}`}
                    style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bg-tertiary text-text-muted text-xs flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <span>{option.text}</span>
                      {showFeedback && isCorrect && <span className="ml-auto text-success">✓</span>}
                      {showFeedback && isSelected && !isCorrect && <span className="ml-auto text-error">✗</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'multi-select' && currentQuestion.options && (
            <div className="space-y-2">
              <p className="text-xs text-text-muted mb-2 animate-fade-in">Select all that apply</p>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentAnswer?.selectedOptionIds?.includes(option.id);
                const showFeedback = gameState === 'feedback';
                const isCorrect = option.isCorrect;

                let btnClass = 'border-border bg-bg-secondary text-text-secondary hover:border-purple-400/50';
                if (isSelected && !showFeedback) btnClass = 'border-purple-400 bg-purple-400/10 text-text-primary ring-2 ring-purple-400/30';
                else if (showFeedback && isCorrect && isSelected) btnClass = 'border-success bg-success/20 text-success';
                else if (showFeedback && isCorrect) btnClass = 'border-success/50 bg-success/10 text-success';
                else if (showFeedback && isSelected) btnClass = 'border-error bg-error/20 text-error';
                else if (showFeedback) btnClass = 'border-border/50 bg-bg-secondary/50 text-text-muted';

                return (
                  <button
                    key={option.id}
                    onClick={() => handleMultiOptionToggle(option.id)}
                    disabled={showFeedback}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 opacity-0 animate-fade-in-up ${btnClass}`}
                    style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-purple-400 border-purple-400' : 'border-current opacity-50'}`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span>{option.text}</span>
                      {showFeedback && isCorrect && <span className="ml-auto text-success text-sm">✓</span>}
                      {showFeedback && isSelected && !isCorrect && <span className="ml-auto text-error text-sm">✗</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'type-in' && (
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <input
                type="text"
                value={currentAnswer?.typedAnswer ?? ''}
                onChange={(e) => handleTypedAnswer(e.target.value)}
                disabled={gameState === 'feedback'}
                placeholder="Type your answer..."
                className={`w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none transition-all duration-300 ${
                  gameState === 'feedback'
                    ? currentAnswer?.isCorrect ? 'border-success bg-success/10' : 'border-error bg-error/10'
                    : 'focus:border-accent focus:ring-2 focus:ring-accent/20'
                }`}
                autoFocus
              />
              {gameState === 'feedback' && !currentAnswer?.isCorrect && (
                <p className="mt-2 text-sm text-error animate-fade-in">
                  Correct answer: <strong className="text-text-primary">{currentQuestion.expectedAnswer}</strong>
                </p>
              )}
            </div>
          )}

          {gameState === 'feedback' && (
            <div className={`mt-4 px-4 py-3 rounded-xl text-sm animate-pop-in ${currentAnswer?.isCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
              {currentAnswer?.isCorrect ? (
                <span className="font-medium">Correct! {streak > 1 && <span className="animate-fire inline-block">🔥 {streak} streak!</span>}</span>
              ) : (
                <span className="font-medium">Not quite.</span>
              )}
            </div>
          )}
          
          {/* Show explanation in feedback */}
          {gameState === 'feedback' && quiz.settings?.showExplanations && currentQuestion.explanation && (
            <div className="mt-3 px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-sm text-text-secondary animate-fade-in">
              <p className="font-medium text-text-primary mb-1">💡 Explanation</p>
              {currentQuestion.explanation}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50">
          {gameState === 'playing' ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!hasAnswered}
              className={`btn-shimmer w-full py-3.5 rounded-xl font-medium transition-all duration-300 ${
                hasAnswered ? 'bg-accent text-bg-primary hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0' : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-shimmer w-full py-3.5 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {currentIndex === totalQuestions - 1 ? 'See Results' : 'Next'}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <p className="text-center text-xs text-text-muted mt-2">
            {gameState === 'playing' ? 'Press Enter to submit' : 'Press Enter or → for next'}
          </p>
        </div>
      </main>
    </div>
  );
}
