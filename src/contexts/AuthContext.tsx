import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    let mounted = true;

    const getInitialSession = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ AuthProvider: Error getting initial session:', error);
          setLoading(false);
        } else if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setLoading(false);
        } else {
          // Check if we're in an OAuth redirect
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          
          if (code) {
            console.log('🔄 AuthProvider: OAuth code detected, waiting for processing...');
            // Don't set loading to false yet, let useOAuthRedirect handle it
            return;
          } else {
            // No session and no OAuth code
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ AuthProvider: Unexpected error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        // Only log significant events, not every token refresh
        if (event === 'SIGNED_OUT') {
          console.log('🚪 AuthProvider: User signed out');
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setLoading(false);
          
          // Redirect to login page after sign out
          window.location.href = '/login';
        } else if (event === 'INITIAL_SESSION') {
          if (newSession && !session) { // Only update if we don't already have a session
            setSession(newSession);
            setUser(newSession.user);
            setLoading(false);
          }
        }
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array to run only once

  const signOut = async () => {
    try {
      console.log('🚪 AuthProvider: Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ AuthProvider: Error signing out:', error);
        throw error;
      }
      console.log('✅ AuthProvider: Sign out successful');
      // The onAuthStateChange listener will handle the redirect
    } catch (error) {
      console.error('❌ AuthProvider: Unexpected error during sign out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!session,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
