import { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useOAuthRedirect = () => {
  useEffect(() => {
    console.log('🔄 useOAuthRedirect: Hook executing...');
    
    const handleOAuthRedirect = async () => {
      // Check for OAuth code in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      console.log('🔄 useOAuthRedirect: URL params:', window.location.search);
      console.log('🔄 useOAuthRedirect: OAuth code found:', !!code);
      
      if (code) {
        console.log('✅ useOAuthRedirect: OAuth code detected, processing...');
        
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
      }
    };

    handleOAuthRedirect();
  }, []);
};
