import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SessionParticipant, RealtimeEvent } from '../../types/multiplayer';
import type { Question } from '../../types/quiz';
import { Leaderboard } from './Leaderboard';
import { ConnectionStatus } from './ConnectionStatus';

interface MultiplayerGameProps {
  participants: SessionParticipant[];
  questions: Question[];
  userId: string;
  connectionStatus?: {
    state: 'connected' | 'connecting' | 'disconnected' | 'error';
    errorMessage?: string;
  };
  onAnswerQuestion?: (questionIndex: number, selectedOptions: string[], timeTaken: number) => void;
  onLeaveGame?: () => void;
  onReceiveEvent?: (callback: (event: RealtimeEvent) => void) => void;
}

type GameState = 'WAITING' | 'QUESTION_REVEAL' | 'ANSWERING' | 'ANSWERED' | 'RESULTS' | 'NEXT' | 'FINISHED';

interface PlayerGameState {
  gameState: GameState;
  questionIndex: number;
  currentQuestion: Question | null;
  selectedAnswers: string[];
  timeLimit: number;
  timeStarted: number;
  leaderboard: SessionParticipant[];
  answeringFinished: boolean;
}

export function MultiplayerGame({
  participants,
  questions,
  userId,
  connectionStatus,
  onAnswerQuestion,
  onLeaveGame,
  onReceiveEvent,
}: MultiplayerGameProps) {
  const [playerState, setPlayerState] = useState<PlayerGameState>({
    gameState: 'WAITING',
    questionIndex: 0,
    currentQuestion: null,
    selectedAnswers: [],
    timeLimit: 30000,
    timeStarted: 0,
    leaderboard: participants,
    answeringFinished: false,
  });

  const [countdown, setCountdown] = useState<number | null>(null);

  const timeElapsed = useMemo(() => {
    if (playerState.timeStarted === 0) return 0;
    return Date.now() - playerState.timeStarted;
  }, [playerState.timeStarted]);

  const timeRemaining = useMemo(() => {
    const remaining = Math.max(0, playerState.timeLimit - timeElapsed);
    return remaining;
  }, [timeElapsed, playerState.timeLimit]);

  const isTimeUp = timeRemaining === 0;

  // Listen for real-time events from host
  useEffect(() => {
    onReceiveEvent?.((event: RealtimeEvent) => {
      switch (event.type) {
        case 'question_revealed':
          setCountdown(3);
          setPlayerState((prev) => ({
            ...prev,
            gameState: 'QUESTION_REVEAL',
            questionIndex: event.data.questionIndex,
            currentQuestion: event.data.question,
            timeLimit: event.data.timeLimit,
            selectedAnswers: [],
            answeringFinished: false,
          }));
          break;

        case 'round_started':
          setCountdown(null);
          setPlayerState((prev) => ({
            ...prev,
            gameState: 'ANSWERING',
            timeStarted: Date.now(),
          }));
          break;

        case 'results_shown':
          setPlayerState((prev) => ({
            ...prev,
            gameState: 'RESULTS',
            answeringFinished: true,
          }));
          break;

        case 'participant_answered':
          // Update leaderboard with new participant scores
          setPlayerState((prev) => ({
            ...prev,
            leaderboard: participants,
          }));
          break;

        case 'game_finished':
          setPlayerState((prev) => ({
            ...prev,
            gameState: 'FINISHED',
          }));
          break;

        case 'game_ended_early':
          setPlayerState((prev) => ({
            ...prev,
            gameState: 'FINISHED',
          }));
          break;
      }
    });
  }, [onReceiveEvent, participants]);

  // Auto-submit answer when time is up
  useEffect(() => {
    if (playerState.gameState === 'ANSWERING' && isTimeUp && !playerState.answeringFinished) {
      handleSubmitAnswer();
    }
  }, [playerState.gameState, isTimeUp, playerState.answeringFinished]);

  // Countdown timer before answering starts
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      setPlayerState((prev) => ({
        ...prev,
        gameState: 'ANSWERING',
        timeStarted: Date.now(),
      }));
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSelectOption = useCallback((optionId: string) => {
    if (playerState.gameState !== 'ANSWERING' || playerState.answeringFinished) return;

    setPlayerState((prev) => {
      const isMultiple = prev.currentQuestion?.type === 'multi-select';
      let newAnswers = prev.selectedAnswers;

      if (isMultiple) {
        if (newAnswers.includes(optionId)) {
          newAnswers = newAnswers.filter((id) => id !== optionId);
        } else {
          newAnswers = [...newAnswers, optionId];
        }
      } else {
        newAnswers = [optionId];
      }

      return {
        ...prev,
        selectedAnswers: newAnswers,
      };
    });
  }, [playerState.gameState, playerState.answeringFinished]);

  const handleSubmitAnswer = useCallback(() => {
    if (!playerState.currentQuestion) return;

    setPlayerState((prev) => ({
      ...prev,
      gameState: 'ANSWERED',
      answeringFinished: true,
    }));

    onAnswerQuestion?.(playerState.questionIndex, playerState.selectedAnswers, timeElapsed);
  }, [playerState.currentQuestion, playerState.questionIndex, playerState.selectedAnswers, timeElapsed, onAnswerQuestion]);

  const isAnswerSelected = playerState.selectedAnswers.length > 0;

  // Render based on game state
  if (playerState.gameState === 'WAITING') {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="inline-block w-12 h-12 rounded-full border-4 border-accent/30 border-t-accent animate-spin mb-6" />
          <p className="text-xl text-text-primary font-semibold mb-2">Waiting for game to start...</p>
          <p className="text-text-muted mb-8">The host will begin shortly</p>

          <div className="p-4 bg-bg-secondary/50 border border-border rounded-xl mb-4">
            <p className="text-sm text-text-muted mb-2">Players ready</p>
            <p className="text-2xl font-bold text-accent">{participants.length}</p>
          </div>

          {connectionStatus && <ConnectionStatus status={connectionStatus} />}

          <button
            onClick={onLeaveGame}
            className="mt-8 px-6 py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>
    );
  }

  if (playerState.gameState === 'QUESTION_REVEAL' && countdown !== null) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
        </div>

        <div className="relative z-10 text-center">
          <div className="text-8xl font-bold text-accent mb-8 animate-pulse">{countdown}</div>
          <p className="text-lg text-text-muted">Get ready to answer...</p>
        </div>
      </div>
    );
  }

  if (!playerState.currentQuestion) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Waiting for next question...</p>
          <button
            onClick={onLeaveGame}
            className="px-6 py-2 bg-error text-white rounded-lg hover:bg-error/80 transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-bg-primary/80 backdrop-blur-md border-b border-border px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-text-primary">
              Question {playerState.questionIndex + 1} of {questions.length}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-1 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{
                    width: `${((playerState.questionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-text-muted">{Math.round(((playerState.questionIndex + 1) / questions.length) * 100)}%</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectionStatus && <ConnectionStatus status={connectionStatus} />}
            <button
              onClick={onLeaveGame}
              className="px-3 py-1.5 text-error hover:bg-error/10 rounded-lg transition-colors text-sm"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Answering State */}
          {(playerState.gameState === 'ANSWERING' || playerState.gameState === 'ANSWERED') && (
            <div className="space-y-6">
              {/* Timer */}
              <div className="bg-bg-secondary/50 border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-text-muted text-sm">Time Remaining</p>
                  <p
                    className={`text-4xl font-bold font-mono ${
                      timeRemaining < 5000 ? 'text-error animate-pulse' : 'text-accent'
                    }`}
                  >
                    {Math.ceil(timeRemaining / 1000)}s
                  </p>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${timeRemaining < 5000 ? 'bg-error' : 'bg-accent'}`}
                    style={{ width: `${Math.max(0, (timeRemaining / playerState.timeLimit) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-bg-secondary/50 border border-border rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-text-primary mb-6">{playerState.currentQuestion.text}</h3>

                {playerState.currentQuestion.image && (
                  <img
                    src={playerState.currentQuestion.image}
                    alt="Question"
                    className="w-full h-80 object-cover rounded-xl mb-6 border border-border"
                  />
                )}

                {/* Options */}
                {playerState.currentQuestion.options && (
                  <div className="space-y-3">
                    {playerState.currentQuestion.options.map((option, idx) => {
                      const isSelected = playerState.selectedAnswers.includes(String(idx));
                      const isCorrect = option.isCorrect === true;
                      const showResult = playerState.gameState === 'ANSWERED' || playerState.gameState === 'RESULTS';

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(String(idx))}
                          disabled={playerState.gameState !== 'ANSWERING'}
                          className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                            showResult && isCorrect
                              ? 'bg-success/10 border-success text-success'
                              : showResult && isSelected && !isCorrect
                                ? 'bg-error/10 border-error text-error'
                                : isSelected
                                  ? 'bg-accent/20 border-accent text-text-primary'
                                  : 'bg-bg-tertiary border-border text-text-primary hover:border-accent/50'
                          } ${playerState.gameState !== 'ANSWERING' ? 'cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-bold text-lg flex-shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1">{option.text}</span>
                            {showResult && isCorrect && <span className="text-lg flex-shrink-0">✓</span>}
                            {showResult && isSelected && !isCorrect && <span className="text-lg flex-shrink-0">✗</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {playerState.gameState === 'ANSWERING' && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!isAnswerSelected || playerState.answeringFinished}
                    className="flex-1 py-4 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {isTimeUp ? 'Submitted' : 'Submit Answer'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results State */}
          {playerState.gameState === 'RESULTS' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <p className="text-text-muted mb-2">Waiting for other players...</p>
                <div className="inline-block w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              </div>
              <Leaderboard participants={playerState.leaderboard} highlightUserId={userId} />
            </div>
          )}

          {/* Finished State */}
          {playerState.gameState === 'FINISHED' && (
            <div className="space-y-6 text-center py-12">
              <div className="text-5xl font-bold text-accent mb-4">Game Complete!</div>
              <p className="text-text-muted mb-8">Check the big screen for final results</p>
              <button
                onClick={onLeaveGame}
                className="px-12 py-4 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-hover transition-colors inline-block"
              >
                View Results
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
