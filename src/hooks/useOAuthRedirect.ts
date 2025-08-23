import { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useOAuthRedirect = () => {
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        console.log('OAuth redirect detected, processing hash fragment...');
        
        try {
          // Parse the hash to extract the access token
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken) {
            console.log('Access token found in hash, setting session...');
            
            // Set the session manually using the tokens from the hash
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Error setting session from hash:', error);
            } else if (data.session) {
              console.log('Session established from hash:', data.session.user.email);
              
              // Clear the hash fragment from the URL
              if (window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
              
              // Force a page reload to ensure the session is properly established
              window.location.reload();
            }
          }
        } catch (error) {
          console.error('Error processing OAuth hash:', error);
        }
      }
    };

    handleOAuthRedirect();
  }, []);
};
