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

    // Prepare the prompt for Mabot
    const prompt = `
      Project: ${request.projectTitle}
      Description: ${request.projectDescription}
      Existing Tasks: ${request.existingTasks}
      
      Please generate 8-12 focused microtasks that break down this project into manageable, actionable steps. 
      Each task should:
      - Take 15-45 minutes to complete
      - Be specific and actionable
      - Have clear success criteria
      - Follow the Pomodoro+ protocol principles
      
      Return the tasks in this exact JSON format:
      [
        {
          "title": "Task title",
          "description": "Detailed description",
          "priority": "high|medium|low",
          "estimatedTimeMinutes": 30,
          "taskType": "Deep Work|Admin|Quick Win|Creative"
        }
      ]
    `;

    // Call Mabot API (replace with your actual Mabot endpoint)
    const mabotResponse = await fetch('https://api.mabot.ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MABOT_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        model: 'gpt-4',
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!mabotResponse.ok) {
      throw new Error('Mabot API call failed');
    }

    const mabotData = await mabotResponse.json();
    
    // Parse the generated tasks from Mabot response
    let generatedTasks: GeneratedTask[];
    try {
      // Extract JSON from Mabot response
      const content = mabotData.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      generatedTasks = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Error parsing Mabot response:', parseError);
      // Fallback to generating basic tasks
      generatedTasks = generateFallbackTasks(request);
    }

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

// Fallback task generation if Mabot fails
const generateFallbackTasks = (request: GenerateTasksRequest): GeneratedTask[] => {
  const baseTasks = [
    {
      title: `Research ${request.projectTitle} best practices`,
      description: `Conduct initial research on industry standards and successful implementations for this project type.`,
      priority: 'high' as const,
      estimatedTimeMinutes: 30,
      taskType: 'Deep Work' as const
    },
    {
      title: `Define project scope and objectives`,
      description: `Clearly outline what this project will accomplish and what success looks like.`,
      priority: 'high' as const,
      estimatedTimeMinutes: 25,
      taskType: 'Admin' as const
    },
    {
      title: `Create project timeline and milestones`,
      description: `Break down the project into key phases with realistic deadlines.`,
      priority: 'medium' as const,
      estimatedTimeMinutes: 20,
      taskType: 'Admin' as const
    },
    {
      title: `Identify required resources and tools`,
      description: `List all the tools, skills, and resources needed to complete this project.`,
      priority: 'medium' as const,
      estimatedTimeMinutes: 15,
      taskType: 'Quick Win' as const
    },
    {
      title: `Set up project workspace and organization`,
      description: `Create the necessary folders, documents, and organizational structure.`,
      priority: 'low' as const,
      estimatedTimeMinutes: 20,
      taskType: 'Admin' as const
    }
  ];

  return baseTasks;
};
