import { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useOAuthRedirect = () => {
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        console.log('OAuth redirect detected, processing hash fragment...');
        console.log('Hash content:', hash);
        
        try {
          // Parse the hash to extract the access token
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const tokenType = params.get('token_type');
          
          console.log('Parsed tokens:', { 
            accessToken: accessToken ? 'Found' : 'Missing',
            refreshToken: refreshToken ? 'Found' : 'Missing',
            tokenType: tokenType || 'Not specified'
          });
          
          if (accessToken) {
            console.log('Access token found in hash, attempting to establish session...');
            
            // Try method 1: setSession with tokens
            try {
              console.log('Method 1: Using setSession...');
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              
              if (error) {
                console.error('setSession error:', error);
                throw error;
              }
              
              if (data.session) {
                console.log('Session established via setSession:', data.session.user.email);
                
                // Clear the hash fragment from the URL
                if (window.history.replaceState) {
                  window.history.replaceState(null, '', window.location.pathname + window.location.search);
                }
                
                // Force a page reload to ensure the session is properly established
                console.log('Reloading page to establish session...');
                window.location.reload();
                return;
              }
            } catch (setSessionError) {
              console.error('setSession failed, trying alternative method:', setSessionError);
            }
            
            // Try method 2: manually set the session in localStorage and refresh
            try {
              console.log('Method 2: Setting session in localStorage...');
              
              // Store the tokens in localStorage (Supabase format)
              const sessionData = {
                access_token: accessToken,
                refresh_token: refreshToken || '',
                expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
                token_type: tokenType || 'bearer',
                user: {
                  id: 'temp-user-id',
                  email: 'temp@example.com',
                  user_metadata: {}
                }
              };
              
              localStorage.setItem('sb-hiipxfzsdjgpgrbarxkb-auth-token', JSON.stringify(sessionData));
              
              console.log('Session data stored in localStorage, reloading...');
              
              // Clear the hash fragment from the URL
              if (window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
              
              // Force a page reload
              window.location.reload();
              return;
              
            } catch (localStorageError) {
              console.error('localStorage method failed:', localStorageError);
            }
            
            // Try method 3: redirect to login with a special parameter
            console.log('All methods failed, redirecting to login...');
            window.location.href = '/login?oauth_error=true';
            
          } else {
            console.error('No access token found in hash');
          }
        } catch (error) {
          console.error('Error processing OAuth hash:', error);
          console.error('Hash content was:', hash);
        }
      }
    };

    handleOAuthRedirect();
  }, []);
};
