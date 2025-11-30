import { useState, useMemo, useCallback } from 'react';
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
  const progress = ((currentIndex) / totalQuestions) * 100;

  // Calculate current score
  const currentScore = useMemo(() => {
    return answers.filter((a) => a.isCorrect).length;
  }, [answers]);

  // Calculate final results
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

  const getCurrentAnswer = useCallback(() => {
    return answers.find((a) => a.questionId === currentQuestion?.id);
  }, [answers, currentQuestion?.id]);

  const checkAnswer = useCallback((question: Question, answer: Answer): boolean => {
    if (question.type === 'multiple-choice') {
      const correctOptionIds = question.options
        ?.filter((opt) => opt.isCorrect)
        .map((opt) => opt.id) ?? [];
      const selectedIds = answer?.selectedOptionIds ?? [];
      return (
        correctOptionIds.length === selectedIds.length &&
        correctOptionIds.every((id) => selectedIds.includes(id))
      );
    } else if (question.type === 'multi-select') {
      const correctOptionIds = question.options
        ?.filter((opt) => opt.isCorrect)
        .map((opt) => opt.id) ?? [];
      const selectedIds = answer?.selectedOptionIds ?? [];
      return (
        correctOptionIds.length === selectedIds.length &&
        correctOptionIds.every((id) => selectedIds.includes(id)) &&
        selectedIds.every((id) => correctOptionIds.includes(id))
      );
    } else if (question.type === 'type-in') {
      const expected = question.expectedAnswer?.toLowerCase().trim() ?? '';
      const given = answer?.typedAnswer?.toLowerCase().trim() ?? '';
      return expected === given;
    }
    return false;
  }, []);

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion || gameState === 'feedback') return;

    // For single-select, we just set the one option
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) =>
          a.questionId === currentQuestion.id
            ? { ...a, selectedOptionIds: [optionId] }
            : a
        );
      }
      return [...prev, { questionId: currentQuestion.id, selectedOptionIds: [optionId] }];
    });
  };

  const handleMultiOptionToggle = (optionId: string) => {
    if (!currentQuestion || gameState === 'feedback') return;

    // For multi-select, toggle the option
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      const selectedIds = existing?.selectedOptionIds ?? [];
      
      const newSelectedIds = selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId];

      if (existing) {
        return prev.map((a) =>
          a.questionId === currentQuestion.id
            ? { ...a, selectedOptionIds: newSelectedIds }
            : a
        );
      }
      return [...prev, { questionId: currentQuestion.id, selectedOptionIds: newSelectedIds }];
    });
  };

  const handleTypedAnswer = (value: string) => {
    if (!currentQuestion || gameState === 'feedback') return;

    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) =>
          a.questionId === currentQuestion.id ? { ...a, typedAnswer: value } : a
        );
      }
      return [...prev, { questionId: currentQuestion.id, typedAnswer: value }];
    });
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;

    const isCorrect = checkAnswer(currentQuestion, currentAnswer);
    
    // Update answer with result
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === currentQuestion.id
          ? { ...a, isCorrect, hasSubmitted: true }
          : a
      )
    );

    // Update streak
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
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setGameState('playing');
    } else {
      setGameState('results');
    }
  };

  const handleStartQuiz = () => {
    setGameState('playing');
  };

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
        <div className="max-w-lg w-full text-center animate-fade-in">
          {/* Quiz cover */}
          {quiz.coverImage ? (
            <div className="relative w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={quiz.coverImage}
                alt={quiz.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-bg-secondary border border-border flex items-center justify-center">
              <span className="text-5xl text-accent font-serif">Q</span>
            </div>
          )}

          <h1 className="font-serif text-4xl md:text-5xl text-text-primary mb-3">
            {quiz.title}
          </h1>
          
          {quiz.description && (
            <p className="text-text-secondary text-lg mb-6">{quiz.description}</p>
          )}

          <div className="flex items-center justify-center gap-6 mb-8 text-text-muted">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{totalQuestions} question{totalQuestions !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleStartQuiz}
              className="w-full py-4 bg-accent text-bg-primary rounded-xl font-medium text-lg hover:bg-accent-hover transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Quiz
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 text-text-secondary hover:text-text-primary transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
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
          {/* Results Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 mb-4 animate-bounce-slow">
              <span className="text-5xl">{getEmoji()}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-text-primary mb-2">
              {getMessage()}
            </h1>
            <p className="text-text-secondary">{quiz.title}</p>
          </div>

          {/* Score Card */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-8 mb-8 text-center animate-fade-in-up">
            <p className="text-7xl font-bold text-accent mb-2">{results.percentage}%</p>
            <p className="text-text-secondary text-lg">
              You got <span className="text-text-primary font-semibold">{results.correct}</span> out of{' '}
              <span className="text-text-primary font-semibold">{results.total}</span> correct
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{results.maxStreak}</p>
                <p className="text-sm text-text-muted">Best Streak 🔥</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{results.correct}</p>
                <p className="text-sm text-text-muted">Correct ✓</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-error">{results.total - results.correct}</p>
                <p className="text-sm text-text-muted">Wrong ✗</p>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-4 mb-8">
            <h2 className="font-serif text-xl text-text-primary">Review Answers</h2>
            {results.questionResults.map((result, index) => (
              <div
                key={result.question.id}
                className={`bg-bg-secondary border-2 rounded-xl p-4 transition-all animate-fade-in-up ${
                  result.isCorrect ? 'border-success/40' : 'border-error/40'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      result.isCorrect ? 'bg-success text-white' : 'bg-error text-white'
                    }`}
                  >
                    {result.isCorrect ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-muted mb-1">Question {index + 1}</p>
                    <p className="text-text-primary font-medium">{result.question.text}</p>
                    
                    {(result.question.type === 'multiple-choice' || result.question.type === 'multi-select') ? (
                      <div className="mt-3 space-y-1.5">
                        {result.question.options?.map((opt) => {
                          const wasSelected = result.answer?.selectedOptionIds?.includes(opt.id);
                          const isCorrectOpt = opt.isCorrect;
                          
                          let bgClass = 'bg-bg-tertiary/50';
                          let textClass = 'text-text-muted';
                          
                          if (isCorrectOpt) {
                            bgClass = 'bg-success/20';
                            textClass = 'text-success';
                          } else if (wasSelected && !isCorrectOpt) {
                            bgClass = 'bg-error/20';
                            textClass = 'text-error line-through';
                          }
                          
                          return (
                            <div
                              key={opt.id}
                              className={`text-sm px-3 py-1.5 rounded-lg ${bgClass} ${textClass} flex items-center gap-2`}
                            >
                              {isCorrectOpt && (
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {wasSelected && !isCorrectOpt && (
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              <span>{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm space-y-1">
                        <p className="text-text-muted">
                          Correct answer: <span className="text-success font-medium">{result.question.expectedAnswer}</span>
                        </p>
                        {!result.isCorrect && (
                          <p className="text-text-muted">
                            Your answer: <span className="text-error">{result.answer?.typedAnswer || 'No answer'}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center animate-fade-in">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-accent/50 transition-all hover:scale-[1.02]"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover transition-all hover:scale-[1.02]"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen (Playing & Feedback)
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
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        {/* Theme toggle - fixed right on desktop */}
        <div className="hidden md:block fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Exit
            </button>
            
            {/* Score & Streak */}
            <div className="flex items-center gap-4">
              {streak > 0 && (
                <div className="flex items-center gap-1 text-orange-400 animate-pulse">
                  <span className="text-lg">🔥</span>
                  <span className="font-bold">{streak}</span>
                </div>
              )}
              <div className="text-sm text-text-secondary">
                <span className="text-accent font-bold">{currentScore}</span>
                <span className="text-text-muted">/{totalQuestions}</span>
              </div>
              {/* Theme toggle - inline on mobile only */}
              <div className="md:hidden">
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-6 py-8">
        <div className="flex-1">
          {/* Question number badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-sm">
              {currentIndex + 1}
            </span>
            <span
              className={`inline-block text-xs px-2.5 py-1 rounded-full ${
                currentQuestion.type === 'multiple-choice'
                  ? 'bg-accent/20 text-accent'
                  : currentQuestion.type === 'multi-select'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {currentQuestion.type === 'multiple-choice' 
                ? 'Single Choice' 
                : currentQuestion.type === 'multi-select' 
                ? 'Select All That Apply' 
                : 'Type Answer'}
            </span>
          </div>

          {/* Question text */}
          <h2 className="font-serif text-2xl md:text-3xl text-text-primary mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Question Image */}
          {currentQuestion.image && (
            <div className="mb-6">
              <img
                src={currentQuestion.image}
                alt="Question"
                className="max-w-full max-h-64 rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Answer Options - Multiple Choice */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer?.selectedOptionIds?.includes(option.id);
                const showFeedback = gameState === 'feedback';
                const isCorrect = option.isCorrect;
                
                let buttonClass = 'border-border bg-bg-secondary text-text-secondary hover:border-accent/50';
                
                if (isSelected && !showFeedback) {
                  buttonClass = 'border-accent bg-accent/10 text-text-primary ring-2 ring-accent/30';
                } else if (showFeedback) {
                  if (isCorrect) {
                    buttonClass = 'border-success bg-success/20 text-success';
                  } else if (isSelected && !isCorrect) {
                    buttonClass = 'border-error bg-error/20 text-error animate-shake';
                  } else {
                    buttonClass = 'border-border/50 bg-bg-secondary/50 text-text-muted';
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={showFeedback}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${buttonClass} ${
                      showFeedback ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          showFeedback && isCorrect
                            ? 'border-success bg-success'
                            : showFeedback && isSelected && !isCorrect
                            ? 'border-error bg-error'
                            : isSelected
                            ? 'border-accent bg-accent'
                            : 'border-current opacity-50'
                        }`}
                      >
                        {showFeedback && isCorrect && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {!showFeedback && isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-lg">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Answer Options - Multi-Select (Grid) */}
          {currentQuestion.type === 'multi-select' && currentQuestion.options && (
            <div className="space-y-3">
              <p className="text-sm text-text-muted mb-2">Select all correct answers:</p>
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentAnswer?.selectedOptionIds?.includes(option.id);
                  const showFeedback = gameState === 'feedback';
                  const isCorrect = option.isCorrect;
                  
                  let buttonClass = 'border-border bg-bg-secondary text-text-secondary hover:border-purple-400/50';
                  
                  if (isSelected && !showFeedback) {
                    buttonClass = 'border-purple-400 bg-purple-400/10 text-text-primary ring-2 ring-purple-400/30';
                  } else if (showFeedback) {
                    if (isCorrect && isSelected) {
                      buttonClass = 'border-success bg-success/20 text-success';
                    } else if (isCorrect && !isSelected) {
                      buttonClass = 'border-success bg-success/10 text-success';
                    } else if (isSelected && !isCorrect) {
                      buttonClass = 'border-error bg-error/20 text-error animate-shake';
                    } else {
                      buttonClass = 'border-border/50 bg-bg-secondary/50 text-text-muted';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleMultiOptionToggle(option.id)}
                      disabled={showFeedback}
                      className={`relative text-center px-4 py-5 rounded-xl border-2 transition-all ${buttonClass} ${
                        showFeedback ? 'cursor-default' : 'hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div
                        className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          showFeedback && isCorrect
                            ? 'border-success bg-success'
                            : showFeedback && isSelected && !isCorrect
                            ? 'border-error bg-error'
                            : isSelected
                            ? 'border-purple-400 bg-purple-400'
                            : 'border-current opacity-40'
                        }`}
                      >
                        {(isSelected || (showFeedback && isCorrect)) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-base font-medium">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Answer Input - Type-in */}
          {currentQuestion.type === 'type-in' && (
            <div className="space-y-3">
              <input
                type="text"
                value={currentAnswer?.typedAnswer ?? ''}
                onChange={(e) => handleTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && hasAnswered && gameState === 'playing') {
                    handleSubmitAnswer();
                  }
                }}
                disabled={gameState === 'feedback'}
                placeholder="Type your answer..."
                className={`w-full px-5 py-4 bg-bg-secondary border-2 rounded-xl text-lg text-text-primary placeholder-text-muted focus:outline-none transition-all ${
                  gameState === 'feedback'
                    ? currentAnswer?.isCorrect
                      ? 'border-success bg-success/10'
                      : 'border-error bg-error/10 animate-shake'
                    : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/20'
                }`}
                autoFocus
              />
              
              {gameState === 'feedback' && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                  currentAnswer?.isCorrect
                    ? 'bg-success/20 text-success'
                    : 'bg-error/20 text-error'
                }`}>
                  {currentAnswer?.isCorrect ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Correct!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>
                        Correct answer: <strong>{currentQuestion.expectedAnswer}</strong>
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Feedback message for multiple choice and multi-select */}
          {gameState === 'feedback' && (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'multi-select') && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl animate-fade-in ${
              currentAnswer?.isCorrect
                ? 'bg-success/20 text-success'
                : 'bg-error/20 text-error'
            }`}>
              {currentAnswer?.isCorrect ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">
                    Correct! {streak > 1 && `🔥 ${streak} in a row!`}
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-medium">Not quite. See the correct answers above.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-border/50">
          {gameState === 'playing' ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!hasAnswered}
              className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${
                hasAnswered
                  ? 'bg-accent text-bg-primary hover:bg-accent-hover hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-4 bg-accent text-bg-primary rounded-xl font-medium text-lg hover:bg-accent-hover transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {currentIndex === totalQuestions - 1 ? (
                <>
                  See Results
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </>
              ) : (
                <>
                  Next Question
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

