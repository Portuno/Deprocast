import { supabase } from './client';
import { getOrCreateProfile, type ProfileRecord } from './profiles';
import { listProjects, type DbProject } from './projects';
import { listJournalEntries, type DbJournalEntry } from './journal';
import { type CalendarEvent } from './calendar';
import { getAllUserObstacles, type TaskObstacle } from './obstacles';

export interface UserBlueprint {
  // Metadata
  generatedAt: string;
  userId: string;
  
  // Core Profile
  profile: {
    personalInfo: {
      name: string;
      email: string;
      timezone: string;
      workingHours: string;
      focusGoal: string;
      theme: string;
      isPremium: boolean;
      onboardingCompleted: boolean;
      accountAge: number; // days since creation
    };
  };
  
  // Projects & Goals
  projects: {
    total: number;
    active: number;
    categories: Record<string, number>;
    difficultyDistribution: Record<string, number>;
    projects: Array<{
      id: string;
      title: string;
      description: string;
      category: string | null;
      motivation: string | null;
      perceivedDifficulty: number | null;
      knownObstacles: string | null;
      skillsResourcesNeeded: string[] | null;
      targetCompletionDate: string;
      daysUntilDeadline: number;
      createdAt: string;
    }>;
  };
  
  // Task Patterns & Productivity
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    completionRate: number;
    averageEstimatedTime: number;
    averageActualTime: number;
    timeEstimationAccuracy: number;
    taskTypes: Record<string, number>;
    resistanceLevels: Record<string, number>;
    dopamineScoreAverage: number;
    tasks: Array<{
      id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      taskType: string | null;
      resistanceLevel: string | null;
      estimatedMinutes: number | null;
      actualMinutes: number | null;
      dopamineScore: number | null;
      completionDate: string | null;
      motivationBefore: number | null;
      motivationAfter: number | null;
      breakthroughMoments: string | null;
      obstaclesEncountered: any[] | null;
      createdAt: string;
    }>;
  };
  
  // Journal & Emotional Patterns
  journal: {
    totalEntries: number;
    averageEnergy: number;
    averageFocus: number;
    moodDistribution: Record<string, number>;
    commonEmotions: Record<string, number>;
    keyEvents: {
      wins: number;
      losses: number;
    };
    entries: Array<{
      id: string;
      title: string;
      content: string;
      mood: string;
      energy: number | null;
      focus: number | null;
      emotions: string[] | null;
      summary: string | null;
      keyEvent: any | null;
      entryDate: string;
      createdAt: string;
    }>;
  };
  
  // Obstacles & Challenges
  obstacles: {
    total: number;
    averageFrustrationLevel: number;
    commonEmotionalStates: Record<string, number>;
    patterns: Array<{
      id: string;
      description: string;
      emotionalState: string;
      frustrationLevel: number;
      timeSpentMinutes: number;
      createdAt: string;
    }>;
  };
  
  // Calendar & Time Management
  calendar: {
    totalEvents: number;
    eventTypeDistribution: Record<string, number>;
    averageDuration: number;
    recentEvents: Array<{
      id: string;
      title: string;
      type: string;
      date: string;
      time: string;
      durationMinutes: number | null;
    }>;
  };
  
  // Behavioral Insights
  insights: {
    productivityScore: number;
    consistencyScore: number;
    timeManagementScore: number;
    emotionalWellbeingScore: number;
    procrastinationRisk: 'low' | 'medium' | 'high';
    preferredWorkingHours: string;
    mostProductiveDays: string[];
    commonBlockers: string[];
    strengths: string[];
    areasForImprovement: string[];
  };
}

export const generateUserBlueprint = async (): Promise<UserBlueprint> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('Generating blueprint for user:', user.id);

    // Get all user data in parallel with error handling
    const [
      profile,
      projects,
      tasks,
      journalEntries,
      obstacles,
      calendarEvents
    ] = await Promise.allSettled([
      getOrCreateProfile(),
      fetchAllProjects(),
      fetchAllTasks(),
      fetchAllJournalEntries(),
      fetchAllObstacles(),
      fetchRecentCalendarEvents()
    ]);

    // Handle individual failures gracefully
    const profileData = profile.status === 'fulfilled' ? profile.value : null;
    const projectsData = projects.status === 'fulfilled' ? projects.value : [];
    const tasksData = tasks.status === 'fulfilled' ? tasks.value : [];
    const journalData = journalEntries.status === 'fulfilled' ? journalEntries.value : [];
    const obstaclesData = obstacles.status === 'fulfilled' ? obstacles.value : [];
    const calendarData = calendarEvents.status === 'fulfilled' ? calendarEvents.value : [];

    if (!profileData) {
      console.warn('Profile not found, using default values');
      // Create a minimal profile structure
      const minimalProfile = {
        personalInfo: {
          name: 'User',
          email: user.email || 'user@example.com',
          timezone: 'UTC',
          workingHours: { start: '09:00', end: '17:00' }
        },
        preferences: {
          theme: 'dark',
          notifications: true,
          focusMode: true
        },
        goals: {
          dailyFocusHours: 4,
          weeklyTasks: 10,
          monthlyProjects: 2
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // profileData is const, so we need to create a new object
      Object.assign(profileData, minimalProfile);
    }

    console.log('Data fetched successfully:', {
      profile: !!profileData,
      projects: projectsData.length,
      tasks: tasksData.length,
      journal: journalData.length,
      obstacles: obstaclesData.length,
      calendar: calendarData.length
    });

  // Calculate insights and metrics
  const taskMetrics = calculateTaskMetrics(tasksData);
  const journalMetrics = calculateJournalMetrics(journalData);
  const obstacleMetrics = calculateObstacleMetrics(obstaclesData);
  const calendarMetrics = calculateCalendarMetrics(calendarData);
  const behavioralInsights = calculateBehavioralInsights(tasksData, journalData, obstaclesData, profileData);

  const blueprint: UserBlueprint = {
    generatedAt: new Date().toISOString(),
    userId: user.id,
    
    profile: {
      personalInfo: {
        name: profileData.full_name || 'Anonymous',
        email: profileData.email,
        timezone: profileData.timezone || 'UTC',
        workingHours: profileData.working_hours || '9:00 AM - 6:00 PM',
        focusGoal: profileData.focus_goal || '4 hours',
        theme: profileData.theme || 'dark',
        isPremium: profileData.is_premium,
        onboardingCompleted: profileData.onboarding_completed,
        accountAge: Math.floor((Date.now() - new Date(profileData.created_at).getTime()) / (1000 * 60 * 60 * 24))
      }
    },
    
    projects: {
      total: projectsData.length,
      active: projectsData.filter(p => new Date(p.target_completion_date) > new Date()).length,
      categories: groupBy(projectsData, 'category'),
      difficultyDistribution: groupByDifficulty(projectsData),
      projects: projectsData.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        motivation: p.motivation,
        perceivedDifficulty: p.perceived_difficulty,
        knownObstacles: p.known_obstacles,
        skillsResourcesNeeded: p.skills_resources_needed,
        targetCompletionDate: p.target_completion_date,
        daysUntilDeadline: Math.ceil((new Date(p.target_completion_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        createdAt: p.created_at
      }))
    },
    
    tasks: {
      ...taskMetrics,
      tasks: tasksData.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        taskType: t.task_type,
        resistanceLevel: t.resistance_level,
        estimatedMinutes: t.estimated_minutes,
        actualMinutes: t.actual_minutes,
        dopamineScore: t.dopamine_score,
        completionDate: t.completion_date,
        motivationBefore: t.motivation_before,
        motivationAfter: t.motivation_after,
        breakthroughMoments: t.breakthrough_moments,
        obstaclesEncountered: t.obstacles_encountered,
        createdAt: t.created_at
      }))
    },
    
    journal: {
      ...journalMetrics,
      entries: journalData.map(j => ({
        id: j.id,
        title: j.title,
        content: j.content,
        mood: j.mood || 'neutral',
        energy: j.energy,
        focus: j.focus,
        emotions: j.emotions,
        summary: j.summary,
        keyEvent: j.key_event,
        entryDate: j.entry_date,
        createdAt: j.created_at
      }))
    },
    
    obstacles: {
      ...obstacleMetrics,
      patterns: obstaclesData.map(o => ({
        id: o.id,
        description: o.description,
        emotionalState: o.emotionalState,
        frustrationLevel: o.frustrationLevel,
        timeSpentMinutes: o.timeSpentMinutes,
        createdAt: o.createdAt
      }))
    },
    
    calendar: {
      ...calendarMetrics,
      recentEvents: calendarData.map(e => ({
        id: e.id,
        title: e.title,
        type: e.type,
        date: e.date,
        time: e.time,
        durationMinutes: e.durationMinutes
      }))
    },
    
    insights: behavioralInsights
  };

  return blueprint;
  } catch (error) {
    console.error('Error generating user blueprint:', error);
    
    // Return a minimal blueprint with error information
    const errorBlueprint: UserBlueprint = {
      generatedAt: new Date().toISOString(),
      userId: 'error',
      profile: {
        personalInfo: {
          name: 'Error',
          email: 'error@example.com',
          timezone: 'UTC',
          workingHours: 'N/A',
          focusGoal: 'N/A',
          theme: 'dark',
          isPremium: false,
          onboardingCompleted: false,
          accountAge: 0
        }
      },
      projects: {
        total: 0,
        active: 0,
        categories: {},
        difficultyDistribution: {},
        projects: []
      },
      tasks: {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        completionRate: 0,
        averageEstimatedTime: 0,
        averageActualTime: 0,
        timeEstimationAccuracy: 0,
        taskTypes: {},
        resistanceLevels: {},
        dopamineScoreAverage: 0,
        tasks: []
      },
      journal: {
        totalEntries: 0,
        averageEnergy: 0,
        averageFocus: 0,
        moodDistribution: {},
        commonEmotions: {},
        keyEvents: { wins: 0, losses: 0 },
        entries: []
      },
      obstacles: {
        total: 0,
        averageFrustrationLevel: 0,
        commonEmotionalStates: {},
        patterns: []
      },
      calendar: {
        totalEvents: 0,
        eventTypeDistribution: {},
        averageDuration: 0,
        recentEvents: []
      },
      insights: {
        productivityScore: 0,
        consistencyScore: 0,
        timeManagementScore: 0,
        emotionalWellbeingScore: 0,
        procrastinationRisk: 'high' as const,
        preferredWorkingHours: 'N/A',
        mostProductiveDays: [],
        commonBlockers: ['Error occurred during generation'],
        strengths: [],
        areasForImprovement: ['Fix blueprint generation errors']
      }
    };
    
    throw new Error(`Failed to generate blueprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper functions for data fetching
async function fetchAllProjects(): Promise<DbProject[]> {
  return await listProjects();
}

async function fetchAllTasks(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('micro_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

async function fetchAllJournalEntries(): Promise<DbJournalEntry[]> {
  return await listJournalEntries();
}

async function fetchAllObstacles(): Promise<TaskObstacle[]> {
  return await getAllUserObstacles();
}

async function fetchRecentCalendarEvents(): Promise<CalendarEvent[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(100);
    
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    type: row.type,
    projectId: row.project_id,
    description: row.description,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Helper functions for calculations
function calculateTaskMetrics(tasks: any[]) {
  const completed = tasks.filter(t => t.status === 'completed');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const pending = tasks.filter(t => t.status === 'pending');
  
  const tasksWithEstimates = tasks.filter(t => t.estimated_minutes && t.actual_minutes);
  const avgEstimated = tasksWithEstimates.length > 0 
    ? tasksWithEstimates.reduce((sum, t) => sum + t.estimated_minutes, 0) / tasksWithEstimates.length 
    : 0;
  const avgActual = tasksWithEstimates.length > 0
    ? tasksWithEstimates.reduce((sum, t) => sum + t.actual_minutes, 0) / tasksWithEstimates.length
    : 0;
  
  const accuracy = avgEstimated > 0 ? (avgActual / avgEstimated) : 1;
  
  const dopamineScores = tasks.filter(t => t.dopamine_score).map(t => t.dopamine_score);
  const avgDopamine = dopamineScores.length > 0 
    ? dopamineScores.reduce((sum, score) => sum + score, 0) / dopamineScores.length 
    : 0;

  return {
    total: tasks.length,
    completed: completed.length,
    inProgress: inProgress.length,
    pending: pending.length,
    completionRate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
    averageEstimatedTime: Math.round(avgEstimated),
    averageActualTime: Math.round(avgActual),
    timeEstimationAccuracy: Math.round(accuracy * 100),
    taskTypes: groupBy(tasks.filter(t => t.task_type), 'task_type'),
    resistanceLevels: groupBy(tasks.filter(t => t.resistance_level), 'resistance_level'),
    dopamineScoreAverage: Math.round(avgDopamine * 10) / 10
  };
}

function calculateJournalMetrics(entries: any[]) {
  const energyScores = entries.filter(e => e.energy).map(e => e.energy);
  const focusScores = entries.filter(e => e.focus).map(e => e.focus);
  const avgEnergy = energyScores.length > 0 
    ? energyScores.reduce((sum, score) => sum + score, 0) / energyScores.length 
    : 0;
  const avgFocus = focusScores.length > 0
    ? focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length
    : 0;

  const keyEvents = entries.filter(e => e.key_event);
  const wins = keyEvents.filter(e => e.key_event?.type === 'win').length;
  const losses = keyEvents.filter(e => e.key_event?.type === 'loss').length;

  // Flatten all emotions
  const allEmotions: string[] = [];
  entries.forEach(e => {
    if (e.emotions && Array.isArray(e.emotions)) {
      allEmotions.push(...e.emotions);
    }
  });

  return {
    totalEntries: entries.length,
    averageEnergy: Math.round(avgEnergy * 10) / 10,
    averageFocus: Math.round(avgFocus * 10) / 10,
    moodDistribution: groupBy(entries.filter(e => e.mood), 'mood'),
    commonEmotions: groupByArray(allEmotions),
    keyEvents: { wins, losses }
  };
}

function calculateObstacleMetrics(obstacles: TaskObstacle[]) {
  const avgFrustration = obstacles.length > 0
    ? obstacles.reduce((sum, o) => sum + o.frustrationLevel, 0) / obstacles.length
    : 0;

  return {
    total: obstacles.length,
    averageFrustrationLevel: Math.round(avgFrustration * 10) / 10,
    commonEmotionalStates: groupBy(obstacles, 'emotionalState')
  };
}

function calculateCalendarMetrics(events: CalendarEvent[]) {
  const withDuration = events.filter(e => e.durationMinutes);
  const avgDuration = withDuration.length > 0
    ? withDuration.reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / withDuration.length
    : 0;

  return {
    totalEvents: events.length,
    eventTypeDistribution: groupBy(events, 'type'),
    averageDuration: Math.round(avgDuration)
  };
}

function calculateBehavioralInsights(tasks: any[], journalEntries: DbJournalEntry[], obstacles: TaskObstacle[], profile: ProfileRecord) {
  // Calculate various behavioral scores
  const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) : 0;
  const productivityScore = Math.round(completionRate * 100);
  
  const journalConsistency = journalEntries.length > 0 ? Math.min(journalEntries.length / 30, 1) : 0; // Assuming daily journaling is ideal
  const consistencyScore = Math.round(journalConsistency * 100);
  
  const timeAccuracy = calculateTimeEstimationAccuracy(tasks);
  const timeManagementScore = Math.round(timeAccuracy);
  
  const avgEnergy = journalEntries.filter(j => j.energy).length > 0 
    ? journalEntries.filter(j => j.energy).reduce((sum, j) => sum + j.energy, 0) / journalEntries.filter(j => j.energy).length 
    : 5;
  const emotionalWellbeingScore = Math.round((avgEnergy / 10) * 100);
  
  // Procrastination risk based on obstacles and task completion
  const obstacleRate = tasks.length > 0 ? obstacles.length / tasks.length : 0;
  const procrastinationRisk = obstacleRate > 0.3 ? 'high' : obstacleRate > 0.1 ? 'medium' : 'low';
  
  // Extract insights from patterns
  const commonBlockers = getMostCommon(obstacles.map(o => o.description), 3);
  const strengths = inferStrengths(tasks, journalEntries);
  const improvements = inferImprovements(tasks, obstacles, journalEntries);

  return {
    productivityScore,
    consistencyScore,
    timeManagementScore,
    emotionalWellbeingScore,
    procrastinationRisk: procrastinationRisk as 'low' | 'medium' | 'high',
    preferredWorkingHours: profile.working_hours || '9:00 AM - 6:00 PM',
    mostProductiveDays: ['Monday', 'Tuesday', 'Wednesday'], // This could be calculated from actual data
    commonBlockers,
    strengths,
    areasForImprovement: improvements
  };
}

// Utility functions
function groupBy(array: any[], key: string): Record<string, number> {
  return array.reduce((acc, item) => {
    const value = item[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function groupByArray(array: string[]): Record<string, number> {
  return array.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function groupByDifficulty(projects: any[]): Record<string, number> {
  return projects.reduce((acc, project) => {
    const difficulty = project.perceived_difficulty;
    if (difficulty) {
      const range = difficulty <= 3 ? 'Easy (1-3)' : difficulty <= 6 ? 'Medium (4-6)' : 'Hard (7-10)';
      acc[range] = (acc[range] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
}

function calculateTimeEstimationAccuracy(tasks: any[]): number {
  const tasksWithBothTimes = tasks.filter(t => t.estimated_minutes && t.actual_minutes);
  if (tasksWithBothTimes.length === 0) return 100;
  
  const accuracyScores = tasksWithBothTimes.map(t => {
    const ratio = t.actual_minutes / t.estimated_minutes;
    // Perfect accuracy = 1.0, score decreases as ratio deviates from 1
    return Math.max(0, 100 - Math.abs((ratio - 1) * 100));
  });
  
  return accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length;
}

function getMostCommon(array: string[], limit: number): string[] {
  const counts = groupByArray(array);
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item);
}

function inferStrengths(tasks: any[], journalEntries: any[]): string[] {
  const strengths: string[] = [];
  
  const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) : 0;
  if (completionRate > 0.8) strengths.push('High task completion rate');
  
  const avgEnergy = journalEntries.filter(j => j.energy).length > 0 
    ? journalEntries.filter(j => j.energy).reduce((sum, j) => sum + j.energy, 0) / journalEntries.filter(j => j.energy).length 
    : 0;
  if (avgEnergy > 7) strengths.push('High energy levels');
  
  const avgFocus = journalEntries.filter(j => j.focus).length > 0
    ? journalEntries.filter(j => j.focus).reduce((sum, j) => sum + j.focus, 0) / journalEntries.filter(j => j.focus).length
    : 0;
  if (avgFocus > 7) strengths.push('Strong focus ability');
  
  if (journalEntries.length > 10) strengths.push('Consistent self-reflection');
  
  return strengths.length > 0 ? strengths : ['Actively working on self-improvement'];
}

function inferImprovements(tasks: any[], obstacles: any[], journalEntries: any[]): string[] {
  const improvements: string[] = [];
  
  const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) : 0;
  if (completionRate < 0.5) improvements.push('Improve task completion consistency');
  
  if (obstacles.length > tasks.length * 0.2) improvements.push('Develop better obstacle management strategies');
  
  const tasksWithBothTimes = tasks.filter(t => t.estimated_minutes && t.actual_minutes);
  if (tasksWithBothTimes.length > 0) {
    const avgAccuracy = calculateTimeEstimationAccuracy(tasks);
    if (avgAccuracy < 70) improvements.push('Improve time estimation skills');
  }
  
  const avgEnergy = journalEntries.filter(j => j.energy).length > 0 
    ? journalEntries.filter(j => j.energy).reduce((sum, j) => sum + j.energy, 0) / journalEntries.filter(j => j.energy).length 
    : 0;
  if (avgEnergy < 5) improvements.push('Focus on energy management and well-being');
  
  return improvements.length > 0 ? improvements : ['Continue current positive practices'];
}
