import { useMemo } from 'react';
import type { SessionParticipant } from '../../types/multiplayer';
import { getMedalForRank } from '../../utils/scoring';

interface LeaderboardProps {
  participants: SessionParticipant[];
  highlightUserId?: string;
  compact?: boolean;
  maxDisplay?: number;
}

export function Leaderboard({
  participants,
  highlightUserId,
  compact = false,
  maxDisplay = 10,
}: LeaderboardProps) {
  const rankedParticipants = useMemo(() => {
    return [...participants]
      .sort((a, b) => {
        if (b.current_score !== a.current_score) {
          return b.current_score - a.current_score;
        }
        return a.total_time_spent - b.total_time_spent;
      })
      .slice(0, maxDisplay)
      .map((p, index) => ({
        ...p,
        rank: index + 1,
      }));
  }, [participants, maxDisplay]);

  if (compact) {
    return (
      <div className="space-y-1">
        {rankedParticipants.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
              p.user_id === highlightUserId
                ? 'bg-accent/10 border border-accent/30'
                : 'bg-bg-tertiary'
            }`}
          >
            <span className="w-6 text-center font-bold text-accent">{p.rank}</span>
            <span className="flex-1 truncate text-text-primary">{p.display_name}</span>
            <span className="font-semibold text-text-primary">{p.current_score}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary/50 border border-border rounded-2xl p-6">
      <h3 className="font-semibold text-lg text-text-primary mb-4 flex items-center gap-2">
        <span>🏆 Leaderboard</span>
        {participants.length > 0 && (
          <span className="text-sm text-text-muted">({participants.length} players)</span>
        )}
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {rankedParticipants.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">No participants yet</p>
        ) : (
          rankedParticipants.map((p) => {
            const medal = getMedalForRank(p.rank);
            const isHighlighted = p.user_id === highlightUserId;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isHighlighted
                    ? 'bg-accent/10 border border-accent/30 ring-2 ring-accent/20'
                    : 'bg-bg-tertiary hover:bg-bg-primary'
                }`}
              >
                {/* Rank/Medal */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span className="font-bold text-text-muted text-sm">{p.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {p.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt={p.display_name}
                      className="w-8 h-8 rounded-full border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                      {p.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isHighlighted ? 'text-accent' : 'text-text-primary'
                    }`}
                  >
                    {p.display_name}
                    {isHighlighted && <span className="ml-2 text-xs text-accent">(You)</span>}
                  </p>
                </div>

                {/* Streak */}
                {p.current_streak > 0 && (
                  <div className="flex-shrink-0 flex items-center gap-1 text-orange-400 text-sm font-bold">
                    <span>🔥</span>
                    <span>{p.current_streak}</span>
                  </div>
                )}

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-accent">{p.current_score}</p>
                  <p className="text-xs text-text-muted">pts</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
