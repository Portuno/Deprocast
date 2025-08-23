import { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useOAuthRedirect = () => {
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log('OAuth code detected:', code);
        
        try {
          // Exchange the authorization code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code for session:', error);
            // Clean URL even on error to prevent infinite loops
            window.history.replaceState(null, '', '/app');
          } else if (data.session) {
            console.log('Session established via OAuth code:', data.user.email);
            
            // Clean the URL after successful exchange
            window.history.replaceState(null, '', '/app');
            
            // Force a page reload to ensure the session is properly established
            window.location.reload();
          }
        } catch (error) {
          console.error('Unexpected error processing OAuth code:', error);
          // Clean URL on any error
          window.history.replaceState(null, '', '/app');
        }
      }
    };

    handleOAuthRedirect();
  }, []);
};
