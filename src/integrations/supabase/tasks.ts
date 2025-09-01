import { supabase } from './client';
import type { Task } from '../../data/mockData';

function toNullableUuid(value: string | null | undefined): string | null {
  if (!value) return null;
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value) ? value : null;
}

export async function bulkInsertTasks(projectId: string | null | undefined, tasks: Task[]): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const project_id_safe = toNullableUuid(projectId);

  const rows = tasks.map(t => ({
    user_id: user.id,
    project_id: project_id_safe,
    task_id_external: t.id,
    title: t.title,
    description: t.description ?? null,
    status: t.status,
    priority: t.priority,
    estimated_minutes: t.estimatedTimeMinutes ?? null,
    actual_minutes: t.actualTimeMinutes ?? null,
    completion_date: t.completionDate ?? null,
    dopamine_score: t.dopamineScore ?? null,
    task_type: t.taskType ?? null,
    resistance_level: t.resistanceLevel ?? null,
    dependency_task_external_id: t.dependencyTaskId ?? null,
  }));

  const { data, error } = await supabase
    .from('micro_tasks')
    .insert(rows)
    .select('*');
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id, // ALWAYS use DB UUID for runtime operations
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority,
    projectId,
    estimatedTimeMinutes: row.estimated_minutes ?? undefined,
    actualTimeMinutes: row.actual_minutes ?? undefined,
    completionDate: row.completion_date ?? undefined,
    dopamineScore: row.dopamine_score ?? undefined,
    taskType: row.task_type ?? undefined,
    resistanceLevel: row.resistance_level ?? undefined,
    dependencyTaskId: row.dependency_task_external_id ?? undefined,
  }));
}

export async function listTasksByProject(projectId: string): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('micro_tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id, // ALWAYS use DB UUID for runtime operations
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority,
    projectId,
    estimatedTimeMinutes: row.estimated_minutes ?? undefined,
    actualTimeMinutes: row.actual_minutes ?? undefined,
    completionDate: row.completion_date ?? undefined,
    dopamineScore: row.dopamine_score ?? undefined,
    taskType: row.task_type ?? undefined,
    resistanceLevel: row.resistance_level ?? undefined,
    dependencyTaskId: row.dependency_task_external_id ?? undefined,
  }));
}

// New functions for real-time task status updates

export async function updateTaskStatusInProgress(taskId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.rpc('update_task_status_in_progress', {
    p_task_id: taskId
  });
  
  if (error) throw error;
}

export async function updateTaskStatusCompleted(taskId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.rpc('update_task_status_completed', {
    p_task_id: taskId
  });
  
  if (error) throw error;
}

export async function updateTaskStatusPending(taskId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.rpc('update_task_status_pending', {
    p_task_id: taskId
  });
  
  if (error) throw error;
}

export async function updateTaskCompletionData(
  taskId: string,
  actualTimeMinutes?: number,
  motivationBefore?: number,
  motivationAfter?: number,
  dopamineRating?: number,
  nextTaskMotivation?: number,
  breakthroughMoments?: string,
  obstaclesEncountered?: any[]
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.rpc('update_task_completion_data', {
    p_task_id: taskId,
    p_actual_time_minutes: actualTimeMinutes || null,
    p_motivation_before: motivationBefore || null,
    p_motivation_after: motivationAfter || null,
    p_dopamine_rating: dopamineRating || null,
    p_next_task_motivation: nextTaskMotivation || null,
    p_breakthrough_moments: breakthroughMoments || null,
    p_obstacles_encountered: obstaclesEncountered ? JSON.stringify(obstaclesEncountered) : null
  });
  
  if (error) throw error;
}

export async function refreshProjectTasks(projectId: string): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('refresh_project_tasks', {
    p_project_id: projectId
  });
  
  if (error) throw error;
  
  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority,
    projectId,
    estimatedTimeMinutes: undefined, // Not available in this function
    actualTimeMinutes: row.actual_time_minutes ?? undefined,
    completionDate: row.completion_date ?? undefined,
    dopamineScore: row.dopamine_rating ?? undefined,
    taskType: undefined, // Not available in this function
    resistanceLevel: undefined, // Not available in this function
    dependencyTaskId: undefined, // Not available in this function
  }));
}

// Function to create a single task for onboarding
export async function createTask(payload: {
  title: string;
  description: string;
  project_id: string;
  estimated_time_minutes: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('micro_tasks')
    .insert({
      user_id: user.id,
      project_id: payload.project_id,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      estimated_minutes: payload.estimated_time_minutes,
      task_id_external: crypto.randomUUID(), // Generate a unique external ID
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? undefined,
    status: data.status,
    priority: data.priority,
    projectId: payload.project_id,
    estimatedTimeMinutes: data.estimated_minutes ?? undefined,
    actualTimeMinutes: data.actual_minutes ?? undefined,
    completionDate: data.completion_date ?? undefined,
    dopamineScore: data.dopamine_score ?? undefined,
    taskType: data.task_type ?? undefined,
    resistanceLevel: data.resistance_level ?? undefined,
    dependencyTaskId: data.dependency_task_external_id ?? undefined,
  };
}


