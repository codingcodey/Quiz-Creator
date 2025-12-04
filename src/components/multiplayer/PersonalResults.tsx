import { useMemo, useState } from 'react';
import type { SessionParticipant } from '../../types/multiplayer';
import { AchievementUnlockList } from './AchievementUnlock';
import { useMultiplayerAchievements } from '../../hooks/useMultiplayerAchievements';
import type { MultiplayerAchievement } from '../../data/multiplayerAchievements';

interface PersonalResultsProps {
  participant: SessionParticipant;
  participants: SessionParticipant[];
  totalQuestions: number;
  gameMode?: string;
  onPlayAgain?: () => void;
  onExit?: () => void;
}

export function PersonalResults({
  participant,
  participants,
  totalQuestions,
  gameMode = 'classic',
  onPlayAgain,
  onExit,
}: PersonalResultsProps) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<MultiplayerAchievement[]>([]);
  const { checkAllAchievements } = useMultiplayerAchievements();

  const rank = useMemo(() => {
    const sorted = [...participants].sort((a, b) => {
      if (b.current_score !== a.current_score) {
        return b.current_score - a.current_score;
      }
      return a.total_time_spent - b.total_time_spent;
    });
    return sorted.findIndex(p => p.id === participant.id) + 1;
  }, [participant, participants]);

  // Calculate achievements
  useMemo(() => {
    const userStats = {
      gamesPlayedCount: 1,
      winsCount: rank === 1 ? 1 : 0,
      hostedGamesCount: 0,
      playersHosted: participants.length,
      uniquePlayersCount: participants.length,
      winStreak: rank === 1 ? 1 : 0,
      comebackWins: 0,
      trailedByPoints: 0,
    };

    const unlocked = checkAllAchievements(
      participant,
      rank,
      gameMode,
      totalQuestions,
      participant.total_time_spent,
      userStats
    );

    setUnlockedAchievements(unlocked.map((u) => u.achievement));
  }, [participant, rank, gameMode, totalQuestions, participants.length, checkAllAchievements]);

  const accuracy = totalQuestions > 0
    ? Math.round((participant.current_score / (totalQuestions * 100)) * 100)
    : 0;

  const getRankDisplay = () => {
    switch (rank) {
      case 1:
        return { emoji: '🥇', text: '1st Place', color: 'text-yellow-400' };
      case 2:
        return { emoji: '🥈', text: '2nd Place', color: 'text-gray-400' };
      case 3:
        return { emoji: '🥉', text: '3rd Place', color: 'text-orange-400' };
      default:
        return { emoji: '📍', text: `${rank}th Place`, color: 'text-text-muted' };
    }
  };

  const rankDisplay = getRankDisplay();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-accent/15 rounded-full blur-2xl animate-orb-2" />
      </div>

      {/* Achievement notifications */}
      <AchievementUnlockList achievements={unlockedAchievements} />

      {/* Header */}
      <header className="relative z-10 text-center pt-12 pb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-text-primary mb-2">Your Results</h1>
        <p className="text-text-secondary text-lg">Quiz Complete!</p>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Rank Card */}
          <div className="bg-gradient-to-br from-bg-secondary/80 to-bg-tertiary border border-border rounded-3xl p-8 mb-8 opacity-0 animate-fade-in-up text-center">
            <div className="text-6xl mb-4">{rankDisplay.emoji}</div>
            <p className={`text-2xl font-bold mb-1 ${rankDisplay.color}`}>{rankDisplay.text}</p>
            <p className="text-text-secondary">Out of {participants.length} players</p>
          </div>

          {/* Score Card */}
          <div className="bg-gradient-to-br from-bg-secondary/80 to-bg-tertiary border border-border rounded-2xl p-6 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="font-semibold text-text-primary mb-6">Your Score</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-primary/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-accent">{participant.current_score}</p>
                <p className="text-sm text-text-muted mt-1">Points</p>
              </div>

              <div className="bg-bg-primary/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-success">{accuracy}%</p>
                <p className="text-sm text-text-muted mt-1">Accuracy</p>
              </div>

              <div className="bg-bg-primary/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-400">{participant.max_streak}🔥</p>
                <p className="text-sm text-text-muted mt-1">Best Streak</p>
              </div>

              <div className="bg-bg-primary/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-text-primary">
                  {totalQuestions > 0 ? Math.round(participant.total_time_spent / totalQuestions) : 0}s
                </p>
                <p className="text-sm text-text-muted mt-1">Avg Time</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-gradient-to-br from-bg-secondary/80 to-bg-tertiary border border-border rounded-2xl p-6 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-semibold text-text-primary mb-4">Leaderboard</h2>
            <div className="space-y-2">
              {[...participants]
                .sort((a, b) => {
                  if (b.current_score !== a.current_score) {
                    return b.current_score - a.current_score;
                  }
                  return a.total_time_spent - b.total_time_spent;
                })
                .slice(0, 5)
                .map((p, idx) => {
                  const isYou = p.id === participant.id;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isYou
                          ? 'bg-accent/20 border border-accent/30'
                          : 'bg-bg-primary/40'
                      }`}
                    >
                      <span className="font-bold text-lg text-accent w-8 text-center">{idx + 1}</span>

                      <div className="flex-shrink-0">
                        {p.avatar_url ? (
                          <img
                            src={p.avatar_url}
                            alt={p.display_name}
                            className="w-10 h-10 rounded-full border border-border object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                            {p.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          {p.display_name}
                          {isYou && <span className="ml-2 text-xs text-accent font-medium">(You)</span>}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-accent">{p.current_score}</p>
                        <p className="text-xs text-text-muted">pts</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={onPlayAgain}
              className="btn-shimmer px-8 sm:px-12 py-4 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98] transition-all duration-300 text-base sm:text-lg min-h-[48px]"
            >
              Play Again
            </button>

            <button
              onClick={onExit}
              className="px-8 sm:px-12 py-4 bg-bg-secondary text-text-primary border border-border font-bold rounded-xl hover:border-accent/50 hover:bg-bg-tertiary hover:shadow-lg hover:shadow-accent/5 active:scale-[0.98] transition-all duration-300 text-base sm:text-lg min-h-[48px]"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
