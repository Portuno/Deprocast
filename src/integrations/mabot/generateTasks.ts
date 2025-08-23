import { supabase } from '../supabase/client';

export interface GenerateTasksRequest {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  existingTasks: number;
}

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTimeMinutes: number;
  taskType: 'Deep Work' | 'Admin' | 'Quick Win' | 'Creative';
}

export const generateMicrotasksWithMabot = async (request: GenerateTasksRequest): Promise<GeneratedTask[]> => {
  try {
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Call the existing Mabot edge function with the correct parameters
    const { data, error } = await supabase.functions.invoke('mabot-integration', {
      body: {
        action: 'generate-microtasks',
        title: request.projectTitle,
        project_description: request.projectDescription,
        outcome_goal: request.projectDescription,
        category: 'Project',
        motivation: 'High',
        perceived_difficulty: 5,
        known_obstacles: '',
        skills_resources_needed: [],
        available_time_blocks: [],
        target_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        access_token: user.access_token,
        chat_id: null,
        platform_chat_id: null,
        bot_name: 'mabot'
      }
    });

    if (error) {
      throw new Error(`Mabot function error: ${error.message}`);
    }

    if (!data || !data.data || !data.data.tasks) {
      throw new Error('No tasks returned from Mabot');
    }

    // Transform the response to match our GeneratedTask interface
    const mabotTasks = data.data.tasks as any[];
    const generatedTasks: GeneratedTask[] = mabotTasks.map(task => ({
      title: task.micro_task || task.title || 'Untitled Task',
      description: task.why || task.description || 'No description provided',
      priority: task.risk === 'high' ? 'high' : task.risk === 'low' ? 'low' : 'medium',
      estimatedTimeMinutes: task.estimate_minutes || 25,
      taskType: 'Deep Work' // Default to Deep Work, could be enhanced with mapping logic
    }));

    // Insert generated tasks into database
    const { data: insertedTasks, error: insertError } = await supabase
      .from('micro_tasks')
      .insert(
        generatedTasks.map(task => ({
          user_id: user.id,
          project_id: request.projectId,
          title: task.title,
          description: task.description,
          status: 'pending',
          priority: task.priority,
          estimated_minutes: task.estimatedTimeMinutes,
          task_type: task.taskType,
          resistance_level: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )
      .select('*');

    if (insertError) {
      throw new Error(`Failed to insert tasks: ${insertError.message}`);
    }

    console.log(`Successfully generated and inserted ${insertedTasks.length} tasks`);
    return generatedTasks;

  } catch (error) {
    console.error('Error generating microtasks:', error);
    throw error;
  }
};
