import { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean; // System messages like "Player joined"
}

interface LobbyChatProps {
  messages: ChatMessage[];
  userId: string;
  onSendMessage?: (message: string) => void;
}

export function LobbyChat({
  messages,
  userId,
  onSendMessage,
}: LobbyChatProps) {
  const [messageText, setMessageText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage?.(messageText);
      setMessageText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`bg-bg-secondary/50 border border-border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isExpanded ? 'h-80' : 'h-14'
      }`}
    >
      {/* Chat Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-bg-secondary/80 transition-colors"
      >
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <span>💬 Lobby Chat</span>
          <span className="text-xs text-text-muted">({messages.length})</span>
        </h2>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
        </svg>
      </button>

      {/* Chat Content */}
      {isExpanded && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-bg-primary/40 border-t border-border/50">
            {messages.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No messages yet. Say hi! 👋</p>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.userId === userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg transition-all ${
                        msg.isSystem
                          ? 'bg-bg-tertiary text-text-muted text-xs italic'
                          : isOwn
                            ? 'bg-accent text-bg-primary'
                            : 'bg-bg-secondary border border-border'
                      }`}
                    >
                      {!msg.isSystem && !isOwn && (
                        <p className="text-xs font-medium text-accent mb-0.5">
                          {msg.displayName}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.isSystem ? '' : isOwn ? 'text-bg-primary/60' : 'text-text-muted'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-6 py-3 bg-bg-primary border-t border-border/50 flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something..."
              className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="px-3 py-2 bg-accent text-bg-primary rounded-lg font-medium text-sm hover:bg-accent-hover active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-10"
              title="Send message (Enter)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
