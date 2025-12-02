import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderAnnouncements: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  screenReaderAnnouncements: true,
};

const SETTINGS_KEY = 'quiz-creator-accessibility';

export function useAccessibility() {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(SETTINGS_KEY, DEFAULT_SETTINGS);

  // Apply settings to document
  useEffect(() => {
    const html = document.documentElement;

    // High contrast
    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      html.classList.add('reduced-motion');
    } else {
      html.classList.remove('reduced-motion');
    }

    // Large text
    if (settings.largeText) {
      html.classList.add('large-text');
    } else {
      html.classList.remove('large-text');
    }
  }, [settings]);

  // Check system preferences on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)');

    if (prefersReducedMotion.matches && !settings.reducedMotion) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }

    if (prefersHighContrast.matches && !settings.highContrast) {
      setSettings((prev) => ({ ...prev, highContrast: true }));
    }
  }, []);

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings]
  );

  const toggleSetting = useCallback(
    (key: keyof AccessibilitySettings) => {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [setSettings]
  );

  // Announce to screen readers
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!settings.screenReaderAnnouncements) return;

      const announcer = document.getElementById('sr-announcer') || createAnnouncer();
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    },
    [settings.screenReaderAnnouncements]
  );

  return {
    settings,
    updateSetting,
    toggleSetting,
    announce,
  };
}

function createAnnouncer(): HTMLElement {
  const announcer = document.createElement('div');
  announcer.id = 'sr-announcer';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  document.body.appendChild(announcer);
  return announcer;
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  items: string[],
  onSelect: (item: string) => void,
  options: { wrap?: boolean; orientation?: 'horizontal' | 'vertical' } = {}
) {
  const { wrap = true, orientation = 'vertical' } = options;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';

      let newIndex = currentIndex;

      switch (e.key) {
        case prevKey:
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? items.length - 1 : 0;
          }
          break;
        case nextKey:
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= items.length) {
            newIndex = wrap ? 0 : items.length - 1;
          }
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = items.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(items[currentIndex]);
          return;
        default:
          return;
      }

      if (newIndex !== currentIndex && items[newIndex]) {
        onSelect(items[newIndex]);
      }
    },
    [items, onSelect, wrap, orientation]
  );

  return { handleKeyDown };
}

// Focus trap hook for modals
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive, containerRef]);
}

// Skip link component
export function SkipLink({ targetId, children }: { targetId: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-bg-primary focus:rounded-lg focus:outline-none"
    >
      {children}
    </a>
  );
}

