import React, { useMemo } from 'react';
import { Modal } from '../Modal';
import { getAllGameModes } from '../../types/gameModes';

interface GameModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (modeId: string) => void;
  playerCount: number;
  isLoading?: boolean;
}

export function GameModeSelector({
  isOpen,
  onClose,
  onSelectMode,
  playerCount,
  isLoading = false,
}: GameModeSelectorProps) {
  const modes = useMemo(() => {
    const allModes = getAllGameModes();
    // Filter modes compatible with player count
    return allModes.filter((mode) => {
      const meetsMin = playerCount >= mode.minPlayers;
      const meetsMax = mode.maxPlayers === null || playerCount <= mode.maxPlayers;
      return meetsMin && meetsMax;
    });
  }, [playerCount]);

  const unavailableModes = useMemo(() => {
    const allModes = getAllGameModes();
    return allModes.filter(
      (mode) => playerCount < mode.minPlayers || (mode.maxPlayers !== null && playerCount > mode.maxPlayers)
    );
  }, [playerCount]);

  const handleSelectMode = (modeId: string) => {
    onSelectMode(modeId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl text-text-primary mb-2">Select Game Mode</h2>
        <p className="text-text-secondary mb-6">
          {playerCount} players ready • Choose how you want to compete
        </p>

        {/* Available Modes */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-text-primary mb-4">Available Modes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                disabled={isLoading}
                className="group relative p-4 text-left bg-bg-secondary border border-border rounded-xl hover:border-accent/50 hover:bg-bg-tertiary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{mode.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                      {mode.name}
                    </h4>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">
                      {mode.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                      <span>👥 {mode.minPlayers}+</span>
                      {mode.supportsTeams && <span>🤝 Teams</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Unavailable Modes */}
        {unavailableModes.length > 0 && (
          <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl">
            <p className="text-xs text-warning font-medium mb-2">
              ⚠️ {unavailableModes.length} mode{unavailableModes.length === 1 ? '' : 's'} require{unavailableModes.length === 1 ? 's' : ''} a different player count:
            </p>
            <div className="flex flex-wrap gap-2">
              {unavailableModes.map((mode) => (
                <span
                  key={mode.id}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-warning/20 text-warning rounded-lg"
                >
                  <span>{mode.icon}</span>
                  <span>{mode.name}</span>
                  <span className="opacity-60">({mode.minPlayers}+ players)</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 justify-center pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
