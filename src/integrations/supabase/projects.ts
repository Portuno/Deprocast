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
  target_completion_date?: string;
  project_type?: string | null;
  perceived_difficulty?: number | null;
  motivation?: string | null;
  known_obstacles?: string | string[] | null;
  skills_needed?: string[] | null;
};

export const createProject = async (payload: NewProjectPayload): Promise<DbProject> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Map the new payload structure to the database structure
  const dbPayload = {
    user_id: user.id,
    title: payload.title,
    description: payload.description,
    target_completion_date: payload.target_completion_date || (new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10), // Default to 30 days from now
    category: payload.project_type || 'other',
    motivation: payload.motivation || 'Project created during onboarding',
    perceived_difficulty: payload.perceived_difficulty || 5,
    known_obstacles: payload.known_obstacles 
      ? (Array.isArray(payload.known_obstacles) 
          ? payload.known_obstacles.join(', ') 
          : payload.known_obstacles)
      : 'Time management, Focus',
    skills_resources_needed: payload.skills_needed || ['Planning', 'Execution'],
  };
  
  const { data, error } = await supabase
    .from('projects')
    .insert(dbPayload)
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


