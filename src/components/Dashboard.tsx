import type { Quiz } from '../types/quiz';
import { QuizCard } from './QuizCard';

interface DashboardProps {
  quizzes: Quiz[];
  onCreateQuiz: () => void;
  onEditQuiz: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onDuplicateQuiz: (id: string) => void;
  onExportQuiz: (id: string) => void;
  onPlayQuiz: (id: string) => void;
}

export function Dashboard({
  quizzes,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onDuplicateQuiz,
  onExportQuiz,
  onPlayQuiz,
}: DashboardProps) {
  if (quizzes.length === 0) {
    return null;
  }

  return (
    <section
      className="py-12 px-6"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 20% 0%, var(--color-accent-muted) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 90% 100%, var(--color-accent-muted) 0%, transparent 40%),
          var(--color-bg-primary)
        `,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl text-text-primary">Your Quizzes</h2>
            <p className="mt-1 text-text-secondary">
              {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} saved
            </p>
          </div>
          <button
            onClick={onCreateQuiz}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Quiz
          </button>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              index={index}
              onEdit={() => onEditQuiz(quiz.id)}
              onDelete={() => onDeleteQuiz(quiz.id)}
              onDuplicate={() => onDuplicateQuiz(quiz.id)}
              onExport={() => onExportQuiz(quiz.id)}
              onPlay={() => onPlayQuiz(quiz.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
