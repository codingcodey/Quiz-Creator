import { useEffect, useState } from 'react';
import type { MultiplayerAchievement } from '../../data/multiplayerAchievements';

interface AchievementUnlockProps {
  achievement: MultiplayerAchievement;
  isVisible: boolean;
  onDismiss?: () => void;
  autoHideDuration?: number; // milliseconds
}

export function AchievementUnlock({
  achievement,
  isVisible,
  onDismiss,
  autoHideDuration = 5000,
}: AchievementUnlockProps) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);

    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss?.();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onDismiss]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-right-6 duration-300">
      <div className="bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent rounded-2xl p-6 max-w-sm backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="text-5xl flex-shrink-0">{achievement.icon}</div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-accent">Achievement Unlocked!</h3>
              <span className="text-2xl">🎉</span>
            </div>

            <p className="font-semibold text-text-primary mb-1">{achievement.name}</p>

            <p className="text-sm text-text-muted mb-3">{achievement.description}</p>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-accent">+{achievement.points} points</span>
              {achievement.category && (
                <span className="text-xs px-2 py-1 bg-accent/20 rounded-full text-accent capitalize">
                  {achievement.category}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setShow(false);
              onDismiss?.();
            }}
            className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

interface AchievementUnlockListProps {
  achievements: MultiplayerAchievement[];
  onAllDismissed?: () => void;
}

export function AchievementUnlockList({
  achievements,
  onAllDismissed,
}: AchievementUnlockListProps) {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [allDismissed, setAllDismissed] = useState(achievements.length === 0);

  const currentAchievement = achievements[displayedIndex];

  useEffect(() => {
    if (displayedIndex >= achievements.length && !allDismissed) {
      setAllDismissed(true);
      onAllDismissed?.();
    }
  }, [displayedIndex, achievements.length, allDismissed, onAllDismissed]);

  if (allDismissed) return null;

  return (
    <AchievementUnlock
      achievement={currentAchievement}
      isVisible={true}
      autoHideDuration={4000}
      onDismiss={() => setDisplayedIndex((prev) => prev + 1)}
    />
  );
}
