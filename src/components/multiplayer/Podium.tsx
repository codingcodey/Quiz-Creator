import { useMemo, useState } from 'react';
import type { SessionParticipant } from '../../types/multiplayer';
import { getMedalForRank } from '../../utils/scoring';
import { AchievementUnlockList } from './AchievementUnlock';
import { useMultiplayerAchievements } from '../../hooks/useMultiplayerAchievements';
import type { MultiplayerAchievement } from '../../data/multiplayerAchievements';

interface PodiumProps {
  participants: SessionParticipant[];
  totalQuestions: number;
  currentUserId?: string;
  gameMode?: string;
  onPlayAgain?: () => void;
  onExit?: () => void;
}

export function Podium({
  participants,
  totalQuestions,
  currentUserId,
  gameMode = 'classic',
  onPlayAgain,
  onExit,
}: PodiumProps) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<MultiplayerAchievement[]>([]);
  const { checkAllAchievements } = useMultiplayerAchievements();

  const rankedParticipants = useMemo(() => {
    return [...participants]
      .sort((a, b) => {
        if (b.current_score !== a.current_score) {
          return b.current_score - a.current_score;
        }
        return a.total_time_spent - b.total_time_spent;
      })
      .slice(0, 3)
      .map((p, idx) => ({
        ...p,
        rank: idx + 1,
      }));
  }, [participants]);

  // Calculate achievements for current user
  useMemo(() => {
    if (!currentUserId) return;

    const currentUserRank =
      [...participants]
        .sort((a, b) => {
          if (b.current_score !== a.current_score) {
            return b.current_score - a.current_score;
          }
          return a.total_time_spent - b.total_time_spent;
        })
        .findIndex((p) => p.user_id === currentUserId) + 1;

    const currentUser = participants.find((p) => p.user_id === currentUserId);
    if (!currentUser) return;

    // Calculate total time
    const totalTime = currentUser.total_time_spent;

    // Mock user stats - in real implementation, fetch from database
    const userStats = {
      gamesPlayedCount: 1, // This would come from user profile
      winsCount: currentUserRank === 1 ? 1 : 0,
      hostedGamesCount: 0,
      playersHosted: participants.length,
      uniquePlayersCount: participants.length,
      winStreak: currentUserRank === 1 ? 1 : 0,
      comebackWins: 0,
      trailedByPoints: 0,
    };

    const unlocked = checkAllAchievements(
      currentUser,
      currentUserRank,
      gameMode,
      totalQuestions,
      totalTime,
      userStats
    );

    setUnlockedAchievements(unlocked.map((u) => u.achievement));
  }, [currentUserId, participants, gameMode, totalQuestions, checkAllAchievements]);

  const topThree = useMemo(() => {
    const sorted = [...rankedParticipants];
    // Arrange as: 2nd (left), 1st (center), 3rd (right) for classic podium layout
    if (sorted.length === 0) return [];
    if (sorted.length === 1) return [sorted[0]];
    if (sorted.length === 2) return [sorted[0], sorted[1]];
    return [sorted[1], sorted[0], sorted[2]];
  }, [rankedParticipants]);

  const getAccuracy = (participant: SessionParticipant): number => {
    // This would need to come from actual answers data
    // For now, we'll estimate based on available data
    return Math.round((participant.current_score / (totalQuestions * 100)) * 100) || 0;
  };

  const getPodiumHeight = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'h-80';
      case 2:
        return 'h-64';
      case 3:
        return 'h-48';
      default:
        return 'h-40';
    }
  };

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
          <span className="text-4xl">🏆</span>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-text-primary mb-2">Results</h1>
        <p className="text-text-secondary text-lg">Quiz Complete!</p>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Podium */}
          <div className="mb-16">
            <div className="flex items-flex-end justify-center gap-6 h-96 px-4">
              {topThree.map((participant) => {
                const actualRank = participant.rank;
                const medal = getMedalForRank(actualRank);
                const podiumHeight = getPodiumHeight(actualRank);

                return (
                  <div key={participant.id} className="flex flex-col items-center opacity-0 animate-fade-in-up" style={{ animationDelay: `${(actualRank - 1) * 0.1}s` }}>
                    {/* Medal and position */}
                    <div className="mb-4 text-center">
                      <div className={`text-6xl mb-2 transition-transform duration-300 hover:scale-110 ${actualRank === 1 ? 'animate-bounce' : ''}`}>
                        {medal}
                      </div>
                      <div className="text-sm font-bold text-text-muted">
                        {actualRank === 1 ? '🥇 1st Place' : actualRank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                      </div>
                    </div>

                    {/* Podium */}
                    <div
                      className={`${podiumHeight} w-36 bg-gradient-to-b from-accent/20 to-accent/5 border-3 border-accent/60 rounded-t-3xl flex flex-col items-center justify-end pb-5 transition-all duration-500 hover:border-accent hover:shadow-lg hover:shadow-accent/20`}
                    >
                      {/* Avatar */}
                      <div className="mb-4">
                        {participant.avatar_url ? (
                          <img
                            src={participant.avatar_url}
                            alt={participant.display_name}
                            className="w-20 h-20 rounded-full border-3 border-accent object-cover shadow-lg shadow-accent/30"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-2xl font-bold text-accent border-3 border-accent shadow-lg shadow-accent/30">
                            {participant.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name and score */}
                      <div className="text-center w-full px-2">
                        <p className="font-semibold text-text-primary text-sm truncate max-w-32">
                          {participant.display_name}
                        </p>
                        <p className="text-3xl font-bold text-accent mt-2">{participant.current_score}</p>
                        <p className="text-xs text-text-muted/80">points</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {rankedParticipants.slice(0, 3).map((participant, idx) => (
              <div
                key={participant.id}
                className="bg-gradient-to-br from-bg-secondary/80 to-bg-tertiary border border-border rounded-2xl p-6 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10 transition-all opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="text-4xl">{getMedalForRank(participant.rank)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary truncate">{participant.display_name}</h3>
                    <p className="text-sm text-text-muted">
                      {participant.rank === 1 ? '🥇 1st Place' : participant.rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-bg-primary/50 rounded-xl border border-border/50 hover:border-accent/30 transition-all">
                    <span className="text-sm font-medium text-text-muted">Score</span>
                    <span className="font-bold text-lg text-accent">{participant.current_score}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-bg-primary/50 rounded-xl border border-border/50 hover:border-accent/30 transition-all">
                    <span className="text-sm font-medium text-text-muted">Best Streak</span>
                    <span className="font-bold text-text-primary flex items-center gap-1">{participant.max_streak}<span>🔥</span></span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-bg-primary/50 rounded-xl border border-border/50 hover:border-accent/30 transition-all">
                    <span className="text-sm font-medium text-text-muted">Avg Time</span>
                    <span className="font-bold text-text-primary">
                      {Math.round(participant.total_time_spent / totalQuestions)}s
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-bg-primary/50 rounded-xl border border-border/50 hover:border-accent/30 transition-all">
                    <span className="text-sm font-medium text-text-muted">Accuracy</span>
                    <span className="font-bold text-success">{getAccuracy(participant)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* All Participants Leaderboard */}
          {participants.length > 3 && (
            <div className="bg-gradient-to-br from-bg-secondary/50 to-bg-tertiary/30 border border-border rounded-2xl p-6 mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="font-semibold text-xl text-text-primary mb-5">Full Leaderboard</h2>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {[...participants]
                  .sort((a, b) => {
                    if (b.current_score !== a.current_score) {
                      return b.current_score - a.current_score;
                    }
                    return a.total_time_spent - b.total_time_spent;
                  })
                  .map((participant, idx) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-primary/40 hover:bg-bg-primary/70 border border-border/20 hover:border-accent/30 transition-all"
                    >
                      <span className="font-bold text-lg text-accent w-8 text-center flex-shrink-0">
                        {idx + 1}
                      </span>

                      <div className="flex-shrink-0">
                        {participant.avatar_url ? (
                          <img
                            src={participant.avatar_url}
                            alt={participant.display_name}
                            className="w-10 h-10 rounded-full border border-border object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent border border-accent/30">
                            {participant.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {participant.display_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-base font-bold text-accent">{participant.current_score}</p>
                          <p className="text-xs text-text-muted">pts</p>
                        </div>
                        {participant.max_streak > 0 && (
                          <div className="flex items-center gap-1 text-orange-400 font-bold">
                            <span>🔥</span>
                            <span className="text-sm">{participant.max_streak}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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
