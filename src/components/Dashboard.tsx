import { useState } from 'react';
import type { Quiz } from '../types/quiz';
import { QuizCard } from './QuizCard';
import { SearchBar } from './SearchBar';

interface DashboardProps {
  quizzes: Quiz[];
  onCreateQuiz: () => void;
  onEditQuiz: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onDuplicateQuiz: (id: string) => void;
  onExportQuiz: (id: string) => void;
  onPlayQuiz: (id: string) => void;
  // Search & Filter props
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchSuggestions?: string[];
  showFavoritesOnly?: boolean;
  onToggleFavoritesOnly?: () => void;
  onToggleFavorite?: (id: string) => void;
  // Stats
  totalStats?: {
    totalAttempts: number;
    uniqueQuizzes: number;
    averageScore: number;
    bestStreak: number;
    totalTimeSpent: number;
  } | null;
}

export function Dashboard({
  quizzes,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onDuplicateQuiz,
  onExportQuiz,
  onPlayQuiz,
  searchQuery = '',
  onSearchChange,
  searchSuggestions = [],
  showFavoritesOnly = false,
  onToggleFavoritesOnly,
  onToggleFavorite,
  totalStats,
}: DashboardProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  
  // Sort quizzes
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    if (sortBy === 'newest') return b.updatedAt - a.updatedAt;
    if (sortBy === 'oldest') return a.updatedAt - b.updatedAt;
    return a.title.localeCompare(b.title);
  });

  // Don't show dashboard if no quizzes and no search
  if (quizzes.length === 0 && !searchQuery) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

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
        {/* Stats Bar */}
        {totalStats && (
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-accent">{totalStats.totalAttempts}</p>
              <p className="text-xs text-text-muted">Total Attempts</p>
            </div>
            <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-accent">{Math.round(totalStats.averageScore)}%</p>
              <p className="text-xs text-text-muted">Avg Score</p>
            </div>
            <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-accent">{totalStats.bestStreak} 🔥</p>
              <p className="text-xs text-text-muted">Best Streak</p>
            </div>
            <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-accent">{formatTime(totalStats.totalTimeSpent)}</p>
              <p className="text-xs text-text-muted">Time Spent</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <h2 className="font-serif text-3xl text-text-primary">Your Quizzes</h2>
            <p className="mt-1 text-text-secondary">
              <span className="text-accent font-medium">{quizzes.length}</span> quiz{quizzes.length !== 1 ? 'zes' : ''} 
              {searchQuery && ' found'}
            </p>
          </div>
          <button
            onClick={onCreateQuiz}
            className="btn-shimmer inline-flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300 group"
          >
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Quiz
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {onSearchChange && (
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search quizzes by title, description, or tags..."
                suggestions={searchSuggestions}
              />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* Favorites filter */}
            {onToggleFavoritesOnly && (
              <button
                onClick={onToggleFavoritesOnly}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  showFavoritesOnly
                    ? 'bg-accent text-bg-primary'
                    : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:border-accent/50'
                }`}
              >
                <svg className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden sm:inline">Favorites</span>
              </button>
            )}

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent/50 cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A-Z</option>
            </select>
          </div>
        </div>

        {/* Quiz Grid or Empty State */}
        {sortedQuizzes.length === 0 ? (
          <div className="text-center py-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-text-primary mb-2">No quizzes found</h3>
            <p className="text-text-secondary text-sm mb-6">
              {searchQuery 
                ? `No quizzes match "${searchQuery}". Try a different search.`
                : showFavoritesOnly
                ? 'No favorite quizzes yet. Click the heart on a quiz to add it.'
                : 'Start by creating your first quiz!'
              }
            </p>
            {searchQuery && onSearchChange && (
              <button
                onClick={() => onSearchChange('')}
                className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedQuizzes.map((quiz, index) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                index={index}
                onEdit={() => onEditQuiz(quiz.id)}
                onDelete={() => onDeleteQuiz(quiz.id)}
                onDuplicate={() => onDuplicateQuiz(quiz.id)}
                onExport={() => onExportQuiz(quiz.id)}
                onPlay={() => onPlayQuiz(quiz.id)}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(quiz.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
