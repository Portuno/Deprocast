import React, { useState } from 'react';
import { Mail, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

const ForgotPassword: React.FC = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);

	const handleReset = async () => {
		setError(null);
		setInfo(null);
		if (!email) {
			setError('Please enter your email.');
			return;
		}
		setLoading(true);
		const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: window.location.origin + '/reset-password'
		});
		setLoading(false);
		if (resetError) {
			setError(resetError.message);
			return;
		}
		setInfo('If an account exists, a reset link has been sent to your email.');
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
			<div className="w-full max-w-md bg-gray-900/40 border border-gray-700/40 backdrop-blur-xl rounded-2xl p-6">
				<div className="flex items-center justify-between mb-6">
					<Link to="/login" className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</Link>
					<h1 className="text-xl font-semibold">Forgot Password</h1>
				</div>
				<div className="space-y-4">
					<div>
						<label className="block text-sm text-gray-300 mb-2">Email</label>
						<div className="relative">
							<Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
							<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
						</div>
					</div>
					{error && <p className="text-sm text-red-400">{error}</p>}
					{info && <p className="text-sm text-green-400">{info}</p>}
					<button onClick={handleReset} disabled={loading} className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:opacity-60">
						{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
						<span>Send reset link</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;


