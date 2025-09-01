import { supabase } from './client';

export interface TaskObstacle {
  id: string;
  taskId: string;
  projectId?: string;
  description: string;
  emotionalState: string;
  frustrationLevel: number;
  timeSpentMinutes: number;
  timeRemainingSeconds: number;
  aiSolution?: string;
  createdAt: string;
}

export interface ProjectObstacle extends TaskObstacle {
  taskTitle: string;
}

/**
 * Insert a new task obstacle when user reports being blocked
 */
export const insertTaskObstacle = async (
  projectId: string | null,
  taskId: string,
  description: string,
  emotionalState: string,
  frustrationLevel: number,
  timeSpentMinutes: number = 0,
  timeRemainingSeconds: number = 0
): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('insert_task_obstacle', {
    p_project_id: projectId,
    p_task_id: taskId,
    p_description: description,
    p_emotional_state: emotionalState,
    p_frustration_level: frustrationLevel,
    p_time_spent_minutes: timeSpentMinutes,
    p_time_remaining_seconds: timeRemainingSeconds
  });

  if (error) {
    console.error('Error inserting task obstacle:', error);
    throw error;
  }

  return data as string; // Returns the obstacle ID
};

/**
 * Get all obstacles for a specific task
 */
export const getTaskObstacles = async (taskId: string): Promise<TaskObstacle[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_task_obstacles', {
    p_task_id: taskId
  });

  if (error) {
    console.error('Error fetching task obstacles:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    taskId: taskId,
    description: row.description,
    emotionalState: row.emotional_state,
    frustrationLevel: row.frustration_level,
    timeSpentMinutes: row.time_spent_minutes,
    timeRemainingSeconds: row.time_remaining_seconds,
    aiSolution: row.ai_solution,
    createdAt: row.created_at
  }));
};

/**
 * Get all obstacles for a specific project
 */
export const getProjectObstacles = async (projectId: string): Promise<ProjectObstacle[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_project_obstacles', {
    p_project_id: projectId
  });

  if (error) {
    console.error('Error fetching project obstacles:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    taskId: row.task_id,
    projectId: projectId,
    taskTitle: row.task_title,
    description: row.description,
    emotionalState: row.emotional_state,
    frustrationLevel: row.frustration_level,
    timeSpentMinutes: row.time_spent_minutes,
    timeRemainingSeconds: row.time_remaining_seconds,
    aiSolution: row.ai_solution,
    createdAt: row.created_at
  }));
};

/**
 * Update an obstacle with AI-generated solution
 */
export const updateObstacleAiSolution = async (
  obstacleId: string,
  aiSolution: string
): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('update_obstacle_ai_solution', {
    p_obstacle_id: obstacleId,
    p_ai_solution: aiSolution
  });

  if (error) {
    console.error('Error updating obstacle AI solution:', error);
    throw error;
  }

  return data as boolean;
};

/**
 * Calculate time spent on task before hitting obstacle
 * This is a helper function to calculate the time based on session start and current time
 */
export const calculateTimeSpent = (sessionStartTime: Date | null): number => {
  if (!sessionStartTime) return 0;
  
  const now = new Date();
  const diffInMs = now.getTime() - sessionStartTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  return Math.max(0, diffInMinutes);
};

/**
 * Convert seconds to minutes (rounded)
 */
export const secondsToMinutes = (seconds: number): number => {
  return Math.floor(seconds / 60);
};
