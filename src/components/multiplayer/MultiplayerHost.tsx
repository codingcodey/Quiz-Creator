import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MultiplayerSession, SessionParticipant, ParticipantAnswer } from '../../types/multiplayer';
import type { Question } from '../../types/quiz';
import { getGameMode } from '../../types/gameModes';
import { calculatePoints } from '../../utils/scoring';
import { Leaderboard } from './Leaderboard';
import { ConnectionStatus } from './ConnectionStatus';

interface MultiplayerHostProps {
  session: MultiplayerSession;
  participants: SessionParticipant[];
  questions: Question[];
  connectionStatus?: {
    state: 'connected' | 'connecting' | 'disconnected' | 'error';
    errorMessage?: string;
  };
  onEndGame?: () => void;
  onUpdateSession?: (updates: Partial<MultiplayerSession>) => void;
  onUpdateParticipantScore?: (participantId: string, updates: any) => void;
  onBroadcastEvent?: (eventType: string, data: any) => void;
}

type GameState = 'LOBBY' | 'STARTING' | 'QUESTION_REVEAL' | 'ANSWERING' | 'RESULTS' | 'NEXT' | 'FINISHED';

interface HostGameState {
  gameState: GameState;
  questionIndex: number;
  roundStartTime: number;
  answersCurrent: Map<string, ParticipantAnswer>;
  countdownValue: number | null;
}

export function MultiplayerHost({
  session,
  participants,
  questions,
  connectionStatus,
  onEndGame,
  onUpdateSession,
  onUpdateParticipantScore,
  onBroadcastEvent,
}: MultiplayerHostProps) {
  const gameMode = useMemo(() => getGameMode(session.game_mode), [session.game_mode]);
  const [hostState, setHostState] = useState<HostGameState>({
    gameState: 'LOBBY',
    questionIndex: 0,
    roundStartTime: 0,
    answersCurrent: new Map(),
    countdownValue: null,
  });

  const currentQuestion = useMemo(
    () => (hostState.questionIndex < questions.length ? questions[hostState.questionIndex] : null),
    [questions, hostState.questionIndex]
  );

  const timeElapsed = useMemo(() => {
    if (hostState.roundStartTime === 0) return 0;
    return Date.now() - hostState.roundStartTime;
  }, [hostState.roundStartTime]);

  const questionTimeLimit = useMemo(() => {
    return currentQuestion?.timeLimit || 30000;
  }, [currentQuestion]);

  const isAnsweringTimeUp = timeElapsed >= questionTimeLimit;

  // Broadcast game state changes to all players
  useEffect(() => {
    if (hostState.gameState === 'QUESTION_REVEAL' && currentQuestion) {
      onBroadcastEvent?.('question_revealed', {
        questionIndex: hostState.questionIndex,
        question: currentQuestion,
        timeLimit: questionTimeLimit,
        revealMode: gameMode?.revealPattern || 'host_controlled',
      });
    }
  }, [hostState.gameState, hostState.questionIndex, currentQuestion, questionTimeLimit, gameMode, onBroadcastEvent]);

  // Auto-advance from answering to results when time is up
  useEffect(() => {
    if (hostState.gameState === 'ANSWERING' && isAnsweringTimeUp) {
      const timer = setTimeout(() => {
        handleShowResults();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hostState.gameState, isAnsweringTimeUp]);

  // Countdown timer for starting game
  useEffect(() => {
    if (hostState.countdownValue === null) return;
    if (hostState.countdownValue === 0) {
      setHostState((prev) => ({ ...prev, countdownValue: null }));
      handleStartRound();
      return;
    }

    const timer = setTimeout(() => {
      setHostState((prev) => ({
        ...prev,
        countdownValue: prev.countdownValue !== null ? prev.countdownValue - 1 : null,
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [hostState.countdownValue]);

  const handleStartCountdown = useCallback(() => {
    setHostState((prev) => ({
      ...prev,
      gameState: 'STARTING',
      countdownValue: 3,
    }));
  }, []);

  const handleStartRound = useCallback(() => {
    setHostState((prev) => ({
      ...prev,
      gameState: 'QUESTION_REVEAL',
      roundStartTime: Date.now(),
      answersCurrent: new Map(),
    }));

    onBroadcastEvent?.('round_started', {
      questionIndex: hostState.questionIndex,
    });
  }, [hostState.questionIndex, onBroadcastEvent]);

  const handleShowResults = useCallback(() => {
    setHostState((prev) => ({
      ...prev,
      gameState: 'RESULTS',
    }));

    if (!currentQuestion || !gameMode) return;

    // Calculate scores based on game mode
    const answers = Array.from(hostState.answersCurrent.values());
    participants.forEach((participant) => {
      const answer = answers.find((a) => a.participant_id === participant.id);
      const isCorrect = answer?.is_correct || false;
      const timeToAnswer = answer?.time_taken || questionTimeLimit;

      const points = calculatePoints(
        isCorrect,
        timeToAnswer,
        session.game_mode,
        participant.current_streak,
        participant.mode_data
      );

      onUpdateParticipantScore?.(participant.id, {
        points,
        isCorrect,
        timeToAnswer,
      });
    });

    onBroadcastEvent?.('results_shown', {
      questionIndex: hostState.questionIndex,
      answers: Array.from(hostState.answersCurrent.values()),
    });
  }, [currentQuestion, gameMode, participants, hostState.answersCurrent, questionTimeLimit, session.game_mode, onUpdateParticipantScore, onBroadcastEvent]);

  const handleNextQuestion = useCallback(() => {
    if (hostState.questionIndex >= questions.length - 1) {
      // Game finished
      setHostState((prev) => ({
        ...prev,
        gameState: 'FINISHED',
      }));

      onUpdateSession?.({
        status: 'finished',
        finished_at: Date.now(),
      });

      onBroadcastEvent?.('game_finished', {
        finalLeaderboard: participants,
      });

      return;
    }

    // Move to next question
    setHostState((prev) => ({
      ...prev,
      gameState: 'NEXT',
      questionIndex: prev.questionIndex + 1,
    }));

    setTimeout(() => {
      setHostState((prev) => ({
        ...prev,
        gameState: 'QUESTION_REVEAL',
      }));
    }, 2000);
  }, [hostState.questionIndex, questions.length, participants, onUpdateSession, onBroadcastEvent]);

  const handleSkipQuestion = useCallback(() => {
    setHostState((prev) => ({
      ...prev,
      gameState: 'NEXT',
    }));

    setTimeout(() => {
      handleNextQuestion();
    }, 500);
  }, [handleNextQuestion]);

  const handleEndGame = useCallback(() => {
    if (window.confirm('End game now? This cannot be undone.')) {
      setHostState((prev) => ({
        ...prev,
        gameState: 'FINISHED',
      }));

      onUpdateSession?.({
        status: 'finished',
        finished_at: Date.now(),
      });

      onBroadcastEvent?.('game_ended_early', {
        reason: 'host_ended',
      });

      onEndGame?.();
    }
  }, [onUpdateSession, onBroadcastEvent, onEndGame]);


  // Render based on game state
  if (hostState.gameState === 'LOBBY') {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
        </div>

        <header className="relative z-10 sticky top-0 bg-bg-primary/80 backdrop-blur-md border-b border-border px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="font-serif text-2xl text-text-primary">Waiting to Start</h1>
            <div className="flex items-center gap-3">
              {connectionStatus && <ConnectionStatus status={connectionStatus} />}
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8 flex items-center justify-center">
          <div className="max-w-4xl w-full">
            <p className="text-center text-text-muted mb-12">
              {participants.length < 2
                ? `Waiting for ${2 - participants.length} more player${2 - participants.length !== 1 ? 's' : ''}...`
                : 'Ready to start! All players have joined.'}
            </p>
            <Leaderboard participants={participants} maxDisplay={10} />

            {participants.length >= 2 && (
              <div className="mt-8 flex gap-4 justify-center">
                <button
                  onClick={handleStartCountdown}
                  className="px-12 py-4 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98] transition-all duration-300 text-lg"
                >
                  Start Game
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (hostState.gameState === 'STARTING') {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
        </div>

        <div className="relative z-10 text-center">
          <div className="text-9xl font-bold text-accent mb-8 animate-pulse">
            {hostState.countdownValue || 'Go!'}
          </div>
          <p className="text-xl text-text-muted">Get ready...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">No questions available</p>
          <button
            onClick={onEndGame}
            className="px-6 py-2 bg-error text-white rounded-lg hover:bg-error/80 transition-colors"
          >
            Exit Game
          </button>
        </div>
      </div>
    );
  }

  // Question display states
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-bg-primary/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-text-primary">
              Question {hostState.questionIndex + 1} of {questions.length}
            </h2>
            <p className="text-sm text-text-muted">
              {hostState.gameState === 'ANSWERING'
                ? `${participants.length} players answering...`
                : hostState.gameState === 'RESULTS'
                  ? 'Showing results...'
                  : ''}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {connectionStatus && <ConnectionStatus status={connectionStatus} />}
            <button
              onClick={handleEndGame}
              className="px-4 py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              End Game
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Question Display */}
          <div className="lg:col-span-2">
            <div className="bg-bg-secondary/50 border border-border rounded-2xl p-8 mb-6">
              {/* Question Text */}
              <h3 className="text-2xl font-semibold text-text-primary mb-6">{currentQuestion.text}</h3>

              {/* Question Image */}
              {currentQuestion.image && (
                <img
                  src={currentQuestion.image}
                  alt="Question"
                  className="w-full h-64 object-cover rounded-xl mb-6 border border-border"
                />
              )}

              {/* Options */}
              {currentQuestion.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-bg-tertiary border border-border rounded-xl text-text-primary"
                    >
                      {String.fromCharCode(65 + idx)}: {option.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Game State Info */}
            <div className="bg-bg-secondary/50 border border-border rounded-2xl p-6">
              {hostState.gameState === 'QUESTION_REVEAL' && (
                <div className="space-y-2">
                  <p className="text-text-muted">Revealing question...</p>
                  <button
                    onClick={handleStartRound}
                    className="w-full py-2 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Start Answering Timer
                  </button>
                </div>
              )}

              {hostState.gameState === 'ANSWERING' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-text-muted">Time remaining</p>
                      <p className="text-2xl font-bold text-accent">
                        {Math.max(0, Math.ceil((questionTimeLimit - timeElapsed) / 1000))}s
                      </p>
                    </div>
                    <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-accent h-full transition-all"
                        style={{ width: `${Math.min(100, (timeElapsed / questionTimeLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-text-muted text-center">
                    {participants.filter((p) => hostState.answersCurrent.has(p.id)).length} of {participants.length} answered
                  </p>
                </div>
              )}

              {hostState.gameState === 'RESULTS' && (
                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
                    <p className="text-sm text-accent font-medium mb-2">Correct Answer:</p>
                    <p className="text-text-primary font-semibold">{currentQuestion.options?.find((opt) => opt.isCorrect)?.text || 'N/A'}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 py-2 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                    >
                      Next Question
                    </button>
                    <button
                      onClick={handleSkipQuestion}
                      className="flex-1 py-2 bg-bg-tertiary text-text-primary border border-border rounded-lg hover:bg-bg-primary transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {hostState.gameState === 'NEXT' && (
                <div className="text-center py-4">
                  <p className="text-text-muted mb-2">Preparing next question...</p>
                  <div className="inline-block w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                </div>
              )}

              {hostState.gameState === 'FINISHED' && (
                <div className="text-center space-y-4">
                  <p className="text-2xl font-bold text-accent">Game Complete!</p>
                  <p className="text-text-muted">All questions finished</p>
                  <button
                    onClick={onEndGame}
                    className="w-full py-2 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    View Results & Exit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard participants={participants} compact={true} maxDisplay={8} />
          </div>
        </div>
      </main>
    </div>
  );
}
