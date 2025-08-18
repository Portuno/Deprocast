import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

type ProtectedRouteProps = {
	children: React.ReactElement;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const [checking, setChecking] = useState(true);
	const [isAuthed, setIsAuthed] = useState(false);

	useEffect(() => {
		let mounted = true;
		(async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (!mounted) return;
			setIsAuthed(!!session);
			setChecking(false);
		})();
		const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
			if (!mounted) return;
			setIsAuthed(!!session);
		});
		return () => { 
			mounted = false; 
			subscription.subscription?.unsubscribe();
		};
	}, []);

	if (checking) return <div className="h-screen flex items-center justify-center text-gray-300">Loading...</div>;
	if (!isAuthed) return <Navigate to="/login" replace />;
	return children;
};

export default ProtectedRoute;


