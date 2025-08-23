import { useEffect } from 'react';

export const useOAuthRedirect = () => {
  useEffect(() => {
    const handleOAuthRedirect = () => {
      // Check for OAuth code in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log('OAuth code detected, cleaning URL...');
        
        // Clean the URL by removing the code parameter
        // Let Supabase handle the OAuth flow natively
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
        
        console.log('URL cleaned, Supabase will handle the rest');
      }
    };

    handleOAuthRedirect();
  }, []);
};
