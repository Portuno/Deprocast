import { useEffect } from 'react';

export const useOAuthRedirect = () => {
  useEffect(() => {
    const handleOAuthRedirect = () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        console.log('OAuth redirect detected, cleaning hash fragment...');
        
        // Just clean the hash fragment and let Supabase handle the rest
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          console.log('Hash fragment cleaned from URL');
        }
      }
    };

    handleOAuthRedirect();
  }, []);
};
