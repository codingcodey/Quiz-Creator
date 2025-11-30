import type { Quiz } from '../types/quiz';

interface QuizCardProps {
  quiz: Quiz;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  index: number;
}

export function QuizCard({ quiz, onEdit, onDelete, onExport, index }: QuizCardProps) {
  const questionCount = quiz.questions.length;
  const formattedDate = new Date(quiz.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className="group relative bg-bg-secondary border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
    >
      {/* Cover Image or Placeholder */}
      <div className="relative h-40 bg-bg-tertiary overflow-hidden">
        {quiz.coverImage ? (
          <img
            src={quiz.coverImage}
            alt={quiz.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl text-text-muted/30 font-serif">Q</div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/80 to-transparent" />
        
        {/* Question count badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-bg-primary/80 backdrop-blur-sm rounded-full text-xs text-text-secondary">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {questionCount} question{questionCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-xl text-text-primary line-clamp-1 group-hover:text-accent transition-colors">
          {quiz.title}
        </h3>
        
        {quiz.description && (
          <p className="mt-1 text-sm text-text-secondary line-clamp-2">
            {quiz.description}
          </p>
        )}
        
        <p className="mt-3 text-xs text-text-muted">
          Updated {formattedDate}
        </p>
      </div>

      {/* Actions */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          className="p-2 bg-bg-primary/80 backdrop-blur-sm rounded-lg text-text-secondary hover:text-accent transition-colors"
          title="Export as JSON"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this quiz?')) {
              onDelete();
            }
          }}
          className="p-2 bg-bg-primary/80 backdrop-blur-sm rounded-lg text-text-secondary hover:text-error transition-colors"
          title="Delete quiz"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Click overlay to edit */}
      <button
        onClick={onEdit}
        className="absolute inset-0 w-full h-full cursor-pointer"
        aria-label={`Edit ${quiz.title}`}
      />
    </article>
  );
}
