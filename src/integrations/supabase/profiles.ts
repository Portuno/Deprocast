import { supabase } from './client';

export type ProfileRecord = {
	id: string;
	user_id: string;
	email: string;
	full_name: string | null;
	timezone: string | null;
	working_hours: string | null;
	focus_goal: string | null;
	theme: string | null;
	onboarding_completed: boolean;
	is_premium: boolean;
	created_at: string;
	updated_at: string;
};

export const getOrCreateProfile = async (): Promise<ProfileRecord | null> => {
	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) return null;

	const { data: existing, error: selectError } = await supabase
		.from('profiles')
		.select('*')
		.eq('user_id', user.id)
		.single();

	if (!selectError && existing) return existing as ProfileRecord;

	// Create from auth metadata
	const fullName =
		(user.user_metadata?.full_name as string | undefined) ||
		(user.user_metadata?.name as string | undefined) ||
		[user.user_metadata?.given_name, user.user_metadata?.family_name].filter(Boolean).join(' ') ||
		null;

	const insertPayload = {
		user_id: user.id,
		email: user.email,
		full_name: fullName,
		timezone: 'UTC',
		working_hours: '9:00 AM - 6:00 PM',
		focus_goal: '4 hours',
		theme: 'dark',
		onboarding_completed: false,
		is_premium: false,
	};

	const { data: created, error: insertError } = await supabase
		.from('profiles')
		.insert(insertPayload)
		.select('*')
		.single();

	if (insertError) throw insertError;
	return created as ProfileRecord;
};

export const updateProfile = async (updates: Partial<Omit<ProfileRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');
	const { data, error } = await supabase
		.from('profiles')
		.update(updates)
		.eq('user_id', user.id)
		.select('*')
		.single();
	if (error) throw error;
	return data as ProfileRecord;
};


