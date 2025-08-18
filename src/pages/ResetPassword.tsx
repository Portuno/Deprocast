import React, { useState } from 'react';
import { Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const ResetPassword: React.FC = () => {
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState(false);

	const handleReset = async () => {
		setError(null);
		if (!password) {
			setError('Please enter a new password.');
			return;
		}
		setLoading(true);
		const { error: updateError } = await supabase.auth.updateUser({ password });
		setLoading(false);
		if (updateError) {
			setError(updateError.message);
			return;
		}
		setDone(true);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
			<div className="w-full max-w-md bg-gray-900/40 border border-gray-700/40 backdrop-blur-xl rounded-2xl p-6">
				<h1 className="text-xl font-semibold mb-6">Set a new password</h1>
				{done ? (
					<div className="flex items-center gap-2 text-green-400">
						<CheckCircle2 className="w-5 h-5" />
						<span>Password updated. You can close this tab.</span>
					</div>
				) : (
					<div className="space-y-4">
						<div>
							<label className="block text-sm text-gray-300 mb-2">New password</label>
							<div className="relative">
								<Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
								<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
							</div>
						</div>
						{error && <p className="text-sm text-red-400">{error}</p>}
						<button onClick={handleReset} disabled={loading} className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:opacity-60">
							{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
							<span>Update password</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ResetPassword;


