import { useState, useCallback } from 'react';
import { Modal } from '../Modal';
import { isValidRoomCode } from '../../utils/roomCode';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function JoinRoomModal({ isOpen, onClose, onJoin, isLoading = false, error }: JoinRoomModalProps) {
  const [roomCode, setRoomCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 4 digits
    const formatted = digitsOnly.slice(0, 4);
    setRoomCode(formatted);
    setLocalError(null);
  };

  const handleJoin = useCallback(() => {
    if (!isValidRoomCode(roomCode)) {
      setLocalError('Room code must be 4 digits');
      return;
    }

    onJoin(roomCode);
  }, [roomCode, onJoin]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && isValidRoomCode(roomCode)) {
      handleJoin();
    }
  };

  const handleClose = () => {
    setRoomCode('');
    setLocalError(null);
    onClose();
  };

  const handleClearError = () => {
    setLocalError(null);
  };

  const displayError = error || localError;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center max-w-md mx-auto">
        <h2 className="font-serif text-3xl text-text-primary mb-2">Join a Room</h2>
        <p className="text-text-secondary mb-8">Enter the 4-digit room code shared by the host</p>

        <div className="space-y-4">
          {/* Room Code Input */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={handleClearError}
              placeholder="0000"
              maxLength={4}
              disabled={isLoading}
              autoFocus
              inputMode="numeric"
              className={`w-full px-6 py-4 text-center text-4xl font-bold tracking-widest bg-bg-secondary border-2 rounded-xl focus:outline-none transition-all duration-300 disabled:opacity-50 ${
                displayError
                  ? 'border-error bg-error/5 focus:border-error focus:ring-2 focus:ring-error/20'
                  : 'border-border-subtle focus:border-accent focus:ring-2 focus:ring-accent/20'
              }`}
            />
            {displayError && (
              <div className="mt-3 p-3 bg-error/10 border border-error/30 rounded-lg animate-fade-in">
                <p className="text-sm text-error font-medium">{displayError}</p>
              </div>
            )}
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={!isValidRoomCode(roomCode) || isLoading}
            className="w-full py-4 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-hover hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-bg-primary/30 border-t-bg-primary animate-spin" />
                Joining...
              </span>
            ) : (
              'Join Room'
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-full py-3 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 pt-6 border-t border-border-subtle text-left">
          <p className="text-xs text-text-muted mb-3 font-semibold uppercase tracking-wider">How It Works</p>
          <ul className="text-xs text-text-muted space-y-2">
            <li className="flex gap-2">
              <span className="text-accent font-semibold">1.</span>
              <span>Get the 4-digit code from the host</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-semibold">2.</span>
              <span>Enter it above and press Join</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-semibold">3.</span>
              <span>You'll see the lobby with other players</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-semibold">4.</span>
              <span>Wait for the host to start the game</span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
