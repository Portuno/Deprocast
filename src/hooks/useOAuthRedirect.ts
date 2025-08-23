import { useEffect } from 'react';

export const useOAuthRedirect = () => {
  useEffect(() => {
    console.log('🔄 useOAuthRedirect: Hook executing...');
    
    const handleOAuthRedirect = () => {
      // Check for OAuth code in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      console.log('🔄 useOAuthRedirect: URL params:', window.location.search);
      console.log('🔄 useOAuthRedirect: OAuth code found:', !!code);
      
      if (code) {
        console.log('✅ useOAuthRedirect: OAuth code detected, cleaning URL...');
        
        // Clean the URL by removing the code parameter
        // Let Supabase handle the OAuth flow natively
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
        
        console.log('✅ useOAuthRedirect: URL cleaned to:', cleanUrl);
        console.log('✅ useOAuthRedirect: Supabase will handle the rest');
      } else {
        console.log('ℹ️ useOAuthRedirect: No OAuth code found in URL');
      }
    };

    handleOAuthRedirect();
  }, []);
};
