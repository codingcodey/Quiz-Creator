import { useState, useRef } from 'react';
import { useQuizStore } from './hooks/useQuizStore';
import { useTheme } from './hooks/useTheme';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { QuizEditor } from './components/QuizEditor';
import { CreateQuizForm } from './components/CreateQuizForm';
import { QuizPreview } from './components/QuizPreview';
import { ThemeToggle } from './components/ThemeToggle';
import { ErrorBoundary } from './components/ErrorBoundary';
import { createQuiz, type Quiz } from './types/quiz';

type View = 'home' | 'create' | 'editor' | 'preview';

function App() {
  const [view, setView] = useState<View>('home');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [newQuizDraft, setNewQuizDraft] = useState<Quiz | null>(null);
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    quizzes,
    getQuiz,
    saveQuiz,
    deleteQuiz,
    exportQuiz,
    exportQuizData,
  } = useQuizStore();

  const handleCreateQuiz = () => {
    setView('create');
  };

  const handleSubmitNewQuiz = (data: { title: string; description: string; coverImage?: string }) => {
    // Create a draft quiz but DON'T save it to the store yet
    const draft = createQuiz({
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
    });
    setNewQuizDraft(draft);
    setEditingQuizId(null);
    setView('editor');
  };

  const handleEditQuiz = (id: string) => {
    setEditingQuizId(id);
    setView('editor');
  };

  const handlePreviewQuiz = (id: string) => {
    setEditingQuizId(id);
    setView('preview');
  };

  const handleDuplicateQuiz = (id: string) => {
    // Create a draft copy but DON'T save to store yet
    const original = getQuiz(id);
    if (!original) return;
    
    const draft = createQuiz({
      ...original,
      id: crypto.randomUUID(),
      title: original.title,
      questions: original.questions.map((q) => ({
        ...q,
        id: crypto.randomUUID(),
        options: q.options?.map((opt) => ({
          ...opt,
          id: crypto.randomUUID(),
        })),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    setNewQuizDraft(draft);
    setEditingQuizId(null);
    setView('editor');
  };

  const handleBack = () => {
    setEditingQuizId(null);
    setNewQuizDraft(null); // Discard any unsaved new quiz
    setView('home');
  };

  const handleImportQuiz = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Create a draft from imported data but DON'T save to store yet
      const draft = createQuiz({
        ...parsed,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      setNewQuizDraft(draft);
      setEditingQuizId(null);
      setView('editor');
      return true;
    } catch {
      return false;
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleImportQuiz(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Get the quiz being edited - either from store or from draft
  const editingQuiz = editingQuizId ? getQuiz(editingQuizId) : newQuizDraft;

  // Handle saving - clears draft after save
  const handleSaveQuiz = (quiz: Quiz) => {
    saveQuiz(quiz);
    setNewQuizDraft(null);
    setEditingQuizId(quiz.id);
  };

  if (view === 'create') {
    return (
      <ErrorBoundary>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <CreateQuizForm
          onSubmit={handleSubmitNewQuiz}
          onCancel={handleBack}
          onImport={handleImportQuiz}
        />
      </ErrorBoundary>
    );
  }

  if (view === 'editor' && editingQuiz) {
    return (
      <ErrorBoundary>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <QuizEditor
          quiz={editingQuiz}
          onSave={handleSaveQuiz}
          onExport={exportQuizData}
          onBack={handleBack}
        />
      </ErrorBoundary>
    );
  }

  if (view === 'preview' && editingQuiz) {
    return (
      <ErrorBoundary>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <QuizPreview quiz={editingQuiz} onBack={handleBack} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-primary">
        {/* Top left - Import button */}
        <div className="fixed top-4 left-4 z-50">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-accent/50 hover:text-accent transition-all text-sm"
            title="Import Quiz"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Import
          </button>
        </div>
        {/* Top right - Theme toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <Hero onCreateQuiz={handleCreateQuiz} quizCount={quizzes.length} />
        <Dashboard
          quizzes={quizzes}
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
          onDeleteQuiz={deleteQuiz}
          onDuplicateQuiz={handleDuplicateQuiz}
          onExportQuiz={exportQuiz}
          onPreviewQuiz={handlePreviewQuiz}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
