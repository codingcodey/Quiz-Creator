import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import type { MultiplayerSession, SessionParticipant, SessionStatus } from '../types/multiplayer';
import type { Quiz } from '../types/quiz';

export function useMultiplayerSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new multiplayer session
  const createSession = useCallback(
    async (
      quizId: string,
      quiz: Quiz,
      gameMode: string,
      modeConfig: Record<string, any>,
      hostUserId: string
    ): Promise<MultiplayerSession | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        // Call the room code generator function
        const { data: codeData, error: codeError } = await supabase.rpc('generate_unique_room_code');

        if (codeError || !codeData) {
          throw new Error('Failed to generate room code');
        }

        const roomCode = codeData as string;

        // Create session record
        const { data, error: createError } = await supabase
          .from('multiplayer_sessions')
          .insert({
            room_code: roomCode,
            quiz_id: quizId,
            host_user_id: hostUserId,
            game_mode: gameMode,
            mode_config: modeConfig,
            status: 'lobby',
            current_question_index: 0,
            quiz_snapshot: quiz,
            created_at: Date.now(),
            expires_at: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
          })
          .select()
          .single();

        if (createError || !data) {
          throw createError || new Error('Failed to create session');
        }

        return data as MultiplayerSession;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error creating session:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get session by room code
  const getSessionByRoomCode = useCallback(
    async (roomCode: string): Promise<MultiplayerSession | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const { data, error: fetchError } = await supabase
          .from('multiplayer_sessions')
          .select()
          .eq('room_code', roomCode)
          .in('status', ['lobby', 'in_progress'])
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Room not found');
            return null;
          } else {
            throw fetchError;
          }
        }

        return data as MultiplayerSession;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching session:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Join session as participant
  const joinSession = useCallback(
    async (
      sessionId: string,
      userId: string,
      displayName: string,
      avatarUrl?: string
    ): Promise<SessionParticipant | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const { data, error: joinError } = await supabase
          .from('session_participants')
          .insert({
            session_id: sessionId,
            user_id: userId,
            display_name: displayName,
            avatar_url: avatarUrl,
            joined_at: Date.now(),
            last_seen_at: Date.now(),
            is_connected: true,
            is_kicked: false,
            current_score: 0,
            current_streak: 0,
            max_streak: 0,
            total_time_spent: 0,
          })
          .select()
          .single();

        if (joinError) {
          if (joinError.code === '23505') {
            // Unique constraint violation - already joined
            setError('You are already in this room');
            return null;
          } else {
            throw joinError;
          }
        }

        return data as SessionParticipant;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error joining session:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Leave session
  const leaveSession = useCallback(
    async (_sessionId: string, participantId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const { error: deleteError } = await supabase
          .from('session_participants')
          .delete()
          .eq('id', participantId);

        if (deleteError) {
          throw deleteError;
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error leaving session:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update session status
  const updateSessionStatus = useCallback(
    async (sessionId: string, status: SessionStatus): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const { error: updateError } = await supabase
          .from('multiplayer_sessions')
          .update({ status })
          .eq('id', sessionId);

        if (updateError) {
          throw updateError;
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error updating session:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update session game state
  const updateSessionGameState = useCallback(
    async (
      sessionId: string,
      currentQuestionIndex: number,
      questionStartedAt?: number,
      questionTimeLimit?: number
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const { error: updateError } = await supabase
          .from('multiplayer_sessions')
          .update({
            current_question_index: currentQuestionIndex,
            question_started_at: questionStartedAt,
            question_time_limit: questionTimeLimit,
          })
          .eq('id', sessionId);

        if (updateError) {
          throw updateError;
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error updating session game state:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get session participants
  const getParticipants = useCallback(
    async (sessionId: string): Promise<SessionParticipant[]> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const { data, error: fetchError } = await supabase
          .from('session_participants')
          .select()
          .eq('session_id', sessionId)
          .eq('is_kicked', false)
          .order('joined_at', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        return (data as SessionParticipant[]) || [];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching participants:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Kick participant
  const kickParticipant = useCallback(
    async (participantId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const { error: updateError } = await supabase
          .from('session_participants')
          .update({ is_kicked: true })
          .eq('id', participantId);

        if (updateError) {
          throw updateError;
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error kicking participant:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update participant score
  const updateParticipantScore = useCallback(
    async (
      participantId: string,
      score: number,
      streak: number,
      maxStreak: number,
      timeSpent: number
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const { error: updateError } = await supabase
          .from('session_participants')
          .update({
            current_score: score,
            current_streak: streak,
            max_streak: Math.max(maxStreak, streak),
            total_time_spent: timeSpent,
          })
          .eq('id', participantId);

        if (updateError) {
          throw updateError;
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error updating participant score:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createSession,
    getSessionByRoomCode,
    joinSession,
    leaveSession,
    updateSessionStatus,
    updateSessionGameState,
    getParticipants,
    kickParticipant,
    updateParticipantScore,
  };
}
