import { useState, useRef, useMemo, useCallback } from 'react';
import { useQuizStore } from './hooks/useQuizStore';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './contexts/AuthContext';
import { useQuizAttempts } from './hooks/useQuizAttempts';
import { useAchievements, type Achievement } from './hooks/useAchievements';
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
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quizzes, getQuiz, saveQuiz, deleteQuiz, exportQuiz, exportQuizData, updateQuiz } = useQuizStore();
  const { user, loading, signOut } = useAuth();
  const { saveAttempt, getAttemptsForQuiz, totalStats } = useQuizAttempts();
  const { 
    achievements, 
    stats: achievementStats, 
    checkQuizCompletion, 
    checkQuizCreated, 
    checkQuizShared 
  } = useAchievements();

  const editingQuiz = editingQuizId ? getQuiz(editingQuizId) : newQuizDraft;

  // Filter quizzes based on search, folder, and favorites
  const filteredQuizzes = useMemo(() => {
    let result = quizzes;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
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
  }, [quizzes, searchQuery, selectedFolder, showFavoritesOnly]);

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
    // Save the attempt
    saveAttempt(attempt);
    
    // Increment play count
    const quiz = getQuiz(quizId);
    if (quiz) {
      updateQuiz(quizId, { playCount: (quiz.playCount || 0) + 1 });
    }
    
    // Check for achievements
    const newAchievements = checkQuizCompletion(
      attempt.percentage,
      attempt.maxStreak,
      attempt.timeRemaining
    );
    
    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
    }
    
    // Show confetti for good scores
    if (attempt.percentage >= 80) {
      setShowConfetti(true);
    }
  }, [saveAttempt, getQuiz, updateQuiz, checkQuizCompletion]);

  // Handle enabling sharing
  const handleEnableSharing = useCallback((quizId: string) => {
    const shareId = generateShareId();
    updateQuiz(quizId, {
      settings: {
        ...getQuiz(quizId)?.settings,
        isPublic: true,
        shareId,
      },
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl animate-glow-pulse" />
        </div>
        <div className="flex flex-col items-center gap-4 relative z-10 animate-fade-in">
          <div className="w-12 h-12 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary">Loading...</p>
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
        <QuizEditor
          quiz={editingQuiz}
          onSave={handleSaveQuiz}
          onExport={exportQuizData}
          onBack={goHome}
          theme={theme}
          onToggleTheme={toggleTheme}
          onEnableSharing={() => handleEnableSharing(editingQuiz.id)}
          onDisableSharing={() => handleDisableSharing(editingQuiz.id)}
        />
        <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      </ErrorBoundary>
    );
  }

  if (view === 'play' && editingQuiz) {
    return (
      <ErrorBoundary>
        <QuizPlayer
          quiz={editingQuiz}
          onBack={goHome}
          theme={theme}
          onToggleTheme={toggleTheme}
          onComplete={(attempt) => handleQuizComplete(editingQuiz.id, attempt)}
          previousAttempts={getAttemptsForQuiz(editingQuiz.id)}
        />
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
            className="group flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300 text-sm"
          >
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Import
          </button>
          
          {/* Achievements button */}
          <button
            onClick={() => setShowAchievements(true)}
            className="group flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300 text-sm"
          >
            <span className="text-base">🏆</span>
            <span className="hidden sm:inline">{achievementStats.unlocked}/{achievementStats.total}</span>
          </button>
        </div>
        
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 opacity-0 animate-slide-in-right stagger-1">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 bg-bg-secondary border border-border rounded-lg hover:border-accent/30 transition-colors duration-300">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name || 'User'}
                className="w-7 h-7 rounded-full border border-border transition-transform duration-300 hover:scale-110"
              />
            )}
            <span className="text-text-secondary text-sm hidden sm:block max-w-[120px] truncate">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={signOut}
              className="text-text-muted hover:text-error hover:scale-110 active:scale-95 transition-all duration-200"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
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
          onPlayQuiz={(id) => { setEditingQuizId(id); setView('play'); }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchSuggestions={allTags}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
          onToggleFavorite={handleToggleFavorite}
          totalStats={totalStats}
        />
        
        {/* Template Selector Modal */}
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={handleSelectTemplate}
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
