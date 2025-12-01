import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Quiz, Question } from '../types/quiz';
import { ThemeToggle } from './ThemeToggle';

interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

interface Answer {
  questionId: string;
  selectedOptionIds?: string[];
  typedAnswer?: string;
  isCorrect?: boolean;
  hasSubmitted?: boolean;
}

type GameState = 'intro' | 'playing' | 'feedback' | 'results';

export function QuizPlayer({ quiz, onBack, theme, onToggleTheme }: QuizPlayerProps) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;

  const currentScore = useMemo(() => answers.filter((a) => a.isCorrect).length, [answers]);

  const results = useMemo(() => {
    if (gameState !== 'results') return null;
    const correct = answers.filter((a) => a.isCorrect).length;
    const questionResults = quiz.questions.map((question) => {
      const answer = answers.find((a) => a.questionId === question.id);
      return { question, answer, isCorrect: answer?.isCorrect ?? false };
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
      maxStreak,
      questionResults,
    };
  }, [gameState, quiz.questions, answers, totalQuestions, maxStreak]);

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
      return (question.expectedAnswer?.toLowerCase().trim() ?? '') === (answer?.typedAnswer?.toLowerCase().trim() ?? '');
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
      return [...prev, { questionId: currentQuestion.id, selectedOptionIds: [optionId] }];
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
      return [...prev, { questionId: currentQuestion.id, selectedOptionIds: newSelectedIds }];
    });
  };

  const handleTypedAnswer = (value: string) => {
    if (!currentQuestion || gameState === 'feedback') return;
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) => (a.questionId === currentQuestion.id ? { ...a, typedAnswer: value } : a));
      }
      return [...prev, { questionId: currentQuestion.id, typedAnswer: value }];
    });
  };

  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;

    const isCorrect = checkAnswer(currentQuestion, currentAnswer);
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === currentQuestion.id ? { ...a, isCorrect, hasSubmitted: true } : a))
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
    setGameState('feedback');
  }, [currentQuestion, getCurrentAnswer, checkAnswer]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setGameState('playing');
    } else {
      setGameState('results');
    }
  }, [currentIndex, totalQuestions]);

  const handleStartQuiz = () => setGameState('playing');

  const handleRestart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setStreak(0);
    setMaxStreak(0);
    setGameState('intro');
  };

  const currentAnswer = getCurrentAnswer();
  const hasAnswered =
    currentQuestion?.type === 'multiple-choice' || currentQuestion?.type === 'multi-select'
      ? (currentAnswer?.selectedOptionIds?.length ?? 0) > 0
      : (currentAnswer?.typedAnswer?.trim().length ?? 0) > 0;

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
  }, [gameState, currentQuestion, hasAnswered, handleSubmitAnswer, handleNext]);

  // Question dots component
  const QuestionDots = () => (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {quiz.questions.map((q, idx) => {
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
        className="min-h-screen flex items-center justify-center py-12 px-6"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 0%, var(--color-accent-muted) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 80% 100%, var(--color-accent-muted) 0%, transparent 50%),
            var(--color-bg-primary)
          `,
        }}
      >
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="max-w-lg w-full text-center animate-fade-in">
          {quiz.coverImage ? (
            <div className="relative w-28 h-28 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl">
              <img src={quiz.coverImage} alt={quiz.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-28 h-28 mx-auto mb-6 rounded-2xl bg-bg-secondary border border-border flex items-center justify-center">
              <span className="text-4xl text-accent font-serif">Q</span>
            </div>
          )}

          <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-text-secondary mb-6">{quiz.description}</p>}

          <div className="flex items-center justify-center gap-4 mb-8 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {totalQuestions} questions
            </span>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-4 bg-accent text-bg-primary rounded-xl font-medium text-lg hover:bg-accent-hover transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-3"
          >
            Start Quiz
          </button>
          <button onClick={onBack} className="w-full py-3 text-text-secondary hover:text-text-primary transition-colors text-sm">
            Back to Dashboard
          </button>
          <p className="mt-4 text-xs text-text-muted">Press Enter or Space to start</p>
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
        className="min-h-screen py-12 px-6"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 0%, var(--color-accent-muted) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 80% 100%, var(--color-accent-muted) 0%, transparent 50%),
            var(--color-bg-primary)
          `,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4 animate-bounce-slow">
              <span className="text-4xl">{getEmoji()}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-1">{getMessage()}</h1>
            <p className="text-text-secondary text-sm">{quiz.title}</p>
          </div>

          <div className="bg-bg-secondary border border-border rounded-2xl p-6 mb-6 text-center animate-fade-in-up">
            <p className="text-6xl font-bold text-accent mb-1">{results.percentage}%</p>
            <p className="text-text-secondary">
              <span className="text-text-primary font-semibold">{results.correct}</span> of{' '}
              <span className="text-text-primary font-semibold">{results.total}</span> correct
            </p>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border text-sm">
              <div className="text-center">
                <p className="text-xl font-bold text-accent">{results.maxStreak}</p>
                <p className="text-text-muted">Best Streak 🔥</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-success">{results.correct}</p>
                <p className="text-text-muted">Correct ✓</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-error">{results.total - results.correct}</p>
                <p className="text-text-muted">Wrong ✗</p>
              </div>
            </div>
          </div>

          <QuestionDots />

          <div className="space-y-3 mb-6 mt-4">
            <h2 className="font-serif text-lg text-text-primary">Review</h2>
            {results.questionResults.map((result, index) => (
              <div
                key={result.question.id}
                className={`bg-bg-secondary border-2 rounded-xl p-3 ${result.isCorrect ? 'border-success/30' : 'border-error/30'}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${result.isCorrect ? 'bg-success' : 'bg-error'}`}>
                    {result.isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted">Q{index + 1}</p>
                    <p className="text-text-primary text-sm">{result.question.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={handleRestart} className="px-5 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-accent/50 transition-all duration-300">
              Play Again
            </button>
            <button onClick={onBack} className="px-5 py-2.5 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover transition-all duration-300">
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
            <button onClick={onBack} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Exit
            </button>

            <div className="flex items-center gap-3">
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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
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

          <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-5 leading-relaxed">{currentQuestion.text}</h2>

          {currentQuestion.image && (
            <div className="mb-5">
              <img src={currentQuestion.image} alt="Question" className="max-w-full max-h-48 rounded-xl shadow-lg" />
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
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${btnClass}`}
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
              <p className="text-xs text-text-muted mb-2">Select all that apply</p>
              {currentQuestion.options.map((option) => {
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
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${btnClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-purple-400 border-purple-400' : 'border-current opacity-50'}`}>
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
            <div>
              <input
                type="text"
                value={currentAnswer?.typedAnswer ?? ''}
                onChange={(e) => handleTypedAnswer(e.target.value)}
                disabled={gameState === 'feedback'}
                placeholder="Type your answer..."
                className={`w-full px-4 py-3 bg-bg-secondary border-2 rounded-xl text-text-primary placeholder-text-muted focus:outline-none transition-all ${
                  gameState === 'feedback'
                    ? currentAnswer?.isCorrect ? 'border-success bg-success/10' : 'border-error bg-error/10'
                    : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/20'
                }`}
                autoFocus
              />
              {gameState === 'feedback' && !currentAnswer?.isCorrect && (
                <p className="mt-2 text-sm text-error">
                  Correct answer: <strong className="text-text-primary">{currentQuestion.expectedAnswer}</strong>
                </p>
              )}
            </div>
          )}

          {gameState === 'feedback' && (
            <div className={`mt-4 px-4 py-3 rounded-xl text-sm ${currentAnswer?.isCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
              {currentAnswer?.isCorrect ? (
                <span className="font-medium">Correct! {streak > 1 && `🔥 ${streak} streak!`}</span>
              ) : (
                <span className="font-medium">Not quite.</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50">
          {gameState === 'playing' ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!hasAnswered}
              className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 ${
                hasAnswered ? 'bg-accent text-bg-primary hover:bg-accent-hover' : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover transition-all duration-300 flex items-center justify-center gap-2"
            >
              {currentIndex === totalQuestions - 1 ? 'See Results' : 'Next'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
