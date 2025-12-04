import { useMemo } from 'react';
import { getAllGameModes } from '../../types/gameModes';
import type { GameMode } from '../../types/multiplayer';

interface GameModeShowcaseProps {
  selectedModeId?: string;
  onSelectMode?: (modeId: string) => void;
  filterByPlayers?: number;
  maxDisplay?: number;
}

export function GameModeShowcase({
  selectedModeId,
  onSelectMode,
  filterByPlayers,
  maxDisplay = 20,
}: GameModeShowcaseProps) {
  const modes = useMemo(() => {
    const allModes = getAllGameModes();

    if (filterByPlayers && filterByPlayers > 0) {
      return allModes.filter(
        (mode) =>
          mode.minPlayers <= filterByPlayers &&
          (mode.maxPlayers === null || mode.maxPlayers >= filterByPlayers)
      );
    }

    return allModes;
  }, [filterByPlayers]);

  const displayModes = useMemo(() => modes.slice(0, maxDisplay), [modes, maxDisplay]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-text-primary mb-2">Game Modes</h2>
        <p className="text-text-muted">
          {displayModes.length} mode{displayModes.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {displayModes.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            isSelected={selectedModeId === mode.id}
            onSelect={() => onSelectMode?.(mode.id)}
          />
        ))}
      </div>

      {/* No modes message */}
      {displayModes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">
            No game modes available for {filterByPlayers} player{filterByPlayers !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

interface ModeCardProps {
  mode: GameMode;
  isSelected: boolean;
  onSelect: () => void;
}

function ModeCard({ mode, isSelected, onSelect }: ModeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`group relative text-left transition-all duration-300 rounded-2xl p-5 border-2 ${
        isSelected
          ? 'bg-accent/20 border-accent shadow-lg shadow-accent/30'
          : 'bg-bg-secondary border-border hover:border-accent/50 hover:bg-bg-secondary/80 hover:shadow-lg hover:shadow-accent/10'
      }`}
    >
      {/* Icon */}
      <div className={`text-4xl mb-3 transition-transform duration-300 ${
        isSelected ? 'scale-110' : 'group-hover:scale-105'
      }`}>
        {mode.icon}
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-lg mb-2 transition-colors ${
        isSelected ? 'text-accent' : 'text-text-primary'
      }`}>
        {mode.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-muted mb-3 line-clamp-2 h-10">
        {mode.description}
      </p>

      {/* Details */}
      <div className="space-y-2 mb-3 pt-3 border-t border-border">
        {/* Players */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-accent">👥</span>
          <span className="text-text-muted">
            {mode.minPlayers}
            {mode.maxPlayers ? `-${mode.maxPlayers}` : '+'} players
          </span>
        </div>

        {/* Mechanics */}
        {mode.mechanics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {mode.mechanics.slice(0, 2).map((mechanic) => (
              <span
                key={mechanic}
                className="text-xs px-2 py-1 bg-accent/10 rounded-full text-accent capitalize"
              >
                {mechanic}
              </span>
            ))}
            {mode.mechanics.length > 2 && (
              <span className="text-xs px-2 py-1 bg-accent/10 rounded-full text-accent">
                +{mode.mechanics.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Teams support */}
        {mode.supportsTeams && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-accent">🤝</span>
            <span className="text-accent">Team mode available</span>
          </div>
        )}
      </div>

      {/* Scoring info */}
      <div className="text-xs text-text-muted pt-3 border-t border-border">
        <p>
          Base: <span className="text-accent font-semibold">{mode.scoring.basePoints}</span> pts
        </p>
      </div>
    </button>
  );
}

/**
 * Compact version for showing mode details in a modal or sidebar
 */
export function GameModeDetails({ modeId }: { modeId: string }) {
  const mode = useMemo(() => {
    const allModes = getAllGameModes();
    return allModes.find((m) => m.id === modeId);
  }, [modeId]);

  if (!mode) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">Game mode not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="text-5xl">{mode.icon}</div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-text-primary">{mode.name}</h2>
          <p className="text-text-muted">{mode.description}</p>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-secondary p-3 rounded-lg">
          <p className="text-xs text-text-muted mb-1">Players</p>
          <p className="font-semibold text-text-primary">
            {mode.minPlayers}
            {mode.maxPlayers ? `-${mode.maxPlayers}` : '+'}
          </p>
        </div>

        <div className="bg-bg-secondary p-3 rounded-lg">
          <p className="text-xs text-text-muted mb-1">Base Points</p>
          <p className="font-semibold text-accent">{mode.scoring.basePoints}</p>
        </div>

        {mode.scoring.speedBonus && (
          <div className="bg-bg-secondary p-3 rounded-lg">
            <p className="text-xs text-text-muted mb-1">Speed Bonus</p>
            <p className="font-semibold text-text-primary">+{mode.scoring.speedBonus}</p>
          </div>
        )}

        {mode.scoring.streakMultiplier && (
          <div className="bg-bg-secondary p-3 rounded-lg">
            <p className="text-xs text-text-muted mb-1">Streak Bonus</p>
            <p className="font-semibold text-text-primary">×{mode.scoring.streakMultiplier}</p>
          </div>
        )}
      </div>

      {/* Mechanics */}
      {mode.mechanics.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">Game Mechanics</p>
          <div className="flex flex-wrap gap-2">
            {mode.mechanics.map((mechanic) => (
              <span
                key={mechanic}
                className="px-3 py-1 bg-accent/20 rounded-full text-sm text-accent capitalize"
              >
                {mechanic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Configuration */}
      {mode.config.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">Host Configuration</p>
          <div className="space-y-2">
            {mode.config.map((config) => (
              <div key={config.id} className="bg-bg-secondary p-3 rounded-lg">
                <p className="text-sm font-medium text-text-primary">{config.label}</p>
                <p className="text-xs text-text-muted">
                  {config.description || `Default: ${config.default}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-2">Features</p>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-accent">✓</span>
            <span className="text-text-muted">{mode.revealPattern.replace(/_/g, ' ')}</span>
          </li>
          {mode.supportsTeams && (
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span className="text-text-muted">Team mode support</span>
            </li>
          )}
          <li className="flex items-center gap-2">
            <span className="text-accent">✓</span>
            <span className="text-text-muted">{mode.mechanics.length} game mechanic(s)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
