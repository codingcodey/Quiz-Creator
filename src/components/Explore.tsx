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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get unique tags for filtering
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    publicQuizzes.forEach((q) => q.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [publicQuizzes]);

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

    // Filter by selected tag
    if (selectedTag) {
      result = result.filter((q) => q.tags?.includes(selectedTag));
    }

    // Sort
    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'newest') return b.updatedAt - a.updatedAt;
      if (sortBy === 'oldest') return a.updatedAt - b.updatedAt;
      if (sortBy === 'popular') return (b.playCount || 0) - (a.playCount || 0);
      return a.title.localeCompare(b.title);
    });

    return sorted;
  }, [publicQuizzes, searchQuery, sortBy, selectedTag]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalPlays = publicQuizzes.reduce((sum, q) => sum + (q.playCount || 0), 0);
    const totalQuestions = publicQuizzes.reduce((sum, q) => sum + q.questions.length, 0);
    return { totalPlays, totalQuestions };
  }, [publicQuizzes]);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 min-h-screen" style={{
      background: `
        radial-gradient(ellipse 80% 50% at 20% 0%, var(--color-accent-muted) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 90% 100%, var(--color-accent-muted) 0%, transparent 40%),
        var(--color-bg-primary)
      `,
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <button
                onClick={onBack}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border text-text-primary hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shrink-0"
                title="Go back"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl text-text-primary mb-2">Explore Quizzes</h1>
                <p className="text-text-secondary text-sm sm:text-base">
                  Discover and play quizzes created by the community
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {publicQuizzes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-bg-secondary/60 border border-border rounded-xl p-3 sm:p-4 text-center hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <p className="text-xl sm:text-2xl font-bold text-accent">{publicQuizzes.length}</p>
                <p className="text-xs sm:text-sm text-text-muted mt-1">Public Quizzes</p>
              </div>
              <div className="bg-bg-secondary/60 border border-border rounded-xl p-3 sm:p-4 text-center hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <p className="text-xl sm:text-2xl font-bold text-accent">{stats.totalPlays}</p>
                <p className="text-xs sm:text-sm text-text-muted mt-1">Total Plays</p>
              </div>
              <div className="bg-bg-secondary/60 border border-border rounded-xl p-3 sm:p-4 text-center hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <p className="text-xl sm:text-2xl font-bold text-accent">{stats.totalQuestions}</p>
                <p className="text-xs sm:text-sm text-text-muted mt-1">Questions</p>
              </div>
              <div className="bg-bg-secondary/60 border border-border rounded-xl p-3 sm:p-4 text-center hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <p className="text-xl sm:text-2xl font-bold text-accent">{allTags.length}</p>
                <p className="text-xs sm:text-sm text-text-muted mt-1">Categories</p>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filters Section */}
        {publicQuizzes.length > 0 && (
          <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Search Bar */}
            <div className="mb-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search quizzes by title, description, or tags..."
                suggestions={allTags}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div className="flex-1 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedTag === null
                        ? 'bg-accent text-bg-primary shadow-lg shadow-accent/25'
                        : 'bg-bg-secondary border border-border text-text-secondary hover:border-accent/50 hover:text-accent'
                    }`}
                  >
                    All
                  </button>
                  {allTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedTag === tag
                          ? 'bg-accent text-bg-primary shadow-lg shadow-accent/25'
                          : 'bg-bg-secondary border border-border text-text-secondary hover:border-accent/50 hover:text-accent'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {allTags.length > 8 && (
                    <span className="px-3 py-1.5 text-sm text-text-muted">
                      +{allTags.length - 8} more
                    </span>
                  )}
                </div>
              )}

              {/* Sort dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSortOpen((open) => !open)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary hover:border-accent/40 hover:text-accent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
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
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-secondary border border-border shadow-xl z-30 py-2">
                      {[
                        { value: 'newest' as const, label: 'Newest First', icon: '🆕' },
                        { value: 'oldest' as const, label: 'Oldest First', icon: '📅' },
                        { value: 'popular' as const, label: 'Most Popular', icon: '🔥' },
                        { value: 'title' as const, label: 'Alphabetical', icon: '🔤' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-bg-tertiary transition-colors ${
                            sortBy === opt.value ? 'text-accent bg-accent/10' : 'text-text-primary'
                          }`}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                          {sortBy === opt.value && (
                            <span className="ml-auto text-accent">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Results count */}
            {filteredAndSortedQuizzes.length !== publicQuizzes.length && (
              <div className="mt-4 text-sm text-text-secondary">
                Showing <span className="text-accent font-medium">{filteredAndSortedQuizzes.length}</span> of {publicQuizzes.length} quizzes
                {selectedTag && (
                  <span className="ml-2">
                    in <span className="text-accent font-medium">{selectedTag}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {publicQuizzes.length === 0 && (
          <div className="text-center py-16 sm:py-24 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center animate-float-subtle">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-text-primary mb-3">No public quizzes yet</h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm sm:text-base px-4">
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
          <div className="text-center py-16 sm:py-20 opacity-0 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-bg-tertiary flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-text-primary mb-3">No quizzes found</h3>
            <p className="text-text-secondary text-sm sm:text-base mb-6 max-w-md mx-auto px-4">
              {searchQuery && `No quizzes match "${searchQuery}".`}
              {selectedTag && `No quizzes found in "${selectedTag}".`}
              {!searchQuery && !selectedTag && 'No quizzes available.'}
              {' Try adjusting your filters.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300"
                >
                  Clear Search
                </button>
              )}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quiz Grid */}
        {filteredAndSortedQuizzes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {filteredAndSortedQuizzes.map((quiz, index) => (
              <div key={quiz.id} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.03}s` }}>
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
