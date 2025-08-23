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

    // Call the existing Mabot edge function
    const { data, error } = await supabase.functions.invoke('mabot-integration', {
      body: {
        action: 'generate_tasks',
        projectId: request.projectId,
        projectTitle: request.projectTitle,
        projectDescription: request.projectDescription,
        existingTasks: request.existingTasks
      }
    });

    if (error) {
      throw new Error(`Mabot function error: ${error.message}`);
    }

    if (!data || !data.tasks) {
      throw new Error('No tasks returned from Mabot');
    }

    const generatedTasks: GeneratedTask[] = data.tasks;

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
