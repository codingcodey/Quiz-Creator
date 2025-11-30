import { useState } from 'react';
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
