import { useState, useMemo } from 'react';
import type { Quiz, Question } from '../types/quiz';

interface QuizPreviewProps {
  quiz: Quiz;
  onBack: () => void;
}

interface Answer {
  questionId: string;
  selectedOptionIds?: string[];
  typedAnswer?: string;
}

export function QuizPreview({ quiz, onBack }: QuizPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Calculate results
  const results = useMemo(() => {
    if (!showResults) return null;

    let correct = 0;
    const questionResults = quiz.questions.map((question) => {
      const answer = answers.find((a) => a.questionId === question.id);
      let isCorrect = false;

      if (question.type === 'multiple-choice') {
        const correctOptionIds = question.options
          ?.filter((opt) => opt.isCorrect)
          .map((opt) => opt.id) ?? [];
        const selectedIds = answer?.selectedOptionIds ?? [];
        isCorrect =
          correctOptionIds.length === selectedIds.length &&
          correctOptionIds.every((id) => selectedIds.includes(id));
      } else if (question.type === 'type-in') {
        const expected = question.expectedAnswer?.toLowerCase().trim() ?? '';
        const given = answer?.typedAnswer?.toLowerCase().trim() ?? '';
        isCorrect = expected === given;
      }

      if (isCorrect) correct++;
      return { question, answer, isCorrect };
    });

    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
      questionResults,
    };
  }, [showResults, quiz.questions, answers, totalQuestions]);

  const getCurrentAnswer = () => {
    return answers.find((a) => a.questionId === currentQuestion?.id);
  };

  const handleOptionToggle = (optionId: string) => {
    if (!currentQuestion) return;

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
    if (!currentQuestion) return;

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

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setShowResults(false);
  };

  const currentAnswer = getCurrentAnswer();
  const hasAnswered =
    currentQuestion?.type === 'multiple-choice'
      ? (currentAnswer?.selectedOptionIds?.length ?? 0) > 0
      : (currentAnswer?.typedAnswer?.trim().length ?? 0) > 0;

  if (showResults && results) {
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4">
              <span className="text-4xl">
                {results.percentage >= 80 ? '🎉' : results.percentage >= 50 ? '👍' : '📚'}
              </span>
            </div>
            <h1 className="font-serif text-4xl text-text-primary mb-2">Quiz Complete!</h1>
            <p className="text-text-secondary">{quiz.title}</p>
          </div>

          {/* Score Card */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-8 mb-8 text-center">
            <p className="text-6xl font-bold text-accent mb-2">{results.percentage}%</p>
            <p className="text-text-secondary">
              You got <span className="text-text-primary font-medium">{results.correct}</span> out of{' '}
              <span className="text-text-primary font-medium">{results.total}</span> correct
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-4 mb-8">
            <h2 className="font-serif text-xl text-text-primary">Review Answers</h2>
            {results.questionResults.map((result, index) => (
              <div
                key={result.question.id}
                className={`bg-bg-secondary border rounded-xl p-4 ${
                  result.isCorrect ? 'border-success/50' : 'border-error/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      result.isCorrect ? 'bg-success text-white' : 'bg-error text-white'
                    }`}
                  >
                    {result.isCorrect ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-muted mb-1">Question {index + 1}</p>
                    <p className="text-text-primary">{result.question.text}</p>
                    {result.question.type === 'multiple-choice' ? (
                      <div className="mt-2 text-sm">
                        <p className="text-text-muted">
                          Correct:{' '}
                          <span className="text-success">
                            {result.question.options
                              ?.filter((opt) => opt.isCorrect)
                              .map((opt) => opt.text)
                              .join(', ')}
                          </span>
                        </p>
                        {!result.isCorrect && (
                          <p className="text-text-muted">
                            Your answer:{' '}
                            <span className="text-error">
                              {result.question.options
                                ?.filter((opt) => result.answer?.selectedOptionIds?.includes(opt.id))
                                .map((opt) => opt.text)
                                .join(', ') || 'No answer'}
                            </span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm">
                        <p className="text-text-muted">
                          Correct: <span className="text-success">{result.question.expectedAnswer}</span>
                        </p>
                        {!result.isCorrect && (
                          <p className="text-text-muted">
                            Your answer:{' '}
                            <span className="text-error">{result.answer?.typedAnswer || 'No answer'}</span>
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
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-accent/50 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 100% 70% at 50% 0%, var(--color-accent-muted) 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 80% 100%, var(--color-accent-muted) 0%, transparent 50%),
          var(--color-bg-primary)
        `,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4">
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
            <span className="text-sm text-text-muted">
              {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full mb-4 ${
              currentQuestion.type === 'multiple-choice'
                ? 'bg-accent/20 text-accent'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {currentQuestion.type === 'multiple-choice' ? 'Multiple Choice' : 'Type Answer'}
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-text-primary">{currentQuestion.text}</h2>
        </div>

        {/* Question Image */}
        {currentQuestion.image && (
          <div className="mb-8">
            <img
              src={currentQuestion.image}
              alt="Question"
              className="max-w-full h-auto rounded-xl"
            />
          </div>
        )}

        {/* Answer Options */}
        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <div className="space-y-3 mb-12">
            {currentQuestion.options.map((option) => {
              const isSelected = currentAnswer?.selectedOptionIds?.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionToggle(option.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/10 text-text-primary'
                      : 'border-border bg-bg-secondary text-text-secondary hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-accent bg-accent' : 'border-border'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {option.text}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Type-in Answer */}
        {currentQuestion.type === 'type-in' && (
          <div className="mb-12">
            <input
              type="text"
              value={currentAnswer?.typedAnswer ?? ''}
              onChange={(e) => handleTypedAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-5 py-4 bg-bg-secondary border-2 border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-colors ${
              currentIndex === 0
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              hasAnswered
                ? 'bg-accent text-bg-primary hover:bg-accent-hover'
                : 'bg-bg-secondary border border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}

