import { useState, useEffect, useCallback } from 'react';
import type { MultiplayerSession, SessionParticipant, GameMode } from '../../types/multiplayer';
import { getGameMode } from '../../types/gameModes';
import { ConnectionStatus } from './ConnectionStatus';
import { LobbyChat, type ChatMessage } from './LobbyChat';

interface MultiplayerLobbyProps {
  session: MultiplayerSession;
  participants: SessionParticipant[];
  userId: string;
  isHost: boolean;
  onStart?: () => void;
  onKickPlayer?: (participantId: string) => void;
  onLeave?: () => void;
  connectionStatus?: {
    state: 'connected' | 'connecting' | 'disconnected' | 'error';
    errorMessage?: string;
  };
  isLoading?: boolean;
}

export function MultiplayerLobby({
  session,
  participants,
  userId,
  isHost,
  onStart,
  onKickPlayer,
  onLeave,
  connectionStatus,
  isLoading = false,
}: MultiplayerLobbyProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Update selected mode when session mode changes
  useEffect(() => {
    const mode = getGameMode(session.game_mode);
    setSelectedMode(mode || null);
  }, [session.game_mode]);

  const canStart = participants.length >= 2 && !isLoading;
  const quizTitle = session.quiz_snapshot?.title || 'Quiz';
  const quizDescription = session.quiz_snapshot?.description;
  const quizCoverImage = session.quiz_snapshot?.coverImage;
  const totalQuestions = session.quiz_snapshot?.questions?.length || 0;


  const handleStart = useCallback(() => {
    if (canStart) {
      onStart?.();
    }
  }, [canStart, onStart]);

  const handleKickPlayer = useCallback(
    (participantId: string) => {
      onKickPlayer?.(participantId);
    },
    [onKickPlayer]
  );

  const handleLeave = useCallback(() => {
    if (window.confirm('Are you sure you want to leave the room?')) {
      onLeave?.();
    }
  }, [onLeave]);

  const handleSendMessage = useCallback((message: string) => {
    // Get the current user's name from participants
    const currentUser = participants.find(p => p.user_id === userId);
    const userName = currentUser?.display_name || 'Anonymous';

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      userId,
      displayName: userName,
      message,
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, newMessage]);
  }, [userId, participants]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-bg-primary/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-3 py-2.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>

            <div>
              <h1 className="font-serif text-2xl text-text-primary">{quizTitle}</h1>
              <p className="text-sm text-text-muted">{totalQuestions} questions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {connectionStatus && <ConnectionStatus status={connectionStatus} />}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Room Code & Quiz Info */}
          <div className="lg:col-span-1">
            {/* Room Code */}
            <div className="bg-bg-secondary/50 border border-border rounded-2xl p-6 mb-6 text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Room Code</p>
              <div className="text-5xl font-bold text-accent font-mono mb-4 tracking-widest">
                {session.room_code}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(session.room_code);
                }}
                className="w-full py-2 text-sm bg-accent/20 text-accent hover:bg-accent/30 rounded-lg transition-colors"
              >
                Copy Code
              </button>
            </div>

            {/* Quiz Preview */}
            {quizCoverImage && (
              <div className="mb-6">
                <img
                  src={quizCoverImage}
                  alt={quizTitle}
                  className="w-full h-40 object-cover rounded-xl border border-border"
                />
              </div>
            )}

            {quizDescription && (
              <div className="bg-bg-secondary/50 border border-border rounded-xl p-4 mb-6">
                <p className="text-sm text-text-secondary">{quizDescription}</p>
              </div>
            )}
          </div>

          {/* Middle: Participants */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary/50 border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span>👥 Players</span>
                <span className="text-sm text-accent">({participants.length})</span>
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {participants.map((participant) => {
                  const isCurrentUser = participant.user_id === userId;
                  const isHostUser = session.host_user_id === participant.user_id;

                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isCurrentUser
                          ? 'bg-accent/10 border border-accent/30'
                          : 'bg-bg-tertiary hover:bg-bg-primary'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {participant.avatar_url ? (
                          <img
                            src={participant.avatar_url}
                            alt={participant.display_name}
                            className="w-10 h-10 rounded-full border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                            {participant.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name & Status */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {participant.display_name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {isHostUser ? (
                            <span className="text-accent font-medium">👑 Host</span>
                          ) : isCurrentUser ? (
                            <span className="text-accent">You</span>
                          ) : (
                            <span>Ready</span>
                          )}
                        </p>
                      </div>

                      {/* Kick button (host only) */}
                      {isHost && !isHostUser && !isCurrentUser && (
                        <button
                          onClick={() => handleKickPlayer(participant.id)}
                          className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
                          title="Kick player"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {participants.length < 2 && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-xs text-warning">
                    ⚠️ Need at least 2 players to start
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Game Mode & Start */}
          <div className="lg:col-span-1">
            {/* Game Mode Selection */}
            <div className="bg-bg-secondary/50 border border-border rounded-2xl p-6 mb-6">
              <h2 className="font-semibold text-text-primary mb-4">Game Mode</h2>

              {selectedMode ? (
                <div className="bg-bg-tertiary rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{selectedMode.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{selectedMode.name}</h3>
                      <p className="text-xs text-text-muted mt-1">{selectedMode.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted mb-4">No mode selected</p>
              )}

              {isHost && !selectedMode && (
                <p className="text-xs text-text-muted text-center">Mode selected during game creation</p>
              )}
            </div>

            {/* Start Game Button */}
            {isHost && (
              <button
                onClick={handleStart}
                disabled={!canStart || isLoading}
                className="w-full py-4 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-bg-primary/30 border-t-bg-primary animate-spin" />
                    Starting...
                  </span>
                ) : participants.length < 2 ? (
                  'Waiting for Players...'
                ) : (
                  'Start Game'
                )}
              </button>
            )}

            {!isHost && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-center">
                <p className="text-sm text-accent">
                  Waiting for host to start...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="max-w-6xl mx-auto mt-8">
          <LobbyChat
            messages={chatMessages}
            userId={userId}
            onSendMessage={handleSendMessage}
          />
        </div>
      </main>
    </div>
  );
}
