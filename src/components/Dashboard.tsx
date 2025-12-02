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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Check if this is a completely empty state (no quizzes at all, not just filtered)
  const isEmptyState = quizzes.length === 0 && !searchQuery && !showFavoritesOnly;

  return (
    <section
      id="dashboard"
      className="min-h-screen py-16 px-6"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 20% 0%, var(--color-accent-muted) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 90% 100%, var(--color-accent-muted) 0%, transparent 40%),
          var(--color-bg-primary)
        `,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Stats Bar - only show if there are stats */}
        {totalStats && totalStats.totalAttempts > 0 && (
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 text-center hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <p className="text-2xl font-bold text-accent">{totalStats.totalAttempts}</p>
              <p className="text-xs text-text-muted">Total Plays</p>
            </div>
            <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 text-center hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <p className="text-2xl font-bold text-accent">{Math.round(totalStats.averageScore)}%</p>
              <p className="text-xs text-text-muted">Avg Score</p>
            </div>
            <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 text-center hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <p className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                {totalStats.bestStreak}
                <span className="text-orange-400">🔥</span>
              </p>
              <p className="text-xs text-text-muted">Best Streak</p>
            </div>
            <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 text-center hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
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
              {quizzes.length === 0 ? (
                searchQuery || showFavoritesOnly ? 'No quizzes found' : 'Get started by creating your first quiz'
              ) : (
                <>
                  <span className="text-accent font-medium">{quizzes.length}</span> quiz{quizzes.length !== 1 ? 'zes' : ''} 
                  {searchQuery && ' found'}
                </>
              )}
            </p>
          </div>
          <button
            onClick={onCreateQuiz}
            className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 group"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Quiz
          </button>
        </div>

        {/* Search & Filters - show if there are quizzes or active filters */}
        {(quizzes.length > 0 || searchQuery || showFavoritesOnly) && (
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
                      ? 'bg-accent text-bg-primary shadow-lg shadow-accent/20'
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
                className="px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer hover:border-accent/30 transition-all duration-300"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">A-Z</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty State - First time user */}
        {isEmptyState && (
          <div className="text-center py-20 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center animate-float-subtle">
              <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-text-primary mb-3">No quizzes yet</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-8">
              Create your first quiz to get started. You can make multiple-choice, multi-select, or type-in questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onCreateQuiz}
                className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 group"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Quiz
              </button>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: '✨', title: 'Beautiful Templates', desc: 'Start with pre-made quiz templates' },
                { icon: '⏱️', title: 'Timed Quizzes', desc: 'Add time pressure for extra challenge' },
                { icon: '🏆', title: 'Track Progress', desc: 'See your scores and achievements' },
              ].map((feature, idx) => (
                <div
                  key={feature.title}
                  className="p-5 bg-bg-secondary/50 border border-border rounded-xl hover:border-accent/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <span className="text-3xl mb-3 block">{feature.icon}</span>
                  <h4 className="font-medium text-text-primary mb-1">{feature.title}</h4>
                  <p className="text-sm text-text-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtered Empty State */}
        {!isEmptyState && sortedQuizzes.length === 0 && (
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
                : 'No favorite quizzes yet. Click the heart on a quiz to add it.'
              }
            </p>
            {(searchQuery || showFavoritesOnly) && (
              <button
                onClick={() => {
                  if (onSearchChange) onSearchChange('');
                  if (showFavoritesOnly && onToggleFavoritesOnly) onToggleFavoritesOnly();
                }}
                className="px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Quiz Grid */}
        {sortedQuizzes.length > 0 && (
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
