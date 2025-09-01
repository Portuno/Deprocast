import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ useAuth: Error getting initial session:', error);
          setLoading(false);
        } else if (currentSession) {
          console.log('✅ useAuth: Session found:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          setLoading(false);
        } else {
          console.log('ℹ️ useAuth: No session found');
          // Check if we're in an OAuth redirect
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          
          if (code) {
            console.log('🔄 useAuth: OAuth code detected, waiting for processing...');
            // Don't set loading to false yet, let useOAuthRedirect handle it
            return;
          } else {
            // No session and no OAuth code
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ useAuth: Unexpected error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log('🔄 useAuth: Auth state change event:', event, 'User:', newSession?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('✅ useAuth: User signed in:', newSession?.user?.email);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 useAuth: User signed out');
          setSession(null);
          setUser(null);
          setLoading(false);
          
          // Redirect to login page after sign out
          window.location.href = '/login';
        } else if (event === 'INITIAL_SESSION') {
          console.log('🔄 useAuth: Initial session event:', newSession?.user?.email);
          if (newSession && !session) { // Only update if we don't already have a session
            setSession(newSession);
            setUser(newSession.user);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🚪 useAuth: Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ useAuth: Error signing out:', error);
        throw error;
      }
      console.log('✅ useAuth: Sign out successful');
      // The onAuthStateChange listener will handle the redirect
    } catch (error) {
      console.error('❌ useAuth: Unexpected error during sign out:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!session,
  };
};
