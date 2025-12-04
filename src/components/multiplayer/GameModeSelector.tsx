import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getAllGameModes, type GameMode } from '../../types/gameModes';

interface GameModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
  selectedModeId?: string;
}

export function GameModeSelector({
  isOpen,
  onClose,
  onSelectMode,
  selectedModeId,
}: GameModeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const allModes = getAllGameModes();

  // Group modes by mechanics
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allModes.forEach((mode) => {
      if (mode.mechanics.length > 0) {
        cats.add(mode.mechanics[0]);
      } else {
        cats.add('other');
      }
    });
    return Array.from(cats).sort();
  }, []);

  // Filter modes by category and search
  const filteredModes = useMemo(() => {
    let result = allModes;

    if (selectedCategory) {
      result = result.filter((mode) => mode.mechanics.includes(selectedCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (mode) =>
          mode.name.toLowerCase().includes(query) ||
          mode.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div
      className="modal-backdrop fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary border border-border rounded-3xl shadow-2xl animate-modal overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '1200px',
          maxHeight: 'calc(100vh - 2rem)',
          margin: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-8 border-b border-border/50">
          <div>
            <h3 className="font-serif text-3xl text-text-primary mb-1">Choose a Game Mode</h3>
            <p className="text-text-secondary text-sm">
              Select from <span className="text-accent font-semibold">{allModes.length}</span> unique multiplayer modes to customize your experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all duration-300 ml-4 flex-shrink-0"
            title="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="px-8 py-6 border-b border-border/50 space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === null
                    ? 'bg-accent text-bg-primary shadow-lg shadow-accent/20'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-secondary border border-border hover:border-accent/50'
                }`}
              >
                All Modes
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                    selectedCategory === category
                      ? 'bg-accent text-bg-primary shadow-lg shadow-accent/20'
                      : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-secondary border border-border hover:border-accent/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modes Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
            {filteredModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode);
                  onClose();
                }}
                className={`group relative text-left transition-all duration-300 rounded-2xl p-6 border-2 ${
                  selectedModeId === mode.id
                    ? 'bg-accent/15 border-accent shadow-lg shadow-accent/30'
                    : 'bg-bg-tertiary border-border hover:border-accent/60 hover:bg-bg-secondary hover:shadow-lg hover:shadow-accent/10 hover:scale-[1.02]'
                }`}
              >
                {/* Icon */}
                <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-125">
                  {mode.icon}
                </div>

                {/* Title */}
                <h4
                  className={`font-semibold text-base mb-2 transition-colors ${
                    selectedModeId === mode.id ? 'text-accent' : 'text-text-primary'
                  }`}
                >
                  {mode.name}
                </h4>

                {/* Description */}
                <p className="text-sm text-text-muted mb-4 line-clamp-2 min-h-10">
                  {mode.description}
                </p>

                {/* Players Badge */}
                <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-bg-primary rounded-full text-text-muted border border-border/50">
                  <span>👥</span>
                  <span className="font-medium">
                    {mode.minPlayers}
                    {mode.maxPlayers ? `-${mode.maxPlayers}` : '+'}
                  </span>
                </div>

                {/* Selection indicator */}
                {selectedModeId === mode.id && (
                  <div className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-bg-primary">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {filteredModes.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-muted mb-2 text-lg">No modes found</p>
              <p className="text-sm text-text-muted/70">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
