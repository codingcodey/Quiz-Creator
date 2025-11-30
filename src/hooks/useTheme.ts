import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'quiz-creator-theme';

function getTimeBasedTheme(): Theme {
  const hour = new Date().getHours();
  // Day: 6 AM to 6 PM, Night: 6 PM to 6 AM
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

function getInitialTheme(): Theme {
  // Check if user has a saved preference
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed === 'dark' || parsed === 'light') {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  // Fall back to time-based theme for first-time visitors
  return getTimeBasedTheme();
}

export function useTheme() {
  // Initialize with saved preference or time-based theme for new users
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_STORAGE_KEY, getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme, toggleTheme };
}
