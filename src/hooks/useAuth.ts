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
        // Check if we have a hash fragment (OAuth redirect)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log('OAuth redirect detected, processing...');
          
          // Wait a bit for the OAuth flow to complete
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try to get the session again
          const { data: { session: newSession }, error } = await supabase.auth.getSession();
          
          if (!mounted) return;
          
          if (error) {
            console.error('Error getting session after OAuth:', error);
          } else if (newSession) {
            console.log('OAuth session established:', newSession.user.email);
            setSession(newSession);
            setUser(newSession.user);
            
            // Clear the hash fragment from the URL
            if (window.history.replaceState) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
          }
        } else {
          // Normal session check
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (!mounted) return;
          
          if (error) {
            console.error('Error getting initial session:', error);
          } else if (currentSession) {
            console.log('Initial session found:', currentSession.user.email);
            setSession(currentSession);
            setUser(currentSession.user);
          }
        }
      } catch (error) {
        console.error('Unexpected error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, newSession?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          
          // Redirect to login page after sign out
          window.location.href = '/login';
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
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
