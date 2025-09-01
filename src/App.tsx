import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import Navigation from './components/Navigation';
import MobileNavigation from './components/MobileNavigation';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Journal from './pages/Journal';
import Calendar from './pages/Calendar';
import Protocols from './pages/Protocols';
import Profile from './pages/Profile';
import { tasks as initialTasks, navigationItems, Task } from './data/mockData';
import { 
  listTasksByProject, 
  updateTaskStatusInProgress, 
  updateTaskStatusCompleted, 
  refreshProjectTasks,
  updateTaskCompletionData
} from './integrations/supabase/tasks';
import { listProjects, type DbProject } from './integrations/supabase/projects';
import { useOnboarding } from './hooks/useOnboarding';

interface TaskCompletionData {
  taskTitle: string;
  estimatedTimeMinutes: number;
  actualTimeMinutes: number;
  motivationBefore: number;
  motivationAfter: number;
  dopamineRating: number;
  nextTaskMotivation: number;
  breakthroughMoments: string;
  taskInitiationDelay: number;
}

function App() {
  const navigate = useNavigate();
  const { isOnboardingRequired, isLoading: isOnboardingLoading, completeOnboarding } = useOnboarding();
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [nextTaskId, setNextTaskId] = useState<string | null>(null);
  const [activePomodoroTaskId, setActivePomodoroTaskId] = useState<string | null>(null);
  const [completionHistory, setCompletionHistory] = useState<TaskCompletionData[]>([]);

  useEffect(() => {
    (async () => {
      const data = await listProjects().catch(() => [] as DbProject[]);
      setProjects(data);
      if (!currentProjectId && data.length > 0) setCurrentProjectId(data[0].id);
    })();
  }, []);

  const currentProject = currentProjectId ? projects.find(p => p.id === currentProjectId) || null : null;
  const currentProjectTasks = tasks.filter(task => 
    task.projectId === currentProjectId
  );

  // Calculate task statistics
  const taskStats = {
    total: currentProjectTasks.length,
    pending: currentProjectTasks.filter(task => task.status === 'pending').length,
    inProgress: currentProjectTasks.filter(task => task.status === 'in-progress').length,
    completed: currentProjectTasks.filter(task => task.status === 'completed').length,
  };

  const nextTask = currentProjectTasks.find(task => task.status === 'pending') || null;

  // Fetch tasks from DB whenever currentProjectId changes
  useEffect(() => {
    (async () => {
      if (!currentProjectId) return;
      setIsLoadingTasks(true);
      try {
        const dbTasks = await listTasksByProject(currentProjectId);
        setTasks(dbTasks); // Only use database tasks, no mock data
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]); // Set empty array on error
      } finally {
        setIsLoadingTasks(false);
      }
    })();
  }, [currentProjectId]);

  // AI suggestion logic - prioritize high priority pending tasks
  useEffect(() => {
    const pendingTasks = currentProjectTasks.filter(task => task.status === 'pending');
    if (pendingTasks.length > 0) {
      // Sort by priority: high -> medium -> low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sortedTasks = pendingTasks.sort((a, b) => 
        priorityOrder[b.priority] - priorityOrder[a.priority]
      );
      setNextTaskId(sortedTasks[0].id);
    } else {
      setNextTaskId(null);
    }
  }, [currentProjectId, tasks]);

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  const handleTaskSelect = (taskId: string) => {
    setNextTaskId(taskId);
  };

  const handleStartTask = async (taskId: string) => {
    try {
      // Update database first
      await updateTaskStatusInProgress(taskId);
      
      // Then update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'in-progress' as const }
            : task
        )
      );
      setActivePomodoroTaskId(taskId);
    } catch (error) {
      console.error('Error starting task:', error);
      // Optionally show error to user
    }
  };

  const handleDirectComplete = async (taskId: string) => {
    try {
      // Update database first
      await updateTaskStatusCompleted(taskId);
      
      // Then update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' as const, completionDate: new Date().toISOString() }
            : task
        )
      );
      
      setActivePomodoroTaskId(null);
      
      // Update next task if this was the current next task
      if (nextTaskId === taskId) {
        const pendingTasks = currentProjectTasks.filter(task => task.status === 'pending');
        if (pendingTasks.length > 0) {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const sortedTasks = pendingTasks.sort((a, b) => 
            priorityOrder[b.priority] - priorityOrder[a.priority]
          );
          setNextTaskId(sortedTasks[0].id);
        } else {
          setNextTaskId(null);
        }
      }

      console.log('Task completed directly:', taskId);
      
      // Refresh tasks from database to ensure sync
      if (currentProjectId) {
        try {
          const refreshedTasks = await refreshProjectTasks(currentProjectId);
          setTasks(prev => {
            const others = prev.filter(t => t.projectId !== currentProjectId);
            return [...others, ...refreshedTasks];
          });
        } catch (refreshError) {
          console.error('Error refreshing tasks:', refreshError);
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      // Optionally show error to user
    }
  };

  const handleOnboardingComplete = async (data?: any) => {
    try {
      await completeOnboarding(data);
      // Refresh projects and tasks after onboarding completion
      if (data) {
        const refreshedProjects = await listProjects().catch(() => [] as DbProject[]);
        setProjects(refreshedProjects);
        if (refreshedProjects.length > 0) {
          setCurrentProjectId(refreshedProjects[0].id);
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleTaskComplete = async (completionData: TaskCompletionData) => {
    try {
      // Determine the DB UUID of the task being completed
      const taskByActive = activePomodoroTaskId ? tasks.find(t => t.id === activePomodoroTaskId) : null;
      const taskByTitle = tasks.find(t => t.title === completionData.taskTitle);
      const targetTask = taskByActive || taskByTitle || null;

      if (targetTask) {
        // Persist completion data in DB
        await updateTaskCompletionData(
          targetTask.id,
          completionData.actualTimeMinutes,
          completionData.motivationBefore,
          completionData.motivationAfter,
          completionData.dopamineRating,
          completionData.nextTaskMotivation,
          completionData.breakthroughMoments,
          [] // obstaclesEncountered - empty array for now
        );
      }

      // Add to local completion history
      setCompletionHistory(prev => [...prev, completionData]);

      // Update local task status
      setTasks(prevTasks => 
        prevTasks.map(task => 
          (targetTask && task.id === targetTask.id) || (!targetTask && task.title === completionData.taskTitle)
            ? { ...task, status: 'completed' as const, completionDate: new Date().toISOString() }
            : task
        )
      );

      setActivePomodoroTaskId(null);

      // Update next task if this was the current next task
      if ((targetTask && nextTaskId === targetTask.id) || (!targetTask && nextTask && nextTask.title === completionData.taskTitle)) {
        const pendingTasks = currentProjectTasks.filter(task => task.status === 'pending');
        if (pendingTasks.length > 0) {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const sortedTasks = pendingTasks.sort((a, b) => 
            priorityOrder[b.priority] - priorityOrder[a.priority]
          );
          setNextTaskId(sortedTasks[0].id);
        } else {
          setNextTaskId(null);
        }
      }

      // Refresh tasks from DB to ensure counts and statuses are accurate
      if (currentProjectId) {
        try {
          const refreshedTasks = await refreshProjectTasks(currentProjectId);
          setTasks(refreshedTasks);
        } catch (refreshError) {
          console.error('Error refreshing tasks after completion:', refreshError);
        }
      }

      console.log('Task completed with data:', completionData);
    } catch (error) {
      console.error('Error persisting task completion:', error);
    }
  };

  const renderCurrentPage = () => {
    switch (activeNavItem) {
      case 'dashboard':
        return (
          <Dashboard
            tasks={currentProjectTasks}
            onTaskSelect={handleTaskSelect}
            onStartTask={handleStartTask}
            onTaskComplete={handleTaskComplete}
            onDirectComplete={handleDirectComplete}
            isLoadingTasks={isLoadingTasks}
            onRefresh={() => {
              if (currentProjectId) {
                (async () => {
                  try {
                    const refreshedTasks = await refreshProjectTasks(currentProjectId);
                    setTasks(refreshedTasks);
                  } catch (error) {
                    console.error('Error refreshing tasks:', error);
                  }
                })();
              }
            }}
            currentProject={currentProject}
          />
        );
      case 'projects':
        return (
          <Projects />
        );
      case 'journal':
        return <Journal />;
      case 'calendar':
        return <Calendar tasks={currentProjectTasks} />;
      case 'protocols':
        return <Protocols />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <Dashboard
            tasks={currentProjectTasks}
            onTaskSelect={handleTaskSelect}
            onStartTask={handleStartTask}
            onTaskComplete={handleTaskComplete}
            onDirectComplete={handleDirectComplete}
            isLoadingTasks={isLoadingTasks}
            onRefresh={() => {
              if (currentProjectId) {
                (async () => {
                  try {
                    const refreshedTasks = await refreshProjectTasks(currentProjectId);
                    setTasks(refreshedTasks);
                  } catch (error) {
                    console.error('Error refreshing tasks:', error);
                  }
                })();
              }
            }}
            currentProject={currentProject}
          />
        );
    }
  };

  // Redirect to onboarding if required
  useEffect(() => {
    console.log('🔄 App: useEffect for onboarding redirect triggered', { isOnboardingRequired, currentPath: window.location.pathname });
    
    if (isOnboardingRequired === true) {
      console.log('🔄 App: Redirecting to onboarding...');
      navigate('/onboarding', { replace: true });
    }
  }, [isOnboardingRequired, navigate]);

  // Don't render anything if onboarding is required (will redirect)
  if (isOnboardingRequired === true) {
    return null;
  }

  // Show loading while onboarding status is being determined
  if (isOnboardingLoading) {
    console.log('⏳ App: Loading onboarding status...');
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Setting up your experience...</h1>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

  console.log('🔍 App: Onboarding status:', { isOnboardingRequired, isOnboardingLoading });

  // Safety check to ensure navigationItems is available
  if (!navigationItems || navigationItems.length === 0) {
    console.warn('Navigation items not available');
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-400">Initializing navigation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <TopBar
          currentProject={currentProject}
          projects={projects}
          onProjectChange={handleProjectChange}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-20 md:pb-0">
          {/* Left Navigation - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <Navigation 
              activeItem={activeNavItem} 
              onItemClick={setActiveNavItem} 
              currentProject={currentProject ? { id: currentProject.id, name: currentProject.title } : null}
              taskStats={taskStats}
            />
          </div>

          {/* Central Panel */}
          {renderCurrentPage()}
        </div>

        {/* Mobile Navigation - Always visible on mobile */}
        <MobileNavigation
          activeItem={activeNavItem}
          onItemClick={setActiveNavItem}
          items={navigationItems}
        />
      </div>
    </div>
  );
}

export default App;