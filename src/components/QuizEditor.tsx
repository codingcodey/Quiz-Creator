import { useState, useEffect, useCallback } from 'react';
import type { Quiz, Question, QuizOption } from '../types/quiz';
import { QuestionCard } from './QuestionCard';
import { ImageUploader } from './ImageUploader';

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
  const [lastSaveTime, setLastSaveTime] = useState(quiz.updatedAt);

  // Show saved indicator when quiz is updated
  useEffect(() => {
    if (quiz.updatedAt !== lastSaveTime) {
      setLastSaveTime(quiz.updatedAt);
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [quiz.updatedAt, lastSaveTime]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onAddQuestion('multiple-choice');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddQuestion]);

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
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-3">
            {/* Save indicator */}
            <span
              className={`text-sm text-success flex items-center gap-1.5 transition-opacity ${
                showSaved ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>

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
        </div>
      </header>

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
