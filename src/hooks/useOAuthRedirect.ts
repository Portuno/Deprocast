import { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useOAuthRedirect = () => {
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      console.log('useOAuthRedirect hook executing...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log('OAuth code detected:', code);
        console.log('Starting code exchange process...');
        
        try {
          console.log('Calling supabase.auth.exchangeCodeForSession...');
          
          // Exchange the authorization code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          console.log('Exchange result:', { data, error });
          
          if (error) {
            console.error('Error exchanging code for session:', error);
            // Clean URL even on error to prevent infinite loops
            window.history.replaceState(null, '', '/app');
            console.log('URL cleaned after error');
          } else if (data.session) {
            console.log('Session established via OAuth code:', data.user.email);
            console.log('Session data:', data.session);
            
            // Clean the URL after successful exchange
            window.history.replaceState(null, '', '/app');
            console.log('URL cleaned after successful exchange');
            
            // Force a page reload to ensure the session is properly established
            console.log('Forcing page reload...');
            window.location.reload();
          } else {
            console.log('No session data returned from exchange');
            // Clean URL even if no session
            window.history.replaceState(null, '', '/app');
          }
        } catch (error) {
          console.error('Unexpected error processing OAuth code:', error);
          // Clean URL on any error
          window.history.replaceState(null, '', '/app');
          console.log('URL cleaned after unexpected error');
        }
      } else {
        console.log('No OAuth code found in URL');
      }
    };

    handleOAuthRedirect();
  }, []);
};
