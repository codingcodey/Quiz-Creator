import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface AuthScreenProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function AuthScreen({ theme, onToggleTheme }: AuthScreenProps) {
  const { signInWithGoogle, signInAsDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDev = import.meta.env.DEV;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50 opacity-0 animate-fade-in stagger-1">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent/8 rounded-full blur-3xl animate-glow-pulse" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-2xl animate-orb-1" />
        <div className="absolute bottom-1/3 left-1/5 w-[350px] h-[350px] bg-accent/12 rounded-full blur-2xl animate-orb-2" />
        <div className="absolute top-2/3 right-1/3 w-[250px] h-[250px] bg-accent/10 rounded-full blur-2xl animate-orb-3" />
        
        {/* Sparkle particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-accent/60 rounded-full animate-sparkle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-accent/50 rounded-full animate-sparkle" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-accent/40 rounded-full animate-sparkle" style={{ animationDelay: '1.4s' }} />
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-accent/50 rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }} />
        <div className="absolute bottom-1/4 right-1/5 w-1.5 h-1.5 bg-accent/60 rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8 opacity-0 animate-fade-in-scale stagger-1">
          <div className="relative animate-float">
            <div className="w-20 h-20 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30 backdrop-blur-sm">
              <svg
                className="w-10 h-10 text-accent drop-shadow-[0_0_8px_var(--color-accent)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            {/* Animated decorative rings */}
            <div className="absolute -inset-3 border border-accent/20 rounded-3xl opacity-0 animate-ring-expand stagger-2 animate-ring-pulse" />
            <div className="absolute -inset-6 border border-accent/10 rounded-[28px] opacity-0 animate-ring-expand stagger-3 animate-ring-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-text-primary leading-tight opacity-0 animate-fade-in-up stagger-2">
            Welcome to{' '}
            <span className="text-accent italic animate-text-glow">Quiz Creator</span>
          </h1>
          <p className="mt-4 text-text-secondary text-lg opacity-0 animate-fade-in-up stagger-3">
            Sign in to create and manage your quizzes
          </p>
        </div>

        {/* Sign in card */}
        <div className="bg-bg-secondary/90 backdrop-blur-md border border-border-subtle rounded-3xl p-8 opacity-0 animate-card-entrance stagger-4 card-elevated">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center animate-shake">
              {error}
            </div>
          )}

          {/* Google sign in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="btn-shimmer w-full flex items-center justify-center gap-3 px-6 py-4 bg-bg-primary border-2 border-border-subtle rounded-xl hover:border-accent/70 hover:bg-bg-tertiary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed group font-semibold"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-text-muted border-t-accent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="text-text-primary font-medium group-hover:text-accent transition-colors duration-300">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Demo mode button (only in development) */}
          {isDev && (
            <button
              onClick={signInAsDemo}
              className="w-full mt-4 py-3 text-text-muted hover:text-text-secondary text-sm transition-all duration-300 border border-dashed border-border-subtle rounded-xl hover:border-border hover:bg-bg-tertiary/50 opacity-0 animate-fade-in stagger-5"
            >
              Try Demo Mode
            </button>
          )}

          {/* Tagline */}
          <p className="mt-6 text-center opacity-0 animate-fade-in stagger-5">
            <span className="text-text-secondary tracking-wide text-sm font-medium">
              One click. Unlimited potential.
            </span>
          </p>
        </div>

        {/* Features preview */}
        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { icon: '✨', label: 'Create', delay: 'stagger-5' },
            { icon: '🎯', label: 'Practice', delay: 'stagger-6' },
            { icon: '📊', label: 'Track', delay: 'stagger-7' },
          ].map((item) => (
            <div
              key={item.label}
              className={`opacity-0 animate-feature-pop ${item.delay} flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 bg-bg-secondary/60 border border-border-subtle rounded-xl hover:border-accent/40 hover:bg-bg-secondary/80 transition-colors duration-300 cursor-default`}
            >
              <span className="text-xl sm:text-2xl">{item.icon}</span>
              <span className="text-text-secondary text-xs sm:text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Animated bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 animate-fade-in stagger-6" />
    </div>
  );
}

