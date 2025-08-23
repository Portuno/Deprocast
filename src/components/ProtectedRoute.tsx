import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOAuthRedirect } from '../hooks/useOAuthRedirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // Use the simplified OAuth redirect hook
  useOAuthRedirect();

  // Debug logging
  useEffect(() => {
    console.log('🛡️ ProtectedRoute: State update:', { 
      user: user?.email, 
      loading, 
      hasSession: !!session,
      sessionExpiry: session?.expires_at 
    });
  }, [user, loading, session]);

  // Simple fallback loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log('⏰ ProtectedRoute: Fallback timeout reached');
        setFallbackLoading(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timer);
    } else {
      setFallbackLoading(false);
    }
  }, [loading]);

  if (loading) {
    console.log('🛡️ ProtectedRoute: Still loading, showing loading screen');
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Loading... Setting up your session...</h1>
          <p className="text-gray-400 mb-6">Please wait...</p>
          
          {fallbackLoading && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">If this takes too long, try:</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Force Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🛡️ ProtectedRoute: No user found, redirecting to login');
    console.log('🛡️ ProtectedRoute: User state:', user);
    console.log('🛡️ ProtectedRoute: Session state:', session);
    return <Navigate to="/login" replace />;
  }

  console.log('🛡️ ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;


