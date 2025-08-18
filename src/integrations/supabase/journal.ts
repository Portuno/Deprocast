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

  const insertPayload = {
    user_id: user.id,
    project_id: payload.project_id ?? null,
    entry_date: payload.entry_date || new Date().toISOString().slice(0, 10),
    title: payload.title,
    content: payload.content,
    mood: payload.mood,
    tags: payload.tags ?? [],
    energy: payload.energy ?? null,
    focus: payload.focus ?? null,
    emotions: payload.emotions ?? [],
    summary: payload.summary ?? null,
    key_event: payload.key_event ?? null,
  } as const;

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(insertPayload)
    .select('*')
    .single();
  if (error) throw error;
  return data as DbJournalEntry;
}


