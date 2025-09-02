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

// Fallback tasks when Mabot API is unavailable
const generateFallbackTasks = (_request: GenerateTasksRequest): GeneratedTask[] => {
  return [
    {
      title: "Set up project structure and organization",
      description: "Create the basic folder structure and organize project files for better workflow",
      priority: 'high',
      estimatedTimeMinutes: 30,
      taskType: 'Admin'
    },
    {
      title: "Define project requirements and scope",
      description: "Clearly outline what needs to be accomplished and set realistic boundaries",
      priority: 'high',
      estimatedTimeMinutes: 25,
      taskType: 'Deep Work'
    },
    {
      title: "Research and gather necessary resources",
      description: "Collect all materials, tools, and information needed to complete the project",
      priority: 'medium',
      estimatedTimeMinutes: 20,
      taskType: 'Deep Work'
    },
    {
      title: "Create initial project timeline",
      description: "Break down the project into phases and set realistic deadlines",
      priority: 'medium',
      estimatedTimeMinutes: 15,
      taskType: 'Admin'
    },
    {
      title: "Set up development environment",
      description: "Configure tools, dependencies, and workspace for efficient work",
      priority: 'high',
      estimatedTimeMinutes: 35,
      taskType: 'Admin'
    },
    {
      title: "Implement core functionality",
      description: "Build the main features and functionality of the project",
      priority: 'high',
      estimatedTimeMinutes: 45,
      taskType: 'Deep Work'
    },
    {
      title: "Test and debug implementation",
      description: "Verify functionality works correctly and fix any issues found",
      priority: 'medium',
      estimatedTimeMinutes: 30,
      taskType: 'Deep Work'
    },
    {
      title: "Document code and processes",
      description: "Create clear documentation for future reference and maintenance",
      priority: 'low',
      estimatedTimeMinutes: 20,
      taskType: 'Admin'
    },
    {
      title: "Optimize performance and efficiency",
      description: "Review and improve code quality, performance, and user experience",
      priority: 'medium',
      estimatedTimeMinutes: 25,
      taskType: 'Deep Work'
    },
    {
      title: "Prepare for deployment or delivery",
      description: "Final preparations, packaging, and getting ready for launch",
      priority: 'high',
      estimatedTimeMinutes: 20,
      taskType: 'Admin'
    },
    {
      title: "Conduct final review and testing",
      description: "Comprehensive testing and quality assurance before completion",
      priority: 'high',
      estimatedTimeMinutes: 30,
      taskType: 'Deep Work'
    },
    {
      title: "Celebrate completion and plan next steps",
      description: "Acknowledge the achievement and plan follow-up actions or improvements",
      priority: 'low',
      estimatedTimeMinutes: 10,
      taskType: 'Quick Win'
    }
  ];
};

export const generateMicrotasksWithMabot = async (request: GenerateTasksRequest): Promise<GeneratedTask[]> => {
  try {
    // Get user authentication and session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    // Get the Supabase URL and anon key
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hiipxfzsdjgpgrbarxkb.supabase.co';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    // Call the existing Mabot edge function with the correct endpoint
    // We need to call the specific /generate-microtasks endpoint
    const response = await fetch(`${supabaseUrl}/functions/v1/mabot-integration/generate-microtasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
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
        access_token: session.access_token,
        chat_id: null,
        platform_chat_id: null,
        bot_name: 'mabot'
      })
    });

    if (!response.ok) {
      throw new Error(`Mabot function error: HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

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

    // Insert generated tasks into database with exact field names from micro_tasks table
    const { data: insertedTasks, error: insertError } = await supabase
      .from('micro_tasks')
      .insert(
        generatedTasks.map(task => ({
          user_id: user.id,
          project_id: request.projectId,
          task_id_external: null, // Optional field, can be null
          title: task.title,
          description: task.description,
          status: 'pending',
          priority: task.priority,
          estimated_minutes: task.estimatedTimeMinutes,
          actual_minutes: null, // Will be set when task is completed
          completion_date: null, // Will be set when task is completed
          dopamine_score: null, // Will be set when task is completed
          task_type: task.taskType,
          resistance_level: 'medium',
          dependency_task_external_id: null, // Optional field, can be null
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
    
    // If the error is related to network/CORS/timeout, use fallback tasks
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.log('🔄 Using fallback tasks due to network error');
      const fallbackTasks = generateFallbackTasks(request);
      
      // Get user for database insertion
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Insert fallback tasks into database
      const { data: insertedTasks, error: insertError } = await supabase
        .from('micro_tasks')
        .insert(
          fallbackTasks.map(task => ({
            user_id: user.id,
            project_id: request.projectId,
            task_id_external: null,
            title: task.title,
            description: task.description,
            status: 'pending',
            priority: task.priority,
            estimated_minutes: task.estimatedTimeMinutes,
            actual_minutes: null,
            completion_date: null,
            dopamine_score: null,
            task_type: task.taskType,
            resistance_level: 'medium',
            dependency_task_external_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        )
        .select('*');

      if (insertError) {
        throw new Error(`Failed to insert fallback tasks: ${insertError.message}`);
      }

      console.log(`Successfully generated and inserted ${insertedTasks.length} fallback tasks`);
      return fallbackTasks;
    }
    
    throw error;
  }
};
