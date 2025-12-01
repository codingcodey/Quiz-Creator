import { useState } from 'react';
import type { Question, QuizOption } from '../types/quiz';
import { ImageUploader } from './ImageUploader';

interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, updates: Partial<QuizOption>) => void;
  onDeleteOption: (optionId: string) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function QuestionCard({
  question,
  index,
  totalQuestions,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
}: QuestionCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canDeleteOption = (question.options?.length ?? 0) > 2;
  const canMoveUp = index > 0;
  const canMoveDown = index < totalQuestions - 1;
  
  // Validation checks
  const isQuestionEmpty = !question.text.trim();
  const emptyOptions = question.options?.filter(opt => !opt.text.trim()) ?? [];
  const hasEmptyOptions = (question.type === 'multiple-choice' || question.type === 'multi-select') && emptyOptions.length > 0;
  const isExpectedAnswerEmpty = question.type === 'type-in' && !question.expectedAnswer?.trim();
  const hasNoCorrectAnswer = (question.type === 'multiple-choice' || question.type === 'multi-select') && !question.options?.some(opt => opt.isCorrect);

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop">
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-modal">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-text-primary">Delete Question</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        className={`relative bg-bg-secondary border-2 rounded-2xl p-5 transition-all duration-300 cursor-grab active:cursor-grabbing ${
          isDragging 
            ? 'opacity-50 scale-[0.98] border-border' 
            : isDragOver 
            ? 'border-accent border-dashed bg-accent/5' 
            : 'border-border border-solid hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5'
        }`}
      >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Drag handle */}
        <button
          className="mt-1 p-1 text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm2 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </button>

        <div className="flex-1">
          {/* Question number and type badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-text-muted">
              Question {index + 1}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                question.type === 'multiple-choice'
                  ? 'bg-accent/20 text-accent'
                  : question.type === 'multi-select'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {question.type === 'multiple-choice' ? 'Multiple Choice' : question.type === 'multi-select' ? 'Multi-Select' : 'Type Answer'}
            </span>
          </div>

          {/* Question text */}
          <textarea
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter your question..."
            rows={2}
            className={`w-full bg-transparent text-text-primary text-lg placeholder-text-muted resize-none focus:outline-none ${
              isQuestionEmpty ? 'border-b border-warning' : ''
            }`}
          />
          {isQuestionEmpty && (
            <p className="text-xs text-warning mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Question is required
            </p>
          )}
        </div>
      </div>

      {/* Image upload */}
      <div className="mb-4">
        <ImageUploader
          image={question.image}
          onImageChange={(image) => onUpdate({ image })}
          className="h-32"
          placeholder="Add image"
        />
      </div>

      {/* Multiple choice options */}
      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Answer options (click to mark correct):</p>
          
          {question.options.map((option, optIndex) => {
            const isOptionEmpty = !option.text.trim();
            return (
              <div key={option.id} className="flex items-center gap-3">
                {/* Correct answer toggle */}
                <button
                  onClick={() => onUpdateOption(option.id, { isCorrect: !option.isCorrect })}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    option.isCorrect
                      ? 'border-success bg-success text-bg-primary'
                      : 'border-border hover:border-success/50'
                  }`}
                  title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                >
                  {option.isCorrect && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Option text */}
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => onUpdateOption(option.id, { text: e.target.value })}
                  placeholder={`Option ${optIndex + 1}`}
                  className={`flex-1 bg-bg-tertiary px-3 py-2 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 ${
                    isOptionEmpty ? 'ring-1 ring-warning' : 'focus:ring-accent/50'
                  }`}
                />

                {/* Delete option */}
                {canDeleteOption && (
                  <button
                    onClick={() => onDeleteOption(option.id)}
                    className="p-1 text-text-muted hover:text-error transition-colors"
                    title="Remove option"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}

          {hasEmptyOptions && (
            <p className="text-xs text-warning flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              All options are required
            </p>
          )}

          {hasNoCorrectAnswer && (
            <p className="text-xs text-warning flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              At least one correct answer is required
            </p>
          )}

          {/* Add option button */}
          {(question.options?.length ?? 0) < 6 && (
            <button
              onClick={onAddOption}
              className="w-full py-2 border border-dashed border-border rounded-lg text-sm text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
            >
              + Add Option
            </button>
          )}
        </div>
      )}

      {/* Multi-select options (grid layout) */}
      {question.type === 'multi-select' && question.options && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Answer options (click to mark correct — multiple can be correct):</p>
          
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option, optIndex) => {
              const isOptionEmpty = !option.text.trim();
              return (
                <div 
                  key={option.id} 
                  className={`relative bg-bg-tertiary rounded-xl p-3 border-2 transition-all ${
                    option.isCorrect 
                      ? 'border-success/50 bg-success/5' 
                      : 'border-transparent'
                  } ${isOptionEmpty ? 'ring-1 ring-warning' : ''}`}
                >
                  {/* Correct toggle button */}
                  <button
                    onClick={() => onUpdateOption(option.id, { isCorrect: !option.isCorrect })}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      option.isCorrect
                        ? 'border-success bg-success text-bg-primary'
                        : 'border-border hover:border-success/50'
                    }`}
                    title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                  >
                    {option.isCorrect && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Delete button */}
                  {canDeleteOption && (
                    <button
                      onClick={() => onDeleteOption(option.id)}
                      className="absolute top-2 left-2 p-1 text-text-muted hover:text-error transition-colors rounded"
                      title="Remove option"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* Option text */}
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => onUpdateOption(option.id, { text: e.target.value })}
                    placeholder={`Option ${optIndex + 1}`}
                    className="w-full bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-center pt-6 pb-2"
                  />
                </div>
              );
            })}
          </div>

          {hasEmptyOptions && (
            <p className="text-xs text-warning flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              All options are required
            </p>
          )}

          {hasNoCorrectAnswer && (
            <p className="text-xs text-warning flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              At least one correct answer is required
            </p>
          )}

          {/* Add option button */}
          {(question.options?.length ?? 0) < 8 && (
            <button
              onClick={onAddOption}
              className="w-full py-2 border border-dashed border-border rounded-lg text-sm text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
            >
              + Add Option
            </button>
          )}
        </div>
      )}

      {/* Type-in answer */}
      {question.type === 'type-in' && (
        <div className="space-y-2">
          <p className="text-sm text-text-muted">Expected answer:</p>
          <input
            type="text"
            value={question.expectedAnswer || ''}
            onChange={(e) => onUpdate({ expectedAnswer: e.target.value })}
            placeholder="Enter the correct answer..."
            className={`w-full bg-bg-tertiary px-3 py-2 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 ${
              isExpectedAnswerEmpty ? 'ring-1 ring-warning' : 'focus:ring-accent/50'
            }`}
          />
          {isExpectedAnswerEmpty ? (
            <p className="text-xs text-warning flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Expected answer is required
            </p>
          ) : (
            <p className="text-xs text-text-muted">
              This is the answer that will be checked against user input.
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1">
          {/* Move up */}
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`p-1.5 rounded-lg transition-colors ${
              canMoveUp 
                ? 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary' 
                : 'text-text-muted/30 cursor-not-allowed'
            }`}
            title="Move up (keyboard: hold question and press ↑)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          {/* Move down */}
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`p-1.5 rounded-lg transition-colors ${
              canMoveDown 
                ? 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary' 
                : 'text-text-muted/30 cursor-not-allowed'
            }`}
            title="Move down (keyboard: hold question and press ↓)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Duplicate */}
          <button
            onClick={onDuplicate}
            className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
            title="Duplicate question"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
            title="Delete question"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
