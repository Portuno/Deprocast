import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let sessionCheckInterval: NodeJS.Timeout | null = null;

    const getInitialSession = async () => {
      try {
        console.log('Checking for existing session...');
        
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else if (currentSession) {
          console.log('Session found:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          setLoading(false);
          return;
        } else {
          console.log('No existing session found');
          
          // Check if we're in an OAuth redirect
          const hash = window.location.hash;
          if (hash && hash.includes('access_token')) {
            console.log('OAuth redirect detected, starting session polling...');
            
            // Start polling for session establishment
            sessionCheckInterval = setInterval(async () => {
              if (!mounted) return;
              
              console.log('Polling for session...');
              const { data: { session: polledSession }, error: pollError } = await supabase.auth.getSession();
              
              if (pollError) {
                console.error('Error polling for session:', pollError);
              } else if (polledSession) {
                console.log('Session established via polling:', polledSession.user.email);
                setSession(polledSession);
                setUser(polledSession.user);
                setLoading(false);
                
                // Clear the interval
                if (sessionCheckInterval) {
                  clearInterval(sessionCheckInterval);
                  sessionCheckInterval = null;
                }
              }
            }, 1000); // Check every second
            
            // Stop polling after 10 seconds
            setTimeout(() => {
              if (sessionCheckInterval) {
                clearInterval(sessionCheckInterval);
                sessionCheckInterval = null;
                console.log('Session polling timeout, setting loading to false');
                setLoading(false);
              }
            }, 10000);
            
            return; // Don't set loading to false yet
          }
        }
      } catch (error) {
        console.error('Unexpected error in getInitialSession:', error);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, newSession?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          
          // Clear any polling interval
          if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
            sessionCheckInterval = null;
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
          setLoading(false);
          
          // Redirect to login page after sign out
          window.location.href = '/login';
        }
      }
    );

    return () => {
      mounted = false;
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      console.log('Sign out successful');
      // The onAuthStateChange listener will handle the redirect
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
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
