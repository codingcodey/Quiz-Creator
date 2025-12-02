import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const { settings, toggleSetting } = useAccessibility();

  if (!isOpen) return null;

  const settingsOptions = [
    {
      key: 'highContrast' as const,
      title: 'High Contrast',
      description: 'Increase color contrast for better visibility',
      icon: '🎨',
    },
    {
      key: 'reducedMotion' as const,
      title: 'Reduced Motion',
      description: 'Minimize animations and transitions',
      icon: '🚫',
    },
    {
      key: 'largeText' as const,
      title: 'Large Text',
      description: 'Increase font sizes throughout the app',
      icon: '🔤',
    },
    {
      key: 'screenReaderAnnouncements' as const,
      title: 'Screen Reader Announcements',
      description: 'Enable live announcements for screen readers',
      icon: '📢',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 id="accessibility-title" className="font-serif text-xl text-text-primary">
              Accessibility
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
            aria-label="Close accessibility settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Settings List */}
        <div className="space-y-3">
          {settingsOptions.map((option) => (
            <label
              key={option.key}
              className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl cursor-pointer hover:bg-bg-tertiary/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">{option.icon}</span>
                <div>
                  <p className="text-text-primary font-medium">{option.title}</p>
                  <p className="text-sm text-text-muted">{option.description}</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings[option.key]}
                  onChange={() => toggleSetting(option.key)}
                  className="sr-only peer"
                  aria-describedby={`${option.key}-description`}
                />
                <div className="w-11 h-6 bg-bg-primary rounded-full peer-checked:bg-accent transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-text-muted rounded-full peer-checked:translate-x-5 peer-checked:bg-bg-primary transition-all" />
              </div>
              <span id={`${option.key}-description`} className="sr-only">
                {option.description}
              </span>
            </label>
          ))}
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-text-primary mb-3">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-bg-tertiary rounded border border-border text-text-muted">Tab</kbd>
              <span className="text-text-secondary">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-bg-tertiary rounded border border-border text-text-muted">Enter</kbd>
              <span className="text-text-secondary">Select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-bg-tertiary rounded border border-border text-text-muted">Esc</kbd>
              <span className="text-text-secondary">Close</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-bg-tertiary rounded border border-border text-text-muted">⌘S</kbd>
              <span className="text-text-secondary">Save</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-shimmer px-5 py-2.5 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:translate-y-0 transition-all duration-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

