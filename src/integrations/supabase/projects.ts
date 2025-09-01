import { supabase } from './client';

export type DbProject = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_completion_date: string;
  category: string | null;
  motivation: string | null;
  perceived_difficulty: number | null;
  known_obstacles: string | null;
  skills_resources_needed: string[] | null;
  created_at: string;
  updated_at: string;
};

export const listProjects = async (): Promise<DbProject[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbProject[];
};

export type NewProjectPayload = {
  title: string;
  description: string;
  target_completion_date: string;
  category?: string | null;
  motivation?: string | null;
  perceived_difficulty?: number | null;
  known_obstacles?: string | null;
  skills_resources_needed?: string[] | null;
};

export const createProject = async (payload: NewProjectPayload): Promise<DbProject> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...payload, user_id: user.id })
    .select('*')
    .single();
  if (error) throw error;
  broadcastProjectsChanged();
  return data as DbProject;
};

export type UpdateProjectPayload = Partial<{
  title: string;
  description: string;
  target_completion_date: string;
  category: string | null;
  motivation: string | null;
  perceived_difficulty: number | null;
  known_obstacles: string | null;
  skills_resources_needed: string[] | null;
}>;

export const updateProject = async (id: string, updates: UpdateProjectPayload): Promise<DbProject> => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  broadcastProjectsChanged();
  return data as DbProject;
};

export const deleteProject = async (id: string): Promise<void> => {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  broadcastProjectsChanged();
};

export const broadcastProjectsChanged = (): void => {
  try { localStorage.setItem('deprocast:projects:changed', String(Date.now())); } catch { /* ignore */ }
};


