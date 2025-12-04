import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    // Check for demo user in sessionStorage on init
    const demoUser = sessionStorage.getItem('demo_user');
    if (demoUser) {
      return JSON.parse(demoUser);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have a demo user from sessionStorage, skip auth loading
    if (user?.id === 'demo-user-123') {
      setLoading(false);
      return;
    }

    // Skip auth setup if Supabase isn't configured
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Handle OAuth callback and clean up URL parameters
    const handleAuthCallback = async () => {
      // Check if we're returning from OAuth
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      const hasAuthParams = hashParams.has('access_token') || queryParams.has('access_token');
      
      if (hasAuthParams) {
        // Clean up URL immediately to prevent stale URL warnings
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Get session - Supabase will handle the OAuth callback internally
        try {
          const { data: { session }, error } = await supabase!.auth.getSession();
          
          if (session && !error) {
            setUser(session.user);
            setLoading(false);
          } else {
            // If no session, try to get a fresh one
            const { data: { session: freshSession } } = await supabase!.auth.getSession();
            setUser(freshSession?.user ?? null);
            setLoading(false);
          }
        } catch (err) {
          // If there's an error (e.g., stale token), just get current session
          console.warn('OAuth callback handling:', err);
          const { data: { session } } = await supabase!.auth.getSession();
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } else {
        // Normal session check
        const { data: { session } } = await supabase!.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    handleAuthCallback();

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Clean up URL on auth state change if we have hash/query params
      const hasAuthParams = window.location.hash.includes('access_token') || 
                           window.location.search.includes('access_token') ||
                           window.location.hash.includes('error');
      
      if (hasAuthParams) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id]);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
    }

    const { error } = await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInAsDemo = () => {
    // Create a mock user for demo/development purposes
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@quizcreator.app',
      user_metadata: {
        full_name: 'Demo User',
        avatar_url: null,
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    sessionStorage.setItem('demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const signOut = async () => {
    // Allow signing out in dev/demo mode
    if (!isSupabaseConfigured || user?.id === 'demo-user-123') {
      sessionStorage.removeItem('demo_user');
      setUser(null);
      return;
    }

    const { error } = await supabase!.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInAsDemo,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
