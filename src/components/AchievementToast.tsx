import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Achievement } from '../hooks/useAchievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);

      const closeTimer = setTimeout(() => {
        onClose();
      }, 4300);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="flex items-center gap-4 px-6 py-4 bg-bg-secondary border-2 border-accent rounded-2xl shadow-2xl shadow-accent/20 animate-achievement">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center text-3xl animate-bounce-slow">
          {achievement.icon}
        </div>

        {/* Content */}
        <div>
          <p className="text-xs text-accent font-medium uppercase tracking-wider mb-1">
            Achievement Unlocked!
          </p>
          <h4 className="text-lg font-bold text-text-primary">{achievement.name}</h4>
          <p className="text-sm text-text-secondary">{achievement.description}</p>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          className="p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Achievement showcase modal for viewing all achievements
interface AchievementShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: (Achievement & { unlockedAt?: number })[];
  stats: { total: number; unlocked: number; percentage: number };
}

export function AchievementShowcase({ isOpen, onClose, achievements, stats }: AchievementShowcaseProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlockedAt;
    if (filter === 'locked') return !a.unlockedAt;
    return true;
  });

  const categories = [...new Set(achievements.map((a) => a.category))];

  const modalContent = (
    <div className="modal-backdrop fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-backdrop" onClick={onClose}>
      <div
        className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl animate-modal overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: 'calc(100vh - 2rem)',
          margin: 0,
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <h3 className="font-serif text-xl text-text-primary">Achievements</h3>
              <p className="text-text-secondary text-sm">
                {stats.unlocked} of {stats.total} unlocked ({Math.round(stats.percentage)}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'unlocked', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-accent text-bg-primary'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => {
            const categoryAchievements = filteredAchievements.filter((a) => a.category === category);
            if (categoryAchievements.length === 0) return null;

            return (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3 capitalize">
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        achievement.unlockedAt
                          ? 'bg-accent/10 border-accent/30'
                          : 'bg-bg-tertiary border-border opacity-60'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                          achievement.unlockedAt ? '' : 'grayscale'
                        }`}
                      >
                        {achievement.unlockedAt ? achievement.icon : '🔒'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-text-primary truncate">{achievement.name}</h5>
                        <p className="text-xs text-text-secondary truncate">{achievement.description}</p>
                        {achievement.unlockedAt && (
                          <p className="text-xs text-accent mt-1">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

