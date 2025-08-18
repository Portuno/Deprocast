import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

const Signup: React.FC = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);

	const handleSignup = async () => {
		setError(null);
		setInfo(null);
		if (!email || !password) {
			setError('Please provide email and password.');
			return;
		}
		setLoading(true);
		const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/app' } });
		setLoading(false);
		if (signUpError) {
			setError(signUpError.message);
			return;
		}
		setInfo('Check your inbox to confirm your email.');
		setTimeout(() => navigate('/login'), 1500);
	};

	const handleGoogleSignup = async () => {
		setError(null);
		setLoading(true);
		const { error: oauthError } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: window.location.origin + '/app' }
		});
		setLoading(false);
		if (oauthError) setError(oauthError.message);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
			<div className="w-full max-w-md bg-gray-900/40 border border-gray-700/40 backdrop-blur-xl rounded-2xl p-6">
				<div className="flex items-center justify-between mb-6">
					<Link to="/" className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</Link>
					<h1 className="text-xl font-semibold">Create Account</h1>
				</div>
				<div className="space-y-4">
					<div>
						<label className="block text-sm text-gray-300 mb-2">Email</label>
						<div className="relative">
							<Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
							<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-300 mb-2">Password</label>
						<div className="relative">
							<Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
							<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
						</div>
					</div>
					{error && <p className="text-sm text-red-400">{error}</p>}
					{info && <p className="text-sm text-green-400">{info}</p>}
					<button onClick={handleSignup} disabled={loading} className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:opacity-60">
						{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
						<span>Create Account</span>
					</button>
					<div className="relative my-2">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-700/50" />
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="px-2 bg-gray-900/40 text-gray-400">or</span>
						</div>
					</div>
					<button onClick={handleGoogleSignup} disabled={loading} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:bg-gray-700/60">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12 c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.531,8.063,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.27-7.952 l-6.51,5.021C9.425,39.676,16.13,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.662c0,0,0,0,0,0l6.19,5.238 C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.27-7.952l-6.51,5.021C9.425,39.676,16.13,44,24,44 c8.822,0,16.201-5.986,19.18-14.073C43.862,21.35,44,22.659,43.611,20.083z"/></svg>
						<span>Continue with Google</span>
					</button>
					<div className="flex items-center justify-between text-sm text-gray-400">
						<Link to="/login" className="hover:text-gray-200">Already have an account? Log in</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signup;


