import { OnboardingFormData, ProjectData } from '../types/onboarding';
import { createProject } from '../integrations/supabase/projects';
import { createTask } from '../integrations/supabase/tasks';
import { createJournalEntry } from '../integrations/supabase/journal';

export const processOnboardingData = async (onboardingData: OnboardingFormData): Promise<{
  projectId: string;
  taskIds: string[];
  journalEntryId: string;
}> => {
  try {
    // 1. Create the project
    const projectData = {
      title: onboardingData.projectTitle as string,
      description: onboardingData.projectDescription as string,
      target_completion_date: onboardingData.targetCompletionDate as string,
      project_type: onboardingData.projectType as string,
      perceived_difficulty: onboardingData.perceivedDifficulty as number,
      motivation: onboardingData.motivation as string,
      known_obstacles: onboardingData.knownObstacles as string[],
      skills_needed: onboardingData.skillsNeeded as string[],
    };

    const project = await createProject(projectData);
    if (!project) throw new Error('Failed to create project');

    // 2. Generate micro-tasks based on project data
    const microTasks = generateMicroTasks(projectData);
    
    // 3. Create tasks in database
    const taskPromises = microTasks.map(task => 
      createTask({
        ...task,
        project_id: project.id,
      })
    );
    
    const createdTasks = await Promise.all(taskPromises);
    const taskIds = createdTasks.map(task => task.id).filter(Boolean);

    // 4. Create initial journal entry
    const journalEntry = await createJournalEntry({
      title: `Onboarding Complete - ${projectData.title}`,
      content: `Successfully completed onboarding and created project: ${projectData.title}. 
      
Project Details:
- Description: ${projectData.description}
- Target Date: ${projectData.target_completion_date}
- Difficulty: ${projectData.perceived_difficulty}/10
- Motivation: ${projectData.motivation}

Generated ${microTasks.length} micro-tasks to get started.

Energy Level: ${onboardingData.energyLevel}
Distraction Susceptibility: ${onboardingData.distractionSusceptibility}
Imposter Syndrome Level: ${onboardingData.imposterSyndrome}

Ready to begin the productivity journey! 🚀`,
      mood_rating: 8,
      energy_level: onboardingData.energyLevel as string,
      tags: ['onboarding', 'project-creation', 'new-start'],
    });

    return {
      projectId: project.id,
      taskIds,
      journalEntryId: journalEntry.id,
    };
  } catch (error) {
    console.error('Error processing onboarding data:', error);
    throw error;
  }
};

const generateMicroTasks = (projectData: ProjectData) => {
  const baseTasks = [
    {
      title: 'Project Setup & Planning',
      description: 'Create a project folder, set up basic structure, and outline the main milestones',
      estimated_time_minutes: 30,
      priority: 'high' as const,
      status: 'pending' as const,
    },
    {
      title: 'Research & Information Gathering',
      description: 'Collect necessary information, research tools, and gather resources needed for the project',
      estimated_time_minutes: 45,
      priority: 'high' as const,
      status: 'pending' as const,
    },
    {
      title: 'Create First Draft/Prototype',
      description: 'Start with a simple version or outline to get momentum going',
      estimated_time_minutes: 60,
      priority: 'medium' as const,
      status: 'pending' as const,
    },
    {
      title: 'Review & Refine',
      description: 'Take a step back, review what you\'ve created, and identify areas for improvement',
      estimated_time_minutes: 30,
      priority: 'medium' as const,
      status: 'pending' as const,
    },
    {
      title: 'Next Steps Planning',
      description: 'Based on your progress, plan the next 2-3 specific actions to move forward',
      estimated_time_minutes: 20,
      priority: 'low' as const,
      status: 'pending' as const,
    },
  ];

  // Customize tasks based on project type and difficulty
  if (projectData.project_type === 'development') {
    baseTasks.push({
      title: 'Environment Setup',
      description: 'Install necessary software, set up development environment, and create initial project structure',
      estimated_time_minutes: 45,
      priority: 'high' as const,
      status: 'pending' as const,
    });
  }

  if (projectData.perceived_difficulty >= 8) {
    baseTasks.push({
      title: 'Break Down Complex Parts',
      description: 'Identify the most challenging aspects and break them into smaller, manageable pieces',
      estimated_time_minutes: 40,
      priority: 'high' as const,
      status: 'pending' as const,
    });
  }

  if (projectData.skills_needed.length > 0) {
    baseTasks.push({
      title: 'Skill Development Planning',
      description: `Create a learning plan for: ${projectData.skills_needed.slice(0, 3).join(', ')}`,
      estimated_time_minutes: 35,
      priority: 'medium' as const,
      status: 'pending' as const,
    });
  }

  return baseTasks;
};
