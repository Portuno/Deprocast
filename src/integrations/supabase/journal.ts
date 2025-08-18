import { supabase } from './client';

export type DbJournalEntry = {
  id: string;
  user_id: string;
  project_id: string | null;
  entry_date: string; // ISO date (YYYY-MM-DD)
  title: string;
  content: string;
  mood: 'great' | 'good' | 'neutral' | 'low' | 'stressed';
  tags: string[] | null;
  energy: number | null;
  focus: number | null;
  emotions: string[] | null;
  summary: string | null;
  key_event: { type: 'win' | 'loss'; text: string; timeOfDay?: string; trigger?: string } | null;
  created_at: string;
  updated_at: string;
};

export type CreateJournalPayload = {
  project_id?: string | null;
  entry_date?: string; // default today
  title: string;
  content: string;
  mood: DbJournalEntry['mood'];
  tags?: string[];
  energy?: number | null;
  focus?: number | null;
  emotions?: string[];
  summary?: string;
  key_event?: DbJournalEntry['key_event'];
};

export type UpdateJournalPayload = Partial<CreateJournalPayload>;

export async function listJournalEntries(): Promise<DbJournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbJournalEntry[];
}

export async function createJournalEntry(payload: CreateJournalPayload): Promise<DbJournalEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Build payload while avoiding non-existent columns in older schemas (e.g., tags)
  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    project_id: payload.project_id ?? null,
    entry_date: payload.entry_date || new Date().toISOString().slice(0, 10),
    title: payload.title,
    content: payload.content,
    mood: payload.mood,
    energy: payload.energy ?? null,
    focus: payload.focus ?? null,
    emotions: payload.emotions ?? [],
    summary: payload.summary ?? null,
    key_event: payload.key_event ?? null,
  };

  // Only include tags if provided to remain compatible before the DB migration is applied
  if (typeof payload.tags !== 'undefined') {
    insertPayload.tags = payload.tags;
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(insertPayload)
    .select('*')
    .single();
  if (error) throw error;
  return data as DbJournalEntry;
}

export async function updateJournalEntry(id: string, payload: UpdateJournalPayload): Promise<DbJournalEntry> {
  const updates: Record<string, unknown> = {};
  if (typeof payload.project_id !== 'undefined') updates.project_id = payload.project_id;
  if (typeof payload.entry_date !== 'undefined') updates.entry_date = payload.entry_date;
  if (typeof payload.title !== 'undefined') updates.title = payload.title;
  if (typeof payload.content !== 'undefined') updates.content = payload.content;
  if (typeof payload.mood !== 'undefined') updates.mood = payload.mood;
  if (typeof payload.tags !== 'undefined') updates.tags = payload.tags;
  if (typeof payload.energy !== 'undefined') updates.energy = payload.energy;
  if (typeof payload.focus !== 'undefined') updates.focus = payload.focus;
  if (typeof payload.emotions !== 'undefined') updates.emotions = payload.emotions;
  if (typeof payload.summary !== 'undefined') updates.summary = payload.summary;
  if (typeof payload.key_event !== 'undefined') updates.key_event = payload.key_event;

  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as DbJournalEntry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}


