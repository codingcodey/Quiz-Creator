import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Folder } from '../types/quiz';

const FOLDERS_KEY = 'quiz-creator-folders';

const DEFAULT_COLORS = [
  '#d4a853', // Gold (accent)
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

export function useFolders() {
  const [folders, setFolders] = useLocalStorage<Folder[]>(FOLDERS_KEY, []);

  const createFolder = useCallback(
    (name: string, color?: string) => {
      const folder: Folder = {
        id: crypto.randomUUID(),
        name,
        color: color || DEFAULT_COLORS[folders.length % DEFAULT_COLORS.length],
        createdAt: Date.now(),
      };
      setFolders((prev) => [...prev, folder]);
      return folder;
    },
    [folders.length, setFolders]
  );

  const updateFolder = useCallback(
    (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => {
      setFolders((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      );
    },
    [setFolders]
  );

  const deleteFolder = useCallback(
    (id: string) => {
      setFolders((prev) => prev.filter((f) => f.id !== id));
    },
    [setFolders]
  );

  const getFolder = useCallback(
    (id: string) => folders.find((f) => f.id === id),
    [folders]
  );

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolder,
    defaultColors: DEFAULT_COLORS,
  };
}

