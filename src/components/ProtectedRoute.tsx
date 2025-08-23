import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type ProtectedRouteProps = {
	children: React.ReactElement;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<h1 className="text-2xl font-bold mb-2">Loading...</h1>
					<p className="text-gray-400">Setting up your session...</p>
				</div>
			</div>
		);
	}
	
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}
	
	return children;
};

export default ProtectedRoute;


