import { useState, useRef } from 'react';
import { useQuizStore } from './hooks/useQuizStore';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './contexts/AuthContext';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { QuizEditor } from './components/QuizEditor';
import { QuizPlayer } from './components/QuizPlayer';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthScreen } from './components/AuthScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { createQuiz, type Quiz } from './types/quiz';

type View = 'home' | 'editor' | 'play';

function App() {
  const [view, setView] = useState<View>('home');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [newQuizDraft, setNewQuizDraft] = useState<Quiz | null>(null);
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quizzes, getQuiz, saveQuiz, deleteQuiz, exportQuiz, exportQuizData } = useQuizStore();
  const { user, loading, signOut } = useAuth();

  const editingQuiz = editingQuizId ? getQuiz(editingQuizId) : newQuizDraft;

  const goHome = () => {
    setEditingQuizId(null);
    setNewQuizDraft(null);
    setView('home');
  };

  // Create new quiz and go directly to editor
  const handleCreateQuiz = () => {
    setNewQuizDraft(createQuiz({ title: '' }));
    setEditingQuizId(null);
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

  const handleSaveQuiz = (quiz: Quiz) => {
    saveQuiz(quiz);
    setNewQuizDraft(null);
    setEditingQuizId(quiz.id);
  };

  const handleDuplicateQuiz = (id: string) => {
    const original = getQuiz(id);
    if (!original) return;
    const draft = createQuiz({
      ...original,
      id: crypto.randomUUID(),
      questions: original.questions.map((q) => ({
        ...q,
        id: crypto.randomUUID(),
        options: q.options?.map((opt) => ({ ...opt, id: crypto.randomUUID() })),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setNewQuizDraft(draft);
    setEditingQuizId(null);
    setView('editor');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
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
        />
      </ErrorBoundary>
    );
  }

  if (view === 'play' && editingQuiz) {
    return (
      <ErrorBoundary>
        <QuizPlayer quiz={editingQuiz} onBack={goHome} theme={theme} onToggleTheme={toggleTheme} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-primary">
        <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
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
            className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent transition-all duration-300 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Import
          </button>
        </div>
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 bg-bg-secondary border border-border rounded-lg">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full border border-border"
              />
            )}
            <span className="text-text-secondary text-sm hidden sm:block max-w-[120px] truncate">
              {user.displayName || user.email}
            </span>
            <button
              onClick={signOut}
              className="text-text-muted hover:text-error transition-colors"
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
          quizzes={quizzes}
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={(id) => { setEditingQuizId(id); setView('editor'); }}
          onDeleteQuiz={deleteQuiz}
          onDuplicateQuiz={handleDuplicateQuiz}
          onExportQuiz={exportQuiz}
          onPlayQuiz={(id) => { setEditingQuizId(id); setView('play'); }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
