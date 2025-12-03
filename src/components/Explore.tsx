import { useState, useMemo } from 'react';
import type { Quiz } from '../types/quiz';
import { QuizCard } from './QuizCard';
import { SearchBar } from './SearchBar';

interface ExploreProps {
  publicQuizzes: Quiz[];
  onPlayQuiz: (id: string) => void;
  onBack: () => void;
}

export function Explore({ publicQuizzes, onPlayQuiz, onBack }: ExploreProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'popular'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort quizzes
  const filteredAndSortedQuizzes = useMemo(() => {
    let result = publicQuizzes;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.description.toLowerCase().includes(query) ||
          q.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Sort
    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'newest') return b.updatedAt - a.updatedAt;
      if (sortBy === 'oldest') return a.updatedAt - b.updatedAt;
      if (sortBy === 'popular') return (b.playCount || 0) - (a.playCount || 0);
      return a.title.localeCompare(b.title);
    });

    return sorted;
  }, [publicQuizzes, searchQuery, sortBy]);

  // Get unique tags for search suggestions
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    publicQuizzes.forEach((q) => q.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [publicQuizzes]);

  return (
    <section className="py-16 px-6 min-h-screen" style={{
      background: `
        radial-gradient(ellipse 80% 50% at 20% 0%, var(--color-accent-muted) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 90% 100%, var(--color-accent-muted) 0%, transparent 40%),
        var(--color-bg-primary)
      `,
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary border border-border text-text-primary hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              title="Go back"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div>
              <h2 className="font-serif text-3xl text-text-primary">Explore Quizzes</h2>
              <p className="mt-1 text-text-secondary">
                Discover <span className="text-accent font-medium">{publicQuizzes.length}</span> public quiz{publicQuizzes.length !== 1 ? 'zes' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        {publicQuizzes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search quizzes by title, description, or tags..."
                suggestions={allTags}
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen((open) => !open)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary hover:border-accent/40 hover:text-accent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 w-full sm:w-auto"
              >
                <span>
                  {sortBy === 'newest' && 'Newest'}
                  {sortBy === 'oldest' && 'Oldest'}
                  {sortBy === 'popular' && 'Most Popular'}
                  {sortBy === 'title' && 'A-Z'}
                </span>
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-bg-secondary border border-border shadow-xl z-30 py-1">
                  {[
                    { value: 'newest' as const, label: 'Newest' },
                    { value: 'oldest' as const, label: 'Oldest' },
                    { value: 'popular' as const, label: 'Most Popular' },
                    { value: 'title' as const, label: 'A-Z' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-bg-tertiary ${
                        sortBy === opt.value ? 'text-accent' : 'text-text-primary'
                      }`}
                    >
                      {sortBy === opt.value && (
                        <span className="text-accent text-xs">✓</span>
                      )}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {publicQuizzes.length === 0 && (
          <div className="text-center py-20 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center animate-float-subtle">
              <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-text-primary mb-3">No public quizzes yet</h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Share your quizzes to let others explore and enjoy them. Create a quiz and enable sharing to get started!
            </p>
            <button
              onClick={onBack}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back Home
            </button>
          </div>
        )}

        {/* No search results */}
        {publicQuizzes.length > 0 && filteredAndSortedQuizzes.length === 0 && (
          <div className="text-center py-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-text-primary mb-2">No quizzes found</h3>
            <p className="text-text-secondary text-sm mb-6">
              No quizzes match "{searchQuery}". Try a different search.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Quiz Grid */}
        {filteredAndSortedQuizzes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedQuizzes.map((quiz, index) => (
              <div key={quiz.id} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.15 + index * 0.05}s` }}>
                <QuizCard
                  quiz={quiz}
                  index={index}
                  onEdit={() => {}} // No edit for public quizzes
                  onDelete={() => {}} // No delete for public quizzes
                  onDuplicate={() => {}} // No duplicate for public quizzes
                  onExport={() => {}} // No export for public quizzes
                  onPlay={() => onPlayQuiz(quiz.id)}
                  isPublicView={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
