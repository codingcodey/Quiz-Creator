import { useState, useRef } from 'react';
import { useQuizStore } from './hooks/useQuizStore';
import { useTheme } from './hooks/useTheme';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { QuizEditor } from './components/QuizEditor';
import { CreateQuizForm } from './components/CreateQuizForm';
import { ThemeToggle } from './components/ThemeToggle';

type View = 'home' | 'create' | 'editor';

function App() {
  const [view, setView] = useState<View>('home');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    quizzes,
    getQuiz,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    addOption,
    updateOption,
    deleteOption,
    exportQuiz,
    importQuiz,
  } = useQuizStore();

  const handleCreateQuiz = () => {
    setView('create');
  };

  const handleSubmitNewQuiz = (data: { title: string; description: string; coverImage?: string }) => {
    const newQuiz = addQuiz({
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
    });
    setEditingQuizId(newQuiz.id);
    setView('editor');
  };

  const handleEditQuiz = (id: string) => {
    setEditingQuizId(id);
    setView('editor');
  };

  const handleBack = () => {
    setEditingQuizId(null);
    setView('home');
  };

  const handleImportQuiz = (jsonString: string): boolean => {
    const newQuiz = importQuiz(jsonString);
    if (newQuiz) {
      setEditingQuizId(newQuiz.id);
      setView('editor');
      return true;
    }
    return false;
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

  const editingQuiz = editingQuizId ? getQuiz(editingQuizId) : null;

  if (view === 'create') {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <CreateQuizForm
          onSubmit={handleSubmitNewQuiz}
          onCancel={handleBack}
          onImport={handleImportQuiz}
        />
      </>
    );
  }

  if (view === 'editor' && editingQuiz) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <QuizEditor
          quiz={editingQuiz}
          onUpdate={(updates) => updateQuiz(editingQuiz.id, updates)}
          onAddQuestion={(type) => addQuestion(editingQuiz.id, type)}
          onUpdateQuestion={(questionId, updates) =>
            updateQuestion(editingQuiz.id, questionId, updates)
          }
          onDeleteQuestion={(questionId) => deleteQuestion(editingQuiz.id, questionId)}
          onReorderQuestions={(from, to) => reorderQuestions(editingQuiz.id, from, to)}
          onAddOption={(questionId) => addOption(editingQuiz.id, questionId)}
          onUpdateOption={(questionId, optionId, updates) =>
            updateOption(editingQuiz.id, questionId, optionId, updates)
          }
          onDeleteOption={(questionId, optionId) =>
            deleteOption(editingQuiz.id, questionId, optionId)
          }
          onExport={() => exportQuiz(editingQuiz.id)}
          onBack={handleBack}
        />
      </>
    );
  }

  return (
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
        onExportQuiz={exportQuiz}
      />
    </div>
  );
}

export default App;
