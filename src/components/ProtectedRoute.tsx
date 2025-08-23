import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOAuthRedirect } from '../hooks/useOAuthRedirect';

type ProtectedRouteProps = {
	children: React.ReactElement;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	const [fallbackLoading, setFallbackLoading] = useState(false);
	const [isOAuthRedirect, setIsOAuthRedirect] = useState(false);
	
	// Process OAuth redirects first
	useOAuthRedirect();

	// Check if we're in an OAuth redirect
	useEffect(() => {
		const hash = window.location.hash;
		if (hash && hash.includes('access_token')) {
			setIsOAuthRedirect(true);
		}
	}, []);

	// Fallback mechanism: if loading takes too long, show a timeout message
	useEffect(() => {
		if (loading) {
			const timeout = setTimeout(() => {
				setFallbackLoading(true);
			}, 10000); // 10 seconds timeout

			return () => clearTimeout(timeout);
		} else {
			setFallbackLoading(false);
		}
	}, [loading]);

	if (loading) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<h1 className="text-2xl font-bold mb-2">Loading...</h1>
					
					{isOAuthRedirect ? (
						<div className="space-y-2">
							<p className="text-blue-300">Processing Google login...</p>
							<p className="text-gray-400 text-sm">Setting up your session</p>
						</div>
					) : (
						<p className="text-gray-400">Setting up your session...</p>
					)}
					
					{fallbackLoading && (
						<div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700/30 rounded-lg">
							<p className="text-yellow-300 text-sm mb-2">Taking longer than expected?</p>
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
							>
								Refresh Page
							</button>
						</div>
					)}
				</div>
			</div>
		);
	}
	
	if (!isAuthenticated) {
		console.log('User not authenticated, redirecting to login');
		return <Navigate to="/login" replace />;
	}
	
	console.log('User authenticated, rendering protected content');
	return children;
};

export default ProtectedRoute;


