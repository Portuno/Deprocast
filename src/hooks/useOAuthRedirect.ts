import { useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useOAuthRedirect = () => {
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Only process OAuth redirect once
    if (hasProcessed.current) {
      return;
    }

    console.log('🔄 useOAuthRedirect: Hook executing...');
    
    const handleOAuthRedirect = async () => {
      // Check for OAuth code in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      console.log('🔄 useOAuthRedirect: URL params:', window.location.search);
      console.log('🔄 useOAuthRedirect: OAuth code found:', !!code);
      
      if (code) {
        hasProcessed.current = true;
        console.log('✅ useOAuthRedirect: OAuth code detected, checking if session exists...');
        
        // Check if we already have a session (user might already be authenticated)
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log('✅ useOAuthRedirect: Session already exists, just cleaning URL');
          // Clean the URL since user is already authenticated
          window.history.replaceState(null, '', '/app');
          return;
        }
        
        console.log('✅ useOAuthRedirect: No existing session, processing OAuth code...');
        
        try {
          // Manually exchange the authorization code for a session
          console.log('🔄 useOAuthRedirect: Calling exchangeCodeForSession...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('❌ useOAuthRedirect: Error exchanging code:', error);
            // Clean URL even on error
            window.history.replaceState(null, '', '/app');
          } else if (data.session) {
            console.log('✅ useOAuthRedirect: Session established successfully:', data.user.email);
            // Clean the URL after successful exchange
            window.history.replaceState(null, '', '/app');
            // Force a page reload to ensure the session is properly established
            console.log('🔄 useOAuthRedirect: Forcing page reload...');
            window.location.reload();
          } else {
            console.log('⚠️ useOAuthRedirect: No session data returned');
            window.history.replaceState(null, '', '/app');
          }
        } catch (error) {
          console.error('❌ useOAuthRedirect: Unexpected error:', error);
          window.history.replaceState(null, '', '/app');
        }
      } else {
        console.log('ℹ️ useOAuthRedirect: No OAuth code found in URL');
        hasProcessed.current = true;
      }
    };

    handleOAuthRedirect();
  }, []); // Empty dependency array - only run once
};
