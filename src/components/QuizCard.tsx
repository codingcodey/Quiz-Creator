import { useState } from 'react';
import { ConfirmationModal } from './Modal';
import type { Quiz } from '../types/quiz';

interface QuizCardProps {
  quiz: Quiz;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onPlay: () => void;
  onToggleFavorite?: () => void;
  index: number;
  isPublicView?: boolean;
}

export function QuizCard({ quiz, onEdit, onDelete, onDuplicate, onExport, onPlay, onToggleFavorite, index, isPublicView }: QuizCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const questionCount = quiz.questions.length;
  const formattedDate = new Date(quiz.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${quiz.title}"? This will permanently delete the quiz and ${quiz.questions.length} question${quiz.questions.length !== 1 ? 's' : ''}. This action cannot be undone.`}
        confirmText="Delete Quiz"
        variant="danger"
        icon={
          <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
      />

      <article
        onClick={!isPublicView ? (e) => {
          // Only trigger edit if not clicking on interactive elements
          const target = e.target as HTMLElement;
          if (!target.closest('[data-interactive]') && !target.closest('button')) {
            onEdit();
          }
        } : undefined}
        className="group relative overflow-hidden bg-bg-secondary border border-border-subtle rounded-2xl hover:border-accent/60 transition-colors duration-300 ease-out opacity-0 animate-fade-in-up card-elevated cursor-pointer"
        style={{ animationDelay: `${0.15 + index * 0.08}s` }}
      >
      {/* Cover Image or Placeholder */}
      <div className="relative h-40 bg-bg-tertiary overflow-hidden">
        {quiz.coverImage ? (
          <img
            src={quiz.coverImage}
            alt={quiz.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl text-text-muted/30 font-serif transition-transform duration-300 group-hover:scale-110">Q</div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/80 to-transparent" />
        
        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {/* Question count badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-primary/80 backdrop-blur-sm rounded-full text-xs text-text-secondary">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {questionCount} question{questionCount !== 1 ? 's' : ''}
          </div>
          
          {/* Play count badge - always show with triangle, even at 0 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-primary/80 backdrop-blur-sm rounded-full text-xs text-text-secondary">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {quiz.playCount ?? 0}
          </div>
          
          {/* Public/Private badge */}
          {quiz.settings?.isPublic ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 backdrop-blur-sm rounded-full text-xs text-accent">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Public
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-text-muted/20 backdrop-blur-sm rounded-full text-xs text-text-muted">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private
            </div>
          )}
        </div>
        
        {/* Favorite button - top left */}
        {onToggleFavorite && (
          <button
            data-interactive="favorite"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`absolute top-3 left-3 z-10 p-2 rounded-lg transition-all duration-300 ${
              quiz.isFavorite
                ? 'bg-red-500/20 text-red-500'
                : 'bg-bg-primary/80 backdrop-blur-sm text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100'
            }`}
            title={quiz.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-4 h-4"
              fill={quiz.isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between min-h-[140px]">
        <div>
          <h3 className={`font-serif text-xl text-text-primary line-clamp-1 group-hover:text-accent transition-colors ${!isPublicView ? 'pr-16' : 'pr-4'}`}>
            {quiz.title}
          </h3>

          {quiz.description && (
            <p className={`mt-1 text-sm text-text-secondary line-clamp-2 ${!isPublicView ? 'pr-16' : 'pr-4'}`}>
              {quiz.description}
            </p>
          )}

          {/* Tags */}
          {quiz.tags && quiz.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {quiz.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-bg-tertiary text-text-muted rounded-full"
                >
                  {tag}
                </span>
              ))}
              {quiz.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-text-muted">
                  +{quiz.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-text-muted">
            Updated {formattedDate}
          </p>

          {/* Play button - inline in content footer */}
          {quiz.questions.length > 0 && (
            <button
              data-interactive="play"
              type="button"
              onClick={(e) => {
                console.log('Play button clicked!', e.target);
                e.stopPropagation();
                e.preventDefault();
                console.log('Calling onPlay function...');
                onPlay();
                console.log('onPlay completed');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-bg-primary font-medium hover:bg-accent-hover hover:shadow-lg transition-all duration-300 z-30"
              title="Play quiz"
            >
              <svg className="w-4 h-4 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="pointer-events-none">Play</span>
            </button>
          )}
        </div>
      </div>


        {/* Actions - hide in public view */}
        {!isPublicView && (
          <div data-interactive="actions" className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            {/* Duplicate button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-2 bg-bg-primary/80 backdrop-blur-sm rounded-lg text-text-secondary hover:text-accent hover:bg-bg-primary hover:shadow-md transition-all duration-300"
              title="Duplicate quiz"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            {/* Export button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
              className="p-2 bg-bg-primary/80 backdrop-blur-sm rounded-lg text-text-secondary hover:text-accent hover:bg-bg-primary hover:shadow-md transition-all duration-300"
              title="Export as JSON"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-2 bg-bg-primary/80 backdrop-blur-sm rounded-lg text-text-secondary hover:text-error hover:bg-error/10 hover:shadow-md transition-all duration-300"
              title="Delete quiz"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </article>
    </>
  );
}
