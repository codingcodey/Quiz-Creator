import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { RealtimeEvent, ConnectionStatus, ConnectionState } from '../types/multiplayer';

interface UseRealtimeChannelOptions {
  roomCode: string;
  onEvent?: (event: RealtimeEvent) => void;
  onPresenceChange?: (event: any) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  autoConnect?: boolean;
}

export function useRealtimeChannel(options: UseRealtimeChannelOptions) {
  const { roomCode, onEvent, onPresenceChange, onStatusChange, autoConnect = true } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [status, setStatus] = useState<ConnectionStatus>({
    state: 'connecting',
    lastUpdate: Date.now(),
    reconnectAttempts: 0,
  });

  // Initialize channel
  useEffect(() => {
    if (!supabase || !autoConnect) return;

    const channelName = `multiplayer:room:${roomCode}`;

    // Create channel
    channelRef.current = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: roomCode },
      },
    });

    const channel = channelRef.current;

    // Subscribe to broadcasts (game events)
    channel.on('broadcast', { event: '*' }, (message) => {
      if (onEvent) {
        onEvent(message.payload as RealtimeEvent);
      }
    });

    // Subscribe to presence changes
    channel.on('presence', { event: '*' }, (message) => {
      if (onPresenceChange) {
        onPresenceChange(message);
      }
    });

    // Handle connection state
    channel.on('system', { event: 'join' }, () => {
      setStatus({
        state: 'connected',
        lastUpdate: Date.now(),
        reconnectAttempts: 0,
      });
      if (onStatusChange) {
        onStatusChange({
          state: 'connected',
          lastUpdate: Date.now(),
          reconnectAttempts: 0,
        });
      }
      reconnectAttemptsRef.current = 0;
    });

    channel.on('system', { event: 'leave' }, () => {
      setStatus({
        state: 'disconnected',
        lastUpdate: Date.now(),
        reconnectAttempts: reconnectAttemptsRef.current,
      });
      if (onStatusChange) {
        onStatusChange({
          state: 'disconnected',
          lastUpdate: Date.now(),
          reconnectAttempts: reconnectAttemptsRef.current,
        });
      }
    });

    // Subscribe to channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setStatus({
          state: 'connected',
          lastUpdate: Date.now(),
          reconnectAttempts: 0,
        });
      } else if (status === 'CHANNEL_ERROR') {
        setStatus({
          state: 'error',
          lastUpdate: Date.now(),
          errorMessage: 'Channel error',
          reconnectAttempts: reconnectAttemptsRef.current,
        });
      } else if (status === 'TIMED_OUT') {
        reconnectAttemptsRef.current++;
        setStatus({
          state: 'connecting',
          lastUpdate: Date.now(),
          reconnectAttempts: reconnectAttemptsRef.current,
        });
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomCode, autoConnect, onEvent, onPresenceChange, onStatusChange]);

  // Broadcast event
  const broadcastEvent = useCallback(
    async (event: RealtimeEvent) => {
      if (!channelRef.current) {
        console.error('Channel not connected');
        return;
      }

      return channelRef.current.send({
        type: 'broadcast',
        event: event.type,
        payload: event,
      });
    },
    []
  );

  // Track presence
  const trackPresence = useCallback(
    async (data: Record<string, any>) => {
      if (!channelRef.current) {
        console.error('Channel not connected');
        return;
      }

      return channelRef.current.track(data);
    },
    []
  );

  // Update presence
  const updatePresence = useCallback(
    async (data: Record<string, any>) => {
      if (!channelRef.current) {
        console.error('Channel not connected');
        return;
      }

      return channelRef.current.track(data);
    },
    []
  );

  // Untrack presence
  const untrackPresence = useCallback(async () => {
    if (!channelRef.current) {
      console.error('Channel not connected');
      return;
    }

    return channelRef.current.untrack();
  }, []);

  // Reconnect manually
  const reconnect = useCallback(async () => {
    if (!channelRef.current) {
      console.error('Channel not initialized');
      return;
    }

    try {
      await channelRef.current.subscribe();
      reconnectAttemptsRef.current = 0;
    } catch (error) {
      reconnectAttemptsRef.current++;
      console.error('Failed to reconnect:', error);
      throw error;
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(async () => {
    if (!channelRef.current) return;

    try {
      await channelRef.current.untrack();
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setStatus({
        state: 'disconnected',
        lastUpdate: Date.now(),
        reconnectAttempts: 0,
      });
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, []);

  return {
    status,
    broadcastEvent,
    trackPresence,
    updatePresence,
    untrackPresence,
    reconnect,
    disconnect,
    isConnected: status.state === 'connected',
  };
}
