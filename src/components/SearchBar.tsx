import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search quizzes...',
  suggestions = [],
  onSuggestionSelect,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on current value
  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-bg-secondary border rounded-xl transition-all duration-300 ${
          isFocused ? 'border-accent shadow-lg shadow-accent/10' : 'border-border'
        }`}
      >
        {/* Search Icon */}
        <svg
          className={`w-5 h-5 transition-colors ${isFocused ? 'text-accent' : 'text-text-muted'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-bg-secondary border border-border rounded-xl shadow-xl z-20 animate-fade-in">
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                if (onSuggestionSelect) {
                  onSuggestionSelect(suggestion);
                } else {
                  onChange(suggestion);
                }
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-2 text-left text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Filter pills component for tags/folders
interface FilterPillsProps {
  items: { id: string; label: string; color?: string }[];
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
}

export function FilterPills({ items, selectedId, onSelect }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          selectedId === null
            ? 'bg-accent text-bg-primary'
            : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
        }`}
      >
        All
      </button>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedId === item.id
              ? 'text-bg-primary'
              : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
          }`}
          style={
            selectedId === item.id && item.color
              ? { backgroundColor: item.color }
              : undefined
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

