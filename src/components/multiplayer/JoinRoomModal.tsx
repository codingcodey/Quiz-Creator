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
              placeholder="0000"
              maxLength={4}
              disabled={isLoading}
              autoFocus
              className={`w-full px-6 py-4 text-center text-3xl font-bold tracking-widest bg-bg-secondary border-2 rounded-xl focus:outline-none transition-all duration-300 disabled:opacity-50 ${
                displayError
                  ? 'border-error bg-error/5 focus:ring-0'
                  : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/20'
              }`}
            />
            {displayError && (
              <p className="mt-2 text-sm text-error animate-fade-in">{displayError}</p>
            )}
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={!isValidRoomCode(roomCode) || isLoading}
            className="w-full py-4 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:shadow-none"
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
        <div className="mt-6 pt-6 border-t border-border text-left">
          <p className="text-xs text-text-muted mb-3 font-medium">Tips:</p>
          <ul className="text-xs text-text-muted space-y-1">
            <li>• The host will provide the room code</li>
            <li>• Room codes expire after the game ends</li>
            <li>• You can join up to the moment the game starts</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
