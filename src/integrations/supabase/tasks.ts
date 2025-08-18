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
    id: row.task_id_external || row.id,
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
    id: row.task_id_external || row.id,
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


