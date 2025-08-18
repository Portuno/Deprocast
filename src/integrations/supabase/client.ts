import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
	// eslint-disable-next-line no-console
	console.warn('Supabase URL or anon key is not set. Auth will not work until environment variables are provided.');
}

let client: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
	client = createClient(supabaseUrl, supabaseAnonKey);
}

// Fallback shim to prevent hard crashes during local setup without envs
const missingEnvMessage = 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local and restart the dev server.';
export const supabase = (client ?? ({
	auth: {
		async signInWithPassword() { throw new Error(missingEnvMessage); },
		async signInWithOAuth() { throw new Error(missingEnvMessage); },
		async signUp() { throw new Error(missingEnvMessage); },
		async resetPasswordForEmail() { throw new Error(missingEnvMessage); },
		async updateUser() { throw new Error(missingEnvMessage); },
		async getSession() { return { data: { session: null }, error: new Error(missingEnvMessage) } as any; },
	},
} as unknown as SupabaseClient));


