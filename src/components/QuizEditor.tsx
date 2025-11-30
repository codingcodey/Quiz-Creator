import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Quiz, Question, QuizOption } from '../types/quiz';
import { QuestionCard } from './QuestionCard';
import { ImageUploader } from './ImageUploader';

// Helper to check if a question is complete
function isQuestionComplete(question: Question): boolean {
  // Question text must not be empty
  if (!question.text.trim()) return false;
  
  if (question.type === 'multiple-choice') {
    // All options must have text
    if (!question.options || question.options.length < 2) return false;
    if (question.options.some(opt => !opt.text.trim())) return false;
  } else if (question.type === 'type-in') {
    // Expected answer must not be empty
    if (!question.expectedAnswer?.trim()) return false;
  }
  
  return true;
}

// Get validation errors for the quiz
function getQuizErrors(quiz: Quiz): string[] {
  const errors: string[] = [];
  
  if (quiz.questions.length === 0) {
    errors.push('Add at least one question to save the quiz');
    return errors;
  }
  
  quiz.questions.forEach((question, index) => {
    if (!question.text.trim()) {
      errors.push(`Question ${index + 1}: Question text is required`);
    }
    
    if (question.type === 'multiple-choice') {
      const emptyOptions = question.options?.filter(opt => !opt.text.trim()) || [];
      if (emptyOptions.length > 0) {
        errors.push(`Question ${index + 1}: All options must have text`);
      }
    } else if (question.type === 'type-in') {
      if (!question.expectedAnswer?.trim()) {
        errors.push(`Question ${index + 1}: Expected answer is required`);
      }
    }
  });
  
  return errors;
}

interface QuizEditorProps {
  quiz: Quiz;
  onUpdate: (updates: Partial<Quiz>) => void;
  onAddQuestion: (type: Question['type']) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onReorderQuestions: (fromIndex: number, toIndex: number) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, optionId: string, updates: Partial<QuizOption>) => void;
  onDeleteOption: (questionId: string, optionId: string) => void;
  onExport: () => void;
  onBack: () => void;
}

export function QuizEditor({
  quiz,
  onUpdate,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onExport,
  onBack,
}: QuizEditorProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSavedStateRef = useRef<string>(JSON.stringify(quiz));

  // Check if quiz has unsaved changes
  useEffect(() => {
    const currentState = JSON.stringify(quiz);
    setHasUnsavedChanges(currentState !== lastSavedStateRef.current);
  }, [quiz]);

  // Validation
  const validationErrors = useMemo(() => getQuizErrors(quiz), [quiz]);
  const canSave = quiz.questions.length > 0 && quiz.questions.every(isQuestionComplete);

  // Handle save
  const handleSave = useCallback(() => {
    if (!canSave) {
      setShowErrors(true);
      return;
    }
    
    // Update the quiz (triggers localStorage save)
    onUpdate({ updatedAt: Date.now() });
    lastSavedStateRef.current = JSON.stringify({ ...quiz, updatedAt: Date.now() });
    setHasUnsavedChanges(false);
    setShowErrors(false);
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [canSave, onUpdate, quiz]);

  // Handle back with confirmation
  const handleBackClick = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true);
    } else {
      onBack();
    }
  }, [hasUnsavedChanges, onBack]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onAddQuestion('multiple-choice');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddQuestion, handleSave]);

  const handleDragStart = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => {
      if (draggingIndex !== null && draggingIndex !== toIndex) {
        onReorderQuestions(draggingIndex, toIndex);
      }
      setDraggingIndex(null);
    },
    [draggingIndex, onReorderQuestions]
  );

  return (
    <div 
      className="min-h-screen pb-20"
      style={{
        background: `
          radial-gradient(ellipse 100% 70% at 50% 0%, var(--color-accent-muted) 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 80% 100%, var(--color-accent-muted) 0%, transparent 50%),
          var(--color-bg-primary)
        `
      }}
    >
      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-text-primary">Unsaved Changes</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Are you sure you want to leave? You have unsaved changes that will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onBack();
                }}
                className="px-4 py-2 bg-error/20 text-error border border-error/30 rounded-lg hover:bg-error/30 transition-colors"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Save Button - Center */}
          <button
            onClick={handleSave}
            disabled={showSaved}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${
              showSaved
                ? 'bg-success text-white'
                : canSave
                ? 'bg-success hover:bg-success/90 text-white shadow-lg shadow-success/25'
                : 'bg-text-muted/30 text-text-muted cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showSaved ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              )}
            </svg>
            {showSaved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </header>

      {/* Error Messages */}
      {showErrors && validationErrors.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mt-4">
          <div className="bg-error/10 border border-error/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-error mb-2">Please fix the following issues to save:</h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i} className="text-sm text-error/80">• {error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowErrors(false)}
                className="ml-auto text-error/60 hover:text-error transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quiz Title */}
        <div className="mb-8">
          <input
            type="text"
            value={quiz.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Quiz Title"
            className="w-full bg-transparent font-serif text-4xl md:text-5xl text-text-primary placeholder-text-muted focus:outline-none"
          />
          <textarea
            value={quiz.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add a description..."
            rows={2}
            className="w-full mt-4 bg-transparent text-lg text-text-secondary placeholder-text-muted resize-none focus:outline-none"
          />
        </div>

        {/* Cover Image */}
        <div className="mb-10">
          <p className="text-sm text-text-muted mb-2">Cover Image</p>
          <ImageUploader
            image={quiz.coverImage}
            onImageChange={(coverImage) => onUpdate({ coverImage })}
            className="h-48"
            placeholder="Add cover image"
          />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-text-primary">Questions</h2>
            <span className="text-sm text-text-muted">
              {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {quiz.questions.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
              <svg
                className="w-12 h-12 mx-auto text-text-muted mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-text-muted mb-2">No questions yet</p>
              <p className="text-sm text-text-muted">
                Add your first question using the buttons below
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
                  onDelete={() => onDeleteQuestion(question.id)}
                  onAddOption={() => onAddOption(question.id)}
                  onUpdateOption={(optionId, updates) =>
                    onUpdateOption(question.id, optionId, updates)
                  }
                  onDeleteOption={(optionId) => onDeleteOption(question.id, optionId)}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  isDragging={draggingIndex === index}
                />
              ))}
            </div>
          )}

          {/* Add Question Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => onAddQuestion('multiple-choice')}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-accent/50 hover:text-accent transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Multiple Choice</span>
            </button>
            <button
              onClick={() => onAddQuestion('type-in')}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-accent/50 hover:text-accent transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Type Answer</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
