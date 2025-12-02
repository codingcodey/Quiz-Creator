import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useQuizStore } from './hooks/useQuizStore';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './contexts/AuthContext';
import { useQuizAttempts } from './hooks/useQuizAttempts';
import { useAchievements, type Achievement } from './hooks/useAchievements';
import { useDebounce } from './hooks/useDebounce';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { QuizEditor } from './components/QuizEditor';
import { QuizPlayer } from './components/QuizPlayer';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthScreen } from './components/AuthScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TemplateSelector } from './components/TemplateSelector';
import { AchievementToast, AchievementShowcase } from './components/AchievementToast';
import { Confetti } from './components/Confetti';
import { Modal } from './components/Modal';
import { createQuiz, generateShareId, type Quiz, type QuizAttempt } from './types/quiz';
import { createQuizFromTemplate } from './data/templates';
import type { QuizTemplate } from './data/templates';

type View = 'home' | 'editor' | 'play';

function App() {
  const [view, setView] = useState<View>('home');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [newQuizDraft, setNewQuizDraft] = useState<Quiz | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showNoQuestionsWarning, setShowNoQuestionsWarning] = useState(false);
  const [quizToPlay, setQuizToPlay] = useState<string | null>(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quizzes, getQuiz, saveQuiz, deleteQuiz, exportQuiz, exportQuizData, updateQuiz } = useQuizStore();
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const { saveAttempt, getAttemptsForQuiz, totalStats } = useQuizAttempts();
  const { 
    achievements, 
    stats: achievementStats, 
    checkQuizCompletion, 
    checkQuizCreated, 
    checkQuizShared 
  } = useAchievements();

  const editingQuiz = editingQuizId ? getQuiz(editingQuizId) : newQuizDraft;

  const isDemo = user?.id === 'demo-user-123';

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter quizzes based on search, folder, and favorites
  const filteredQuizzes = useMemo(() => {
    let result = quizzes;

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.description.toLowerCase().includes(query) ||
          q.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedFolder) {
      result = result.filter((q) => q.folderId === selectedFolder);
    }

    if (showFavoritesOnly) {
      result = result.filter((q) => q.isFavorite);
    }

    return result;
  }, [quizzes, debouncedSearchQuery, selectedFolder, showFavoritesOnly]);

  // Get unique tags for search suggestions
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    quizzes.forEach((q) => q.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [quizzes]);

  const goHome = () => {
    setEditingQuizId(null);
    setNewQuizDraft(null);
    setView('home');
  };

  // Create new quiz - show template selector
  const handleCreateQuiz = () => {
    // In demo mode, limit to one quiz
    if (isDemo && quizzes.length >= 1) {
      setShowSignInPrompt(true);
      return;
    }
    setShowTemplateSelector(true);
  };

  // Create blank quiz directly
  const handleCreateBlankQuiz = () => {
    setNewQuizDraft(createQuiz({ title: '' }));
    setEditingQuizId(null);
    setShowTemplateSelector(false);
    setView('editor');
  };

  // Create quiz from template
  const handleSelectTemplate = (template: QuizTemplate) => {
    const quiz = createQuizFromTemplate(template);
    setNewQuizDraft(quiz);
    setEditingQuizId(null);
    setShowTemplateSelector(false);
    setView('editor');
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const draft = createQuiz({
          ...parsed,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        setNewQuizDraft(draft);
        setEditingQuizId(null);
        setView('editor');
      } catch {
        // Invalid JSON - ignore
      }
    };
    reader.readAsText(file);
  };

  const handleSaveQuiz = useCallback((quiz: Quiz) => {
    const isNew = !quizzes.find((q) => q.id === quiz.id);
    saveQuiz(quiz);
    setNewQuizDraft(null);
    setEditingQuizId(quiz.id);
    
    // Check for creator achievements on new quizzes
    if (isNew) {
      const newAchievements = checkQuizCreated();
      if (newAchievements.length > 0) {
        setNewAchievement(newAchievements[0]);
      }
    }
  }, [quizzes, saveQuiz, checkQuizCreated]);

  const handleDuplicateQuiz = (id: string) => {
    const original = getQuiz(id);
    if (!original) return;
    const draft = createQuiz({
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (Copy)`,
      questions: original.questions.map((q) => ({
        ...q,
        id: crypto.randomUUID(),
        options: q.options?.map((opt) => ({ ...opt, id: crypto.randomUUID() })),
      })),
      settings: { ...original.settings, isPublic: false, shareId: undefined },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setNewQuizDraft(draft);
    setEditingQuizId(null);
    setView('editor');
  };

  // Handle quiz completion from QuizPlayer
  const handleQuizComplete = useCallback((
    quizId: string,
    attempt: Omit<QuizAttempt, 'id' | 'completedAt'>
  ) => {
    const quiz = getQuiz(quizId);

    // Previous attempts for this quiz (for comeback / first-try logic)
    const previousAttempts = getAttemptsForQuiz(quizId);
    const previousScore =
      previousAttempts.length > 0 ? previousAttempts[previousAttempts.length - 1].percentage : undefined;

    // Determine if this is the very first quiz attempt overall
    const priorTotalAttempts = totalStats?.totalAttempts ?? 0;
    const isFirstQuizAttempt = priorTotalAttempts === 0;

    // Save the attempt
    saveAttempt(attempt);
    
    // Increment play count
    if (quiz) {
      updateQuiz(quizId, { playCount: (quiz.playCount || 0) + 1 });
    }
    
    // Check for achievements with enhanced tracking
    const newAchievements = checkQuizCompletion(
      attempt.percentage,
      attempt.maxStreak,
      attempt.timeRemaining,
      attempt.totalQuestions,
      attempt.timeSpent,
      false, // usedHints - could track this in attempt
      quiz?.settings.timerEnabled,
      quiz?.settings.shuffleQuestions || quiz?.settings.shuffleOptions,
      previousScore,
      isFirstQuizAttempt
    );
    
    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
    }
    
    // Show confetti for good scores
    if (attempt.percentage >= 80) {
      setShowConfetti(true);
    }
  }, [saveAttempt, getQuiz, getAttemptsForQuiz, updateQuiz, checkQuizCompletion, totalStats]);

  // Handle enabling sharing
  const handleEnableSharing = useCallback((quizId: string) => {
    const quiz = getQuiz(quizId);
    const shareId = generateShareId();
    updateQuiz(quizId, {
      settings: {
        ...(quiz?.settings || {}),
        isPublic: true,
        shareId,
      } as any,
    });

    // Check for sharing achievement
    const newAchievements = checkQuizShared();
    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
    }

    return shareId;
  }, [updateQuiz, getQuiz, checkQuizShared]);

  // Handle disabling sharing
  const handleDisableSharing = useCallback((quizId: string) => {
    const quiz = getQuiz(quizId);
    if (quiz) {
      updateQuiz(quizId, {
        settings: {
          ...quiz.settings,
          isPublic: false,
          shareId: undefined,
        },
      });
    }
  }, [updateQuiz, getQuiz]);

  // Toggle favorite
  const handleToggleFavorite = useCallback((quizId: string) => {
    const quiz = getQuiz(quizId);
    if (quiz) {
      updateQuiz(quizId, { isFavorite: !quiz.isFavorite });
    }
  }, [updateQuiz, getQuiz]);

  // Note: Modal scroll management is now handled by the Modal component

  // Auto-create a basic quiz for demo mode
  useEffect(() => {
    if (isDemo && quizzes.length === 0) {
      const basicQuiz = createQuiz({
        title: 'My First Quiz',
        description: 'Try editing this quiz or playing it!',
        questions: [
          {
            id: crypto.randomUUID(),
            type: 'multiple-choice',
            text: 'What is 2 + 2?',
            options: [
              { id: crypto.randomUUID(), text: '3', isCorrect: false },
              { id: crypto.randomUUID(), text: '4', isCorrect: true },
              { id: crypto.randomUUID(), text: '5', isCorrect: false },
            ],
          },
        ],
      });
      saveQuiz(basicQuiz);
      // Auto-open the quiz editor
      setEditingQuizId(basicQuiz.id);
      setView('editor');
    }
  }, [isDemo, quizzes.length, saveQuiz]);

  const handlePlayQuiz = useCallback((quizId: string) => {
    // In demo mode, require sign-in before playing
    if (isDemo) {
      setShowSignInPrompt(true);
      return;
    }

    const quiz = getQuiz(quizId);
    if (quiz && quiz.questions.length === 0) {
      setQuizToPlay(quizId);
      setShowNoQuestionsWarning(true);
    } else {
      setEditingQuizId(quizId);
      setView('play');
    }
  }, [getQuiz, isDemo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl animate-glow-pulse" />
        </div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-14 h-14 relative animate-fade-in-scale">
            <div className="absolute inset-0 border-3 border-accent/20 rounded-full" />
            <div className="absolute inset-0 border-3 border-transparent border-t-accent rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
          </div>
          <p className="text-text-secondary text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <ErrorBoundary>
        <AuthScreen theme={theme} onToggleTheme={toggleTheme} />
      </ErrorBoundary>
    );
  }

  if (view === 'editor' && editingQuiz) {
    return (
      <ErrorBoundary>
        <div className="animate-page-enter">
          <QuizEditor
            quiz={editingQuiz}
            onSave={handleSaveQuiz}
            onExport={exportQuizData}
            onBack={isDemo ? () => setShowSignInPrompt(true) : goHome}
            onPlay={() => handlePlayQuiz(editingQuiz.id)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onEnableSharing={() => handleEnableSharing(editingQuiz.id)}
            onDisableSharing={() => handleDisableSharing(editingQuiz.id)}
          />
        </div>
        <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      </ErrorBoundary>
    );
  }

  if (view === 'play' && editingQuiz) {
    return (
      <ErrorBoundary>
        <div className="animate-page-enter">
          <QuizPlayer
            quiz={editingQuiz}
            onBack={goHome}
            onExitDemoMode={isDemo ? () => setShowSignInPrompt(true) : undefined}
            theme={theme}
            onToggleTheme={toggleTheme}
            onComplete={(attempt) => handleQuizComplete(editingQuiz.id, attempt)}
            previousAttempts={getAttemptsForQuiz(editingQuiz.id)}
          />
        </div>
        <Confetti isActive={showConfetti} duration={4000} />
        <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-primary">
        {/* Top bar */}
        <div className="fixed top-4 left-4 z-50 flex items-center gap-3 opacity-0 animate-slide-in-left stagger-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = '';
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group flex items-center gap-2 px-3 py-2.5 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300 text-sm h-10"
          >
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Import
          </button>

          {/* Achievements button */}
          <button
            onClick={() => setShowAchievements(true)}
            className="group flex items-center gap-2 px-3 py-2.5 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300 text-sm h-10"
          >
            <span className="text-base">🏆</span>
            <span className="hidden sm:inline">{achievementStats.unlocked}/{achievementStats.total}</span>
          </button>
        </div>
        
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 opacity-0 animate-slide-in-right stagger-1">
          {/* User info with sign out */}
          <button
            onClick={signOut}
            className="group flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded-lg hover:border-error/50 hover:bg-error/5 transition-all duration-300 h-10"
            title="Sign out"
          >
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name || 'User'}
                className="w-6 h-6 rounded-full border border-border"
              />
            )}
            <span className="text-text-secondary text-sm max-w-[100px] truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
            </span>
            <svg className="w-4 h-4 text-text-muted group-hover:text-error transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        
        <Hero onCreateQuiz={handleCreateQuiz} quizCount={quizzes.length} />
        
        <Dashboard
          quizzes={filteredQuizzes}
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={(id) => { setEditingQuizId(id); setView('editor'); }}
          onDeleteQuiz={deleteQuiz}
          onDuplicateQuiz={handleDuplicateQuiz}
          onExportQuiz={exportQuiz}
          onPlayQuiz={handlePlayQuiz}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchSuggestions={allTags}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
          onToggleFavorite={handleToggleFavorite}
          totalStats={totalStats}
        />

        {/* No Questions Warning Modal */}
        <Modal isOpen={showNoQuestionsWarning} onClose={() => { setShowNoQuestionsWarning(false); setQuizToPlay(null); }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-text-primary">No Questions</h3>
          </div>
          <p className="text-text-secondary mb-6">
            This quiz doesn't have any questions yet. Please add at least one question before playing.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowNoQuestionsWarning(false);
                setQuizToPlay(null);
              }}
              className="px-4 py-2.5 text-text-secondary hover:text-text-primary transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowNoQuestionsWarning(false);
                if (quizToPlay) {
                  setEditingQuizId(quizToPlay);
                  setView('editor');
                  setQuizToPlay(null);
                }
              }}
              className="px-4 py-2.5 bg-accent/20 text-accent border border-accent/30 rounded-xl hover:bg-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20 active:translate-y-0 transition-all duration-300"
            >
              Edit Quiz
            </button>
          </div>
        </Modal>

        {/* Sign In Prompt Modal */}
        <Modal isOpen={showSignInPrompt} onClose={() => setShowSignInPrompt(false)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="font-serif text-xl text-text-primary">Enjoying Quiz Creator?</h3>
          </div>
          <p className="text-text-secondary mb-6">
            Sign in with Google to unlock unlimited quizzes, save your progress, and access all features!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                try {
                  await signInWithGoogle();
                  setShowSignInPrompt(false);
                } catch (error) {
                  console.error('Failed to sign in:', error);
                }
              }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent text-bg-primary rounded-xl hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:translate-y-0 transition-all duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
            <button
              onClick={() => {
                setShowSignInPrompt(false);
              }}
              className="w-full px-4 py-2.5 text-text-secondary hover:text-text-primary transition-all duration-300"
            >
              Continue with Demo
            </button>
          </div>
        </Modal>
        
        {/* Template Selector Modal */}
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={handleSelectTemplate}
          onCreateBlank={handleCreateBlankQuiz}
        />
        
        {/* Achievement Showcase Modal */}
        <AchievementShowcase
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
          achievements={achievements}
          stats={achievementStats}
        />
        
        {/* Achievement Toast */}
        <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
        
        {/* Confetti */}
        <Confetti isActive={showConfetti} duration={4000} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
