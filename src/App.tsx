import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useQuizStore } from './hooks/useQuizStore';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './contexts/AuthContext';
import { useQuizAttempts } from './hooks/useQuizAttempts';
import { useAchievements, type Achievement } from './hooks/useAchievements';
import { useDebounce } from './hooks/useDebounce';
import { useMultiplayerSession } from './hooks/useMultiplayerSession';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { Explore } from './components/Explore';
import { QuizEditor } from './components/QuizEditor';
import { QuizPlayer } from './components/QuizPlayer';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthScreen } from './components/AuthScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TemplateSelector } from './components/TemplateSelector';
import { Avatar } from './components/Avatar';
import { AchievementToast, AchievementShowcase } from './components/AchievementToast';
import { Confetti } from './components/Confetti';
import { Modal } from './components/Modal';
import { SignInPromptModal } from './components/SignInPromptModal';
import { ModeSelector } from './components/multiplayer/ModeSelector';
import { GameModeSelector } from './components/multiplayer/GameModeSelector';
import { JoinRoomModal } from './components/multiplayer/JoinRoomModal';
import { MultiplayerLobby } from './components/multiplayer/MultiplayerLobby';
import { MultiplayerHost } from './components/multiplayer/MultiplayerHost';
import { MultiplayerGame } from './components/multiplayer/MultiplayerGame';
import { Podium } from './components/multiplayer/Podium';
import { createQuiz, generateShareId, type Quiz, type QuizAttempt } from './types/quiz';
import { createQuizFromTemplate } from './data/templates';
import type { QuizTemplate } from './data/templates';
import type { MultiplayerSession, SessionParticipant } from './types/multiplayer';

type View = 'home' | 'editor' | 'play' | 'explore' | 'multiplayer_mode_select' | 'multiplayer_join' | 'multiplayer_lobby' | 'multiplayer_host' | 'multiplayer_game' | 'multiplayer_results';

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

  // Multiplayer state
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [multiplayerQuizToPlay, setMultiplayerQuizToPlay] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<MultiplayerSession | null>(null);
  const [sessionParticipants, setSessionParticipants] = useState<SessionParticipant[]>([]);
  const [multiplayerLoading, setMultiplayerLoading] = useState(false);
  const [multiplayerError, setMultiplayerError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const multiplayerSession = useMultiplayerSession();

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

  // Get public quizzes from all users
  const publicQuizzes = useMemo(() => {
    return quizzes.filter((q) => q.settings?.isPublic);
  }, [quizzes]);

  // Multiplayer handlers
const handleSelectPlayMode = useCallback(
    (mode: 'solo' | 'multiplayer') => {
      if (mode === 'solo') {
        if (multiplayerQuizToPlay) {
          setEditingQuizId(multiplayerQuizToPlay);
          setView('play');
          setMultiplayerQuizToPlay(null);
        }
      } else {
        // Multiplayer
        setView('multiplayer_mode_select');
      }
      setShowModeSelector(false);
    },
    [multiplayerQuizToPlay]
  );

  const handleCreateMultiplayerGame = useCallback(
    async (gameMode: string, modeConfig: Record<string, any>) => {
      if (!multiplayerQuizToPlay || !user) return;

      const quiz = getQuiz(multiplayerQuizToPlay);
      if (!quiz) return;

      setMultiplayerLoading(true);
      setMultiplayerError(null);

      try {
        const session = await multiplayerSession.createSession(
          multiplayerQuizToPlay,
          quiz,
          gameMode,
          modeConfig,
          user.id
        );

        if (!session) {
          throw new Error('Failed to create session');
        }

        // Join as host
        const participant = await multiplayerSession.joinSession(
          session.id,
          user.id,
          user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
          user.user_metadata?.avatar_url
        );

        if (!participant) {
          throw new Error('Failed to join session');
        }

        setCurrentSession(session);
        setSessionParticipants([participant]);
        setView('multiplayer_lobby');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create game';
        setMultiplayerError(errorMessage);
        console.error('Error creating multiplayer game:', error);
      } finally {
        setMultiplayerLoading(false);
      }
    },
    [multiplayerQuizToPlay, user, getQuiz, multiplayerSession]
  );

  const handleJoinMultiplayerGame = useCallback(
    async (roomCode: string) => {
      if (!user) return;

      setMultiplayerLoading(true);
      setMultiplayerError(null);

      try {
        const session = await multiplayerSession.getSessionByRoomCode(roomCode);

        if (!session) {
          throw new Error('Room not found');
        }

        // Join as player
        const participant = await multiplayerSession.joinSession(
          session.id,
          user.id,
          user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
          user.user_metadata?.avatar_url
        );

        if (!participant) {
          throw new Error('Failed to join session');
        }

        // Get all participants
        const participants = await multiplayerSession.getParticipants(session.id);

        setCurrentSession(session);
        setSessionParticipants(participants);
        setView('multiplayer_lobby');
        setShowJoinRoomModal(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to join game';
        setMultiplayerError(errorMessage);
        console.error('Error joining multiplayer game:', error);
      } finally {
        setMultiplayerLoading(false);
      }
    },
    [user, multiplayerSession]
  );

  const handleLeaveMultiplayerGame = useCallback(async () => {
    if (!currentSession || !user) return;

    try {
      const participant = sessionParticipants.find((p) => p.user_id === user.id);
      if (participant) {
        await multiplayerSession.leaveSession(currentSession.id, participant.id);
      }

      setCurrentSession(null);
      setSessionParticipants([]);
      setView('home');
      setMultiplayerQuizToPlay(null);
    } catch (error) {
      console.error('Error leaving multiplayer game:', error);
    }
  }, [currentSession, user, sessionParticipants, multiplayerSession]);

  const handleStartGame = useCallback(async () => {
    if (!currentSession) return;
    setGameStarted(true);
    const isHost = currentSession.host_user_id === user?.id;
    setView(isHost ? 'multiplayer_host' : 'multiplayer_game');

    // Update session status to in_progress
    await multiplayerSession.updateSessionStatus(currentSession.id, 'in_progress');
  }, [currentSession, user, multiplayerSession]);

  const handleFinishGame = useCallback(() => {
    setGameStarted(false);
    setGameFinished(true);
    setView('multiplayer_results');
  }, []);

  const handleExitGame = useCallback(async () => {
    await handleLeaveMultiplayerGame();
    setGameStarted(false);
    setGameFinished(false);
  }, [handleLeaveMultiplayerGame]);

  const goHome = () => {
    if (isDemo) {
      // In demo mode, always return to the demo quiz editor instead of the home dashboard
      const targetQuizId = editingQuizId || quizzes[0]?.id || null;
      if (targetQuizId) {
        setEditingQuizId(targetQuizId);
        setView('editor');
      }
      return;
    }
    setEditingQuizId(null);
    setNewQuizDraft(null);
    setView('home');
  };

  const handleExplore = () => {
    setView('explore');
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

  // Handle Google sign-in from demo mode
  const handleDemoGoogleSignIn = useCallback(async () => {
    try {
      if (isDemo) {
        setShowSignInPrompt(false);
        // Reset view state to ensure we don't show home
        setView('home');
        setEditingQuizId(null);
        setNewQuizDraft(null);
        // Sign out to show AuthScreen - don't trigger OAuth immediately
        // The AuthScreen will have its own "Sign in with Google" button
        await signOut();
      }
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }, [isDemo, signOut]);


  // Demo mode: always work in a blank, unsaved quiz and never show the home page
  useEffect(() => {
    if (!isDemo) return;

    if (view === 'home') {
      if (!newQuizDraft && !editingQuiz) {
        const blankQuiz = createQuiz({ title: '' });
        setNewQuizDraft(blankQuiz);
      }
      setEditingQuizId(null);
      setView('editor');
    }
  }, [isDemo, view, newQuizDraft, editingQuiz]);

  const handlePlayQuiz = useCallback(
    (quizId: string) => {
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
        // Show mode selector (solo or multiplayer)
        setMultiplayerQuizToPlay(quizId);
        setShowModeSelector(true);
      }
    },
    [getQuiz, isDemo]
  );

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
            disableLeaveConfirm={isDemo}
            theme={theme}
            onToggleTheme={toggleTheme}
            onEnableSharing={() => handleEnableSharing(editingQuiz.id)}
            onDisableSharing={() => handleDisableSharing(editingQuiz.id)}
          />
        </div>
        <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
        {/* Sign In Prompt Modal (also available while editing) */}
        <SignInPromptModal isOpen={showSignInPrompt} onClose={() => setShowSignInPrompt(false)} onSignIn={handleDemoGoogleSignIn} />
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
        {/* Sign In Prompt Modal (also available while playing) */}
        <SignInPromptModal isOpen={showSignInPrompt} onClose={() => setShowSignInPrompt(false)} onSignIn={handleDemoGoogleSignIn} />
      </ErrorBoundary>
    );
  }

  if (view === 'explore') {
    return (
      <ErrorBoundary>
        <div className="animate-page-enter">
          <Explore
            publicQuizzes={publicQuizzes}
            onPlayQuiz={handlePlayQuiz}
            onBack={goHome}
          />
        </div>
        <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
        {/* Sign In Prompt Modal (also available while exploring) */}
        <SignInPromptModal isOpen={showSignInPrompt} onClose={() => setShowSignInPrompt(false)} onSignIn={handleDemoGoogleSignIn} />
      </ErrorBoundary>
    );
  }

  // Multiplayer Mode Selection
  if (view === 'multiplayer_mode_select') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
            <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
          </div>

          <div className="relative z-10 max-w-2xl w-full">
            <button
              onClick={() => setView('home')}
              className="mb-6 flex items-center gap-2 px-3 py-2.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>

            <h2 className="font-serif text-3xl text-text-primary mb-2">Play Multiplayer</h2>
            <p className="text-text-secondary mb-8">Would you like to host a game or join an existing one?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Host Game */}
              <button
                onClick={() => setShowGameModeSelector(true)}
                disabled={multiplayerLoading}
                className="group p-8 bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent rounded-2xl hover:border-accent hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎮</div>
                <h3 className="font-serif text-xl text-accent mb-2">Host Game</h3>
                <p className="text-sm text-text-secondary">Choose a game mode and create a room</p>
              </button>

              {/* Join Game */}
              <button
                onClick={() => setShowJoinRoomModal(true)}
                disabled={multiplayerLoading}
                className="group p-8 bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border rounded-2xl hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔗</div>
                <h3 className="font-serif text-xl text-text-primary mb-2">Join Game</h3>
                <p className="text-sm text-text-secondary">Enter a room code to join a friend&apos;s game</p>
              </button>
            </div>
          </div>
        </div>

        <JoinRoomModal
          isOpen={showJoinRoomModal}
          onClose={() => setShowJoinRoomModal(false)}
          onJoin={handleJoinMultiplayerGame}
          isLoading={multiplayerLoading}
          error={multiplayerError}
        />

        <ModeSelector
          isOpen={showModeSelector}
          onClose={() => {
            setShowModeSelector(false);
            setMultiplayerQuizToPlay(null);
          }}
          onSelectMode={handleSelectPlayMode}
          isLoading={false}
        />

        <GameModeSelector
          isOpen={showGameModeSelector}
          onClose={() => setShowGameModeSelector(false)}
          onSelectMode={async (mode) => {
            if (!multiplayerQuizToPlay || !user) return;
            const quiz = getQuiz(multiplayerQuizToPlay);
            if (quiz) {
              await handleCreateMultiplayerGame(mode.id, mode.config?.[0]?.default || {});
            }
          }}
        />
      </ErrorBoundary>
    );
  }

  // Multiplayer Lobby
  if (view === 'multiplayer_lobby' && currentSession) {
    const isHost = currentSession.host_user_id === user?.id;
    return (
      <ErrorBoundary>
        <div className="animate-page-enter">
          <MultiplayerLobby
            session={currentSession}
            participants={sessionParticipants}
            userId={user?.id || ''}
            isHost={isHost}
            onStart={handleStartGame}
            onKickPlayer={async (participantId) => {
              await multiplayerSession.kickParticipant(participantId);
              const updated = await multiplayerSession.getParticipants(currentSession.id);
              setSessionParticipants(updated);
            }}
            onLeave={handleLeaveMultiplayerGame}
            isLoading={multiplayerLoading}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Multiplayer Host Game
  if (view === 'multiplayer_host' && currentSession && gameStarted) {
    const quiz = getQuiz(multiplayerQuizToPlay || '');
    return (
      <ErrorBoundary>
        <div className="animate-page-enter">
          <MultiplayerHost
            session={currentSession}
            participants={sessionParticipants}
            questions={quiz?.questions || []}
            connectionStatus={{
              state: 'connected',
              errorMessage: undefined,
            }}
            onEndGame={handleFinishGame}
            onUpdateSession={() => {}}
            onUpdateParticipantScore={() => {}}
            onBroadcastEvent={() => {}}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Multiplayer Game (Player View)
  if (view === 'multiplayer_game' && currentSession && gameStarted) {
    const quiz = getQuiz(multiplayerQuizToPlay || '');
    return (
      <ErrorBoundary>
        <div className="animate-page-enter">
          <MultiplayerGame
            participants={sessionParticipants}
            questions={quiz?.questions || []}
            userId={user?.id || ''}
            connectionStatus={{
              state: 'connected',
              errorMessage: undefined,
            }}
            onAnswerQuestion={() => {}}
            onLeaveGame={handleExitGame}
            onReceiveEvent={() => {}}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Multiplayer Results
  if (view === 'multiplayer_results' && currentSession && gameFinished) {
    const quiz = getQuiz(multiplayerQuizToPlay || '');
    return (
      <ErrorBoundary>
        <div className="animate-page-enter">
          <Podium
            participants={sessionParticipants}
            totalQuestions={quiz?.questions.length || 0}
            currentUserId={user?.id}
            gameMode={currentSession?.game_mode}
            onPlayAgain={async () => {
              // Reset game state and return to lobby
              setGameStarted(false);
              setGameFinished(false);
              setView('multiplayer_lobby');
            }}
            onExit={handleExitGame}
          />
        </div>
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
            <span>{achievementStats.unlocked}/{achievementStats.total}</span>
          </button>
        </div>
        
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 opacity-0 animate-slide-in-right stagger-1">
          {/* User info with sign out */}
          <button
            type="button"
            onClick={signOut}
            className="group flex items-center gap-2 px-3 py-2 bg-bg-secondary text-text-secondary border border-border rounded-lg appearance-none transition-all duration-300 h-10 hover:bg-bg-tertiary hover:border-border hover:text-error/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-error/20"
            title="Sign out"
          >
            <Avatar
              avatarUrl={user.user_metadata?.avatar_url}
              fullName={user.user_metadata?.full_name}
              email={user.email}
              className="w-6 h-6"
            />
            <span className="text-text-secondary text-sm max-w-[100px] truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
            </span>
            <svg className="w-4 h-4 text-text-muted group-hover:text-error transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        
        <Hero onCreateQuiz={handleCreateQuiz} onExplore={handleExplore} quizCount={quizzes.length} />

        <Dashboard
          quizzes={filteredQuizzes}
          onCreateQuiz={handleCreateQuiz}
          onExplore={handleExplore}
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
        <SignInPromptModal isOpen={showSignInPrompt} onClose={() => setShowSignInPrompt(false)} onSignIn={handleDemoGoogleSignIn} />
        
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
