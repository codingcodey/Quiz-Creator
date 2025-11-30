import { useState, useEffect, useCallback, useRef } from 'react';
import type { Quiz, Question, QuizOption } from '../types/quiz';
import { createQuestion, createOption } from '../types/quiz';
import { QuestionCard } from './QuestionCard';
import { ImageUploader } from './ImageUploader';
import { ThemeToggle } from './ThemeToggle';

// Helper to check if a question is complete
function isQuestionComplete(question: Question): boolean {
  // Question text must not be empty
  if (!question.text.trim()) return false;
  
  if (question.type === 'multiple-choice' || question.type === 'multi-select') {
    // All options must have text
    if (!question.options || question.options.length < 2) return false;
    if (question.options.some(opt => !opt.text.trim())) return false;
    // At least one option must be marked as correct
    if (!question.options.some(opt => opt.isCorrect)) return false;
  } else if (question.type === 'type-in') {
    // Expected answer must not be empty
    if (!question.expectedAnswer?.trim()) return false;
  }
  
  return true;
}

interface QuizEditorProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onExport: (quiz: Quiz) => void;
  onBack: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function QuizEditor({
  quiz,
  onSave,
  onExport,
  onBack,
  theme,
  onToggleTheme,
}: QuizEditorProps) {
  // Local draft state - changes only affect this until saved
  const [draft, setDraft] = useState<Quiz>(() => JSON.parse(JSON.stringify(quiz)));
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [shakeTitle, setShakeTitle] = useState(false);
  const originalQuizRef = useRef<string>(JSON.stringify(quiz));
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(draft) !== originalQuizRef.current;

  // Validation
  const isTitleEmpty = !draft.title.trim();
  const canSave = !isTitleEmpty && draft.questions.length > 0 && draft.questions.every(isQuestionComplete);
  
  // Show confirmation if quiz is incomplete OR has unsaved changes
  const needsConfirmation = !canSave || hasUnsavedChanges;

  // Find first incomplete question index
  const findFirstIncompleteQuestion = useCallback((): number => {
    if (draft.questions.length === 0) return -1;
    return draft.questions.findIndex(q => !isQuestionComplete(q));
  }, [draft.questions]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Update draft
  const updateDraft = useCallback((updates: Partial<Quiz>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  // Add question
  const addQuestion = useCallback((type: Question['type']) => {
    const newQuestion = createQuestion(type);
    setDraft(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  }, []);

  // Update question
  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setDraft(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }));
  }, []);

  // Delete question
  const deleteQuestion = useCallback((questionId: string) => {
    setDraft(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
  }, []);

  // Reorder questions
  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    setDraft(prev => {
      const newQuestions = [...prev.questions];
      const [removed] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, removed);
      return { ...prev, questions: newQuestions };
    });
  }, []);

  // Add option
  const addOption = useCallback((questionId: string) => {
    const newOption = createOption();
    setDraft(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId && q.options
          ? { ...q, options: [...q.options, newOption] }
          : q
      ),
    }));
  }, []);

  // Update option
  const updateOption = useCallback((questionId: string, optionId: string, updates: Partial<QuizOption>) => {
    setDraft(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId && q.options
          ? {
              ...q,
              options: q.options.map(opt =>
                opt.id === optionId ? { ...opt, ...updates } : opt
              ),
            }
          : q
      ),
    }));
  }, []);

  // Delete option
  const deleteOption = useCallback((questionId: string, optionId: string) => {
    setDraft(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId && q.options
          ? { ...q, options: q.options.filter(opt => opt.id !== optionId) }
          : q
      ),
    }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    if (!canSave) {
      // Scroll to the first problem area
      if (isTitleEmpty) {
        const titleInput = document.querySelector('[data-quiz-title]');
        titleInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (titleInput as HTMLInputElement)?.focus();
        setShakeTitle(true);
        setTimeout(() => setShakeTitle(false), 500);
      } else if (draft.questions.length === 0) {
        const addButtonSection = document.querySelector('[data-add-question]');
        addButtonSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const firstIncomplete = findFirstIncompleteQuestion();
        if (firstIncomplete >= 0) {
          const questionCard = document.querySelector(`[data-question-index="${firstIncomplete}"]`);
          questionCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    // Save the draft to the store
    const savedQuiz = { ...draft, updatedAt: Date.now() };
    onSave(savedQuiz);
    
    // Update our reference to match what we saved
    originalQuizRef.current = JSON.stringify(savedQuiz);
    setDraft(savedQuiz);
    
    setShowSaved(true);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => setShowSaved(false), 2000);
  }, [canSave, isTitleEmpty, draft, onSave, findFirstIncompleteQuestion]);

  // Handle back with confirmation
  const handleBackClick = useCallback(() => {
    if (needsConfirmation) {
      setShowLeaveConfirm(true);
    } else {
      onBack();
    }
  }, [needsConfirmation, onBack]);

  // Warn before leaving page with incomplete or unsaved quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (needsConfirmation) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [needsConfirmation]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addQuestion('multiple-choice');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addQuestion, handleSave]);

  const handleDragStart = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => {
      if (draggingIndex !== null && draggingIndex !== toIndex) {
        reorderQuestions(draggingIndex, toIndex);
      }
      setDraggingIndex(null);
      setDragOverIndex(null);
    },
    [draggingIndex, reorderQuestions]
  );

  // Keyboard reordering
  const handleMoveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < draft.questions.length) {
      reorderQuestions(index, newIndex);
    }
  }, [draft.questions.length, reorderQuestions]);

  // Duplicate question
  const handleDuplicateQuestion = useCallback((index: number) => {
    const question = draft.questions[index];
    if (!question) return;
    
    const duplicatedQuestion: Question = {
      ...question,
      id: crypto.randomUUID(),
      text: question.text,
      options: question.options?.map(opt => ({
        ...opt,
        id: crypto.randomUUID(),
      })),
    };
    
    setDraft(prev => ({
      ...prev,
      questions: [
        ...prev.questions.slice(0, index + 1),
        duplicatedQuestion,
        ...prev.questions.slice(index + 1),
      ],
    }));
  }, [draft.questions]);

  // Handle export (exports current draft)
  const handleExport = useCallback(() => {
    onExport(draft);
  }, [draft, onExport]);

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
              <h3 className="font-serif text-xl text-text-primary">
                {!canSave ? 'Quiz Not Complete' : 'Unsaved Changes'}
              </h3>
            </div>
            <p className="text-text-secondary mb-6">
              {!canSave 
                ? 'Your quiz is not complete. Add at least one complete question to save it. Are you sure you want to leave?'
                : 'You have unsaved changes that will be lost. Are you sure you want to leave?'
              }
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
      <header className="sticky top-0 z-20 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        {/* Theme toggle - fixed right on desktop */}
        <div className="hidden md:block fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        
        {/* Mobile: 4 evenly spaced items */}
        <div className="md:hidden px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              showSaved
                ? 'bg-success text-white cursor-default'
                : canSave
                ? 'bg-success hover:bg-success/90 text-white shadow-lg shadow-success/25 cursor-pointer'
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
            Save
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        {/* Desktop: Original layout */}
        <div className="hidden md:flex max-w-4xl mx-auto px-6 py-4 items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-warning">Unsaved changes</span>
            )}
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${
                showSaved
                  ? 'bg-success text-white cursor-default'
                  : canSave
                  ? 'bg-success hover:bg-success/90 text-white shadow-lg shadow-success/25 cursor-pointer'
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
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quiz Title */}
        <div className={`mb-8 ${shakeTitle ? 'animate-shake' : ''}`}>
          <input
            type="text"
            data-quiz-title
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            placeholder="Quiz Title"
            className={`w-full bg-transparent font-serif text-4xl md:text-5xl text-text-primary placeholder-text-muted focus:outline-none ${
              isTitleEmpty ? 'border-b-2 border-warning' : ''
            }`}
          />
          {isTitleEmpty && (
            <p className="text-sm text-warning mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Title is required
            </p>
          )}
          <textarea
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            placeholder="Add a description..."
            rows={2}
            className="w-full mt-4 bg-transparent text-lg text-text-secondary placeholder-text-muted resize-none focus:outline-none"
          />
        </div>

        {/* Cover Image */}
        <div className="mb-10">
          <p className="text-sm text-text-muted mb-2">Cover Image</p>
          <ImageUploader
            image={draft.coverImage}
            onImageChange={(coverImage) => updateDraft({ coverImage })}
            className="h-48"
            placeholder="Add cover image"
          />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-text-primary">Questions</h2>
            <span className="text-sm text-text-muted">
              {draft.questions.length} question{draft.questions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {draft.questions.length === 0 ? (
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
              {draft.questions.map((question, index) => (
                <div key={question.id} data-question-index={index}>
                  <QuestionCard
                    question={question}
                    index={index}
                    totalQuestions={draft.questions.length}
                    onUpdate={(updates) => updateQuestion(question.id, updates)}
                    onDelete={() => deleteQuestion(question.id)}
                    onDuplicate={() => handleDuplicateQuestion(index)}
                    onMoveUp={() => handleMoveQuestion(index, 'up')}
                    onMoveDown={() => handleMoveQuestion(index, 'down')}
                    onAddOption={() => addOption(question.id)}
                    onUpdateOption={(optionId, updates) =>
                      updateOption(question.id, optionId, updates)
                    }
                    onDeleteOption={(optionId) => deleteOption(question.id, optionId)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    onDrop={() => handleDrop(index)}
                    isDragging={draggingIndex === index}
                    isDragOver={dragOverIndex === index && draggingIndex !== index}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add Question Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4" data-add-question>
            <button
              onClick={() => addQuestion('multiple-choice')}
              className="flex items-center justify-center gap-2 py-4 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-accent/50 hover:text-accent transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Single Choice</span>
            </button>
            <button
              onClick={() => addQuestion('multi-select')}
              className="flex items-center justify-center gap-2 py-4 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-purple-400/50 hover:text-purple-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Multi-Select</span>
            </button>
            <button
              onClick={() => addQuestion('type-in')}
              className="flex items-center justify-center gap-2 py-4 bg-bg-secondary border border-border rounded-xl text-text-primary hover:border-blue-400/50 hover:text-blue-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Type Answer</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
