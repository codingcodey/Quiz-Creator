import { Modal } from '../Modal';

interface ModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'solo' | 'multiplayer') => void;
  isLoading?: boolean;
}

export function ModeSelector({ isOpen, onClose, onSelectMode, isLoading = false }: ModeSelectorProps) {
  const handleSelectSolo = () => {
    onSelectMode('solo');
    onClose();
  };

  const handleSelectMultiplayer = () => {
    onSelectMode('multiplayer');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">
          How do you want to play?
        </h2>
        <p className="text-text-secondary mb-8">
          Challenge yourself alone or compete with friends
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Solo Play Option */}
          <button
            onClick={handleSelectSolo}
            disabled={isLoading}
            className="group relative overflow-hidden p-8 bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border rounded-2xl hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🎯
              </div>
              <h3 className="font-serif text-xl text-text-primary mb-2">Solo Play</h3>
              <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                Test your knowledge at your own pace
              </p>
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-text-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Classic quiz experience
              </div>
            </div>
          </button>

          {/* Multiplayer Option */}
          <button
            onClick={handleSelectMultiplayer}
            disabled={isLoading}
            className="group relative overflow-hidden p-8 bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent rounded-2xl hover:border-accent hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🎮
              </div>
              <h3 className="font-serif text-xl text-accent mb-2">Multiplayer</h3>
              <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                Compete with friends in 16+ game modes
              </p>
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-accent/80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                New experience
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
