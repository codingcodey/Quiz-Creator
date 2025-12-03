interface HeroProps {
  onCreateQuiz: () => void;
  onExplore: () => void;
  quizCount: number;
}

export function Hero({ onCreateQuiz, onExplore, quizCount }: HeroProps) {
  const handleScrollDown = () => {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-2xl animate-orb-1" />
        <div className="absolute bottom-1/3 left-1/5 w-[300px] h-[300px] bg-accent/10 rounded-full blur-2xl animate-orb-2" />
        
        {/* Sparkle particles */}
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-accent/50 rounded-full animate-sparkle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-accent/40 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-accent/60 rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-accent/50 rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="opacity-0 animate-fade-in-scale stagger-1">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-muted text-accent text-sm font-medium border border-accent/20 hover-lift">
            <svg
              className="w-4 h-4 animate-float-subtle"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Simple. Beautiful. Powerful.
          </span>
        </div>

        {/* Main heading */}
        <h1 className="mt-8 font-serif text-5xl md:text-7xl lg:text-8xl text-text-primary leading-[1.1] opacity-0 animate-fade-in-up stagger-2">
          Craft Beautiful{' '}
          <span className="text-accent italic animate-text-glow">Quizzes</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto opacity-0 animate-fade-in-up stagger-3">
          Create engaging multiple-choice and fill-in-the-blank quizzes in minutes.
          Your data stays secure and synced across devices.
        </p>

        {/* CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-4">
          <button
            onClick={onCreateQuiz}
            className="btn-shimmer group relative inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-hover transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98]"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {quizCount === 0 ? 'Create Your First Quiz' : 'Create New Quiz'}
          </button>

          {/* View Quizzes Button - only show if there are quizzes */}
          {quizCount > 0 && (
            <button
              onClick={handleScrollDown}
              className="inline-flex items-center gap-2 px-6 py-4 bg-bg-secondary/80 border border-border text-text-primary font-medium rounded-xl hover:border-accent/50 hover:text-accent transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              View My Quizzes
            </button>
          )}
        </div>

        {/* Explore Button - below main CTA */}
        <div className="mt-6 opacity-0 animate-fade-in-up stagger-6">
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-6 py-4 bg-bg-secondary border border-border text-text-primary font-medium rounded-xl hover:border-accent/50 hover:text-accent hover:bg-bg-secondary/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explore Quizzes
          </button>
        </div>

        {/* Stats */}
        {quizCount > 0 && (
          <p className="mt-8 text-text-muted text-sm opacity-0 animate-fade-in-up stagger-7">
            You have <span className="text-accent font-medium">{quizCount}</span> quiz{quizCount !== 1 ? 'zes' : ''} saved locally
          </p>
        )}
      </div>

      {/* Scroll down indicator - always show */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hover:text-accent transition-all duration-300 opacity-0 animate-fade-in-up stagger-7 group"
        aria-label="Scroll down"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            {quizCount > 0 ? 'View Quizzes' : 'Get Started'}
          </span>
          <svg
            className="w-6 h-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 animate-fade-in stagger-5" />
    </section>
  );
}
