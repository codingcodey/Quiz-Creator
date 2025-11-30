import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'dark' | 'light';

function getTimeBasedTheme(): Theme {
  const hour = new Date().getHours();
  // Day: 6 AM to 6 PM, Night: 6 PM to 6 AM
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export function useTheme() {
  // Initialize with time-based theme
  const [theme, setTheme] = useLocalStorage<Theme>('quiz-creator-theme', getTimeBasedTheme());

  // On mount, update to current time-based theme
  useEffect(() => {
    setTheme(getTimeBasedTheme());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
