import { useEffect, useState, useCallback } from 'react';
import { PresenceData } from '../types/multiplayer';
import { useRealtimeChannel } from './useRealtimeChannel';

interface UsePresenceOptions {
  roomCode: string;
  userId: string;
  displayName: string;
  isHost: boolean;
}

interface PresenceState {
  [userId: string]: PresenceData[];
}

export function usePresence(options: UsePresenceOptions) {
  const { roomCode, userId, displayName, isHost } = options;
  const [presence, setPresence] = useState<PresenceState>({});
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  const presenceData: PresenceData = {
    user_id: userId,
    display_name: displayName,
    is_host: isHost,
    is_connected: true,
    joined_at: Date.now(),
  };

  const { trackPresence, updatePresence, untrackPresence } = useRealtimeChannel({
    roomCode,
    onPresenceChange: (event) => {
      if (event.type === 'sync' || event.type === 'join' || event.type === 'leave') {
        const newState = event.newPresences || {};
        setPresence(newState);

        // Extract active user IDs
        const users = Object.keys(newState);
        setActiveUsers(users);
      }
    },
  });

  // Track presence on mount
  useEffect(() => {
    trackPresence(presenceData);

    // Send heartbeat every 5 seconds
    const heartbeatInterval = setInterval(() => {
      updatePresence({
        ...presenceData,
        is_connected: true,
        joined_at: presenceData.joined_at,
      });
    }, 5000);

    return () => {
      clearInterval(heartbeatInterval);
      untrackPresence();
    };
  }, [userId, displayName, isHost, roomCode]);

  // Get all active participants
  const getActiveParticipants = useCallback(() => {
    return Object.entries(presence).flatMap(([userId, presenceList]) => {
      return presenceList.map((data) => ({
        userId,
        ...data,
      }));
    });
  }, [presence]);

  // Check if a specific user is active
  const isUserActive = useCallback(
    (checkUserId: string) => {
      return activeUsers.includes(checkUserId);
    },
    [activeUsers]
  );

  // Get participant count
  const participantCount = activeUsers.length;

  // Get host info
  const hostInfo = Object.entries(presence)
    .flatMap(([userId, presenceList]) => {
      return presenceList.map((data) => ({
        userId,
        ...data,
      }));
    })
    .find((p) => p.is_host);

  return {
    presence,
    activeUsers,
    participantCount,
    getActiveParticipants,
    isUserActive,
    hostInfo,
  };
}
