interface HeroProps {
  onCreateQuiz: () => void;
  quizCount: number;
}

export function Hero({ onCreateQuiz, quizCount }: HeroProps) {
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-6">
      {/* Background gradient effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="opacity-0 animate-fade-in-up stagger-1">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-muted text-accent text-sm font-medium border border-accent/20">
            <svg
              className="w-4 h-4"
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
          <span className="text-accent italic">Quizzes</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto opacity-0 animate-fade-in-up stagger-3">
          Create engaging multiple-choice and fill-in-the-blank quizzes in minutes.
          No account needed. Your data stays on your device.
        </p>

        {/* CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-4">
          <button
            onClick={onCreateQuiz}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-hover transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:rotate-90"
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
        </div>

        {/* Stats */}
        {quizCount > 0 && (
          <p className="mt-8 text-text-muted text-sm opacity-0 animate-fade-in-up stagger-5">
            You have {quizCount} quiz{quizCount !== 1 ? 'zes' : ''} saved locally
          </p>
        )}
      </div>

      {/* Scroll down indicator */}
      {quizCount > 0 && (
        <button
          onClick={handleScrollDown}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hover:text-accent transition-colors opacity-0 animate-fade-in-up stagger-5 animate-bounce-slow"
          aria-label="Scroll down to view quizzes"
        >
          <svg
            className="w-8 h-8"
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
        </button>
      )}

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
