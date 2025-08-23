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

    // For now, use fallback task generation to avoid CORS issues
    // TODO: Implement proper Mabot integration through backend API
    console.log('Using fallback task generation for project:', request.projectTitle);
    
    const generatedTasks = generateFallbackTasks(request);

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

// Fallback task generation - creates intelligent tasks based on project info
const generateFallbackTasks = (request: GenerateTasksRequest): GeneratedTask[] => {
  const projectTitle = request.projectTitle.toLowerCase();
  
  // Generate context-aware tasks based on project type
  let baseTasks: GeneratedTask[] = [];
  
  if (projectTitle.includes('marketplace') || projectTitle.includes('ecommerce')) {
    baseTasks = [
      {
        title: `Research ${request.projectTitle} competitors and market gaps`,
        description: `Analyze existing solutions, identify unique value propositions, and document market opportunities.`,
        priority: 'high' as const,
        estimatedTimeMinutes: 30,
        taskType: 'Deep Work' as const
      },
      {
        title: `Define target audience and user personas`,
        description: `Create detailed profiles of ideal users, their pain points, and how your solution addresses them.`,
        priority: 'high' as const,
        estimatedTimeMinutes: 25,
        taskType: 'Deep Work' as const
      },
      {
        title: `Map out core user journey and key features`,
        description: `Sketch the main user flows and identify essential features for MVP development.`,
        priority: 'medium' as const,
        estimatedTimeMinutes: 20,
        taskType: 'Creative' as const
      },
      {
        title: `Research technical stack and hosting options`,
        description: `Evaluate technologies, frameworks, and hosting solutions suitable for your marketplace.`,
        priority: 'medium' as const,
        estimatedTimeMinutes: 20,
        taskType: 'Admin' as const
      },
      {
        title: `Create project timeline with key milestones`,
        description: `Break down development phases and set realistic deadlines for each major feature.`,
        priority: 'low' as const,
        estimatedTimeMinutes: 15,
        taskType: 'Admin' as const
      }
    ];
  } else if (projectTitle.includes('app') || projectTitle.includes('mobile')) {
    baseTasks = [
      {
        title: `Define app core functionality and user stories`,
        description: `Outline the main features and create user stories for each core function.`,
        priority: 'high' as const,
        estimatedTimeMinutes: 30,
        taskType: 'Deep Work' as const
      },
      {
        title: `Research target platform requirements`,
        description: `Understand iOS/Android guidelines, app store requirements, and platform-specific features.`,
        priority: 'high' as const,
        estimatedTimeMinutes: 25,
        taskType: 'Admin' as const
      },
      {
        title: `Create app wireframes and user flow`,
        description: `Sketch key screens and map the user navigation flow through the app.`,
        priority: 'medium' as const,
        estimatedTimeMinutes: 20,
        taskType: 'Creative' as const
      },
      {
        title: `Choose development framework and tools`,
        description: `Evaluate React Native, Flutter, or native development options for your app.`,
        priority: 'medium' as const,
        estimatedTimeMinutes: 20,
        taskType: 'Admin' as const
      },
      {
        title: `Set up development environment`,
        description: `Install necessary tools, SDKs, and configure your development workspace.`,
        priority: 'low' as const,
        estimatedTimeMinutes: 15,
        taskType: 'Quick Win' as const
      }
    ];
  } else {
    // Generic project tasks
    baseTasks = [
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
  }

  // Add project-specific tasks if description contains keywords
  if (request.projectDescription) {
    const desc = request.projectDescription.toLowerCase();
    
    if (desc.includes('design') || desc.includes('ui') || desc.includes('ux')) {
      baseTasks.push({
        title: `Create design system and style guide`,
        description: `Establish consistent visual language, color palette, typography, and component library.`,
        priority: 'medium' as const,
        estimatedTimeMinutes: 25,
        taskType: 'Creative' as const
      });
    }
    
    if (desc.includes('api') || desc.includes('backend') || desc.includes('database')) {
      baseTasks.push({
        title: `Design database schema and API endpoints`,
        description: `Plan the data structure, relationships, and define RESTful API specifications.`,
        priority: 'high' as const,
        estimatedTimeMinutes: 30,
        taskType: 'Deep Work' as const
      });
    }
    
    if (desc.includes('test') || desc.includes('quality') || desc.includes('qa')) {
      baseTasks.push({
        title: `Plan testing strategy and quality assurance`,
        description: `Define testing approach, tools, and processes to ensure product quality.`,
        priority: 'medium' as const,
        estimatedTimeMinutes: 20,
        taskType: 'Admin' as const
      });
    }
  }

  return baseTasks;
};
