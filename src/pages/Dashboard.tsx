import React, { useState } from 'react';
import TaskModule from '../components/TaskModule';
import JournalModule from '../components/JournalModule';
import TaskList from '../components/TaskList';
import MobileTaskList from '../components/MobileTaskList';
import { Task } from '../data/mockData';
import { generateMicrotasksWithMabot } from '../integrations/mabot/generateTasks';

interface DashboardProps {
  tasks: Task[];
  isLoadingTasks?: boolean;
  nextTaskId: string | null;
  nextTask: Task | null;
  onTaskSelect: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
  onDirectComplete?: (taskId: string) => void;
  onRefresh?: () => void;
  onTaskComplete?: (completionData: TaskCompletionData) => void;
  currentProject: any;
}

interface TaskCompletionData {
  taskTitle: string;
  estimatedTimeMinutes?: number;
  actualTimeMinutes: number;
  motivationBefore: number;
  motivationAfter: number;
  dopamineRating: number;
  nextTaskMotivation: number;
  breakthroughMoments: string;
  obstaclesEncountered: any[];
  completionDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  isLoadingTasks = false,
  nextTaskId,
  nextTask,
  onTaskSelect,
  onStartTask,
  onDirectComplete,
  onRefresh,
  onTaskComplete,
  currentProject
}) => {
  const [completionHistory, setCompletionHistory] = useState<TaskCompletionData[]>([]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState('');

  // Calculate real-time statistics
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const totalTasks = tasks.length;

  const getProgressPercentage = () => {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks.length / totalTasks) * 100);
  };

  const handleTaskComplete = (completionData: TaskCompletionData) => {
    setCompletionHistory(prev => [...prev, completionData]);
    // forward to parent for DB persist
    if (onTaskComplete) {
      onTaskComplete(completionData);
    }
    console.log('Task completion data collected:', completionData);
  };

  const handleDirectComplete = (taskId: string) => {
    if (onDirectComplete) {
      onDirectComplete(taskId);
    }
  };

  const generateMicrotasks = async () => {
    if (!currentProject) {
      alert('Please select a project first');
      return;
    }

    setIsGeneratingTasks(true);
    setGenerationProgress(0);
    
    const tips = [
      "🧠 Breaking down complex projects into microtasks activates your brain's reward system",
      "⚡ Small, achievable tasks create momentum and reduce procrastination",
      "🎯 Each microtask should take 15-45 minutes to complete",
      "🚀 Start with the highest impact, lowest effort tasks",
      "💡 Focus on one task at a time - multitasking reduces efficiency by 40%"
    ];

    let tipIndex = 0;
    setCurrentTip(tips[tipIndex]);

    // Simulate progress with tips
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        
        // Change tip every 20% progress
        if (prev % 20 === 0 && tipIndex < tips.length - 1) {
          tipIndex++;
          setCurrentTip(tips[tipIndex]);
        }
        
        return prev + 10;
      });
    }, 200);

    try {
      // Call Mabot to generate microtasks
      const result = await generateMicrotasksWithMabot({
        projectId: currentProject.id,
        projectTitle: currentProject.title,
        projectDescription: currentProject.description || '',
        existingTasks: tasks.length
      });
      
      // Wait for progress to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(100);
      
      // Refresh tasks to show newly generated ones
      if (onRefresh) {
        onRefresh();
      }

      console.log('Generated tasks:', result);
      
    } catch (error) {
      console.error('Error generating tasks:', error);
      alert('Failed to generate tasks. Please try again.');
    } finally {
      setTimeout(() => {
        setIsGeneratingTasks(false);
        setGenerationProgress(0);
        setCurrentTip('');
      }, 1500);
    }
  };

  // Calculate productivity insights from completion history
  const getProductivityInsights = () => {
    if (completionHistory.length === 0) return null;

    const avgMotivationBefore = completionHistory.reduce((sum, item) => sum + item.motivationBefore, 0) / completionHistory.length;
    const avgMotivationAfter = completionHistory.reduce((sum, item) => sum + item.motivationAfter, 0) / completionHistory.length;
    const avgDopamineRating = completionHistory.reduce((sum, item) => sum + item.dopamineRating, 0) / completionHistory.length;
    const avgNextTaskMotivation = completionHistory.reduce((sum, item) => sum + item.nextTaskMotivation, 0) / completionHistory.length;

    return {
      avgMotivationBefore: Math.round(avgMotivationBefore * 10) / 10,
      avgMotivationAfter: Math.round(avgMotivationAfter * 10) / 10,
      avgDopamineRating: Math.round(avgDopamineRating * 10) / 10,
      avgNextTaskMotivation: Math.round(avgNextTaskMotivation * 10) / 10,
      totalSessions: completionHistory.length
    };
  };

  const insights = getProductivityInsights();

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Generate Tasks Button */}
      <div className="mb-6 text-center">
        <button
          onClick={generateMicrotasks}
          disabled={isGeneratingTasks}
          className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
            isGeneratingTasks
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {isGeneratingTasks ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Tasks...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generate Microtasks
            </>
          )}
        </button>
        <p className="text-sm text-gray-400 mt-2">
          Create focused, actionable tasks to break down your project
        </p>
      </div>

      {/* Generation Progress */}
      {isGeneratingTasks && (
        <div className="mb-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">🤖 AI Task Generation in Progress</h3>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            
            <div className="text-sm text-gray-300 mb-4">
              {generationProgress}% Complete
            </div>
            
            {/* Current Tip */}
            <div className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-4">
              <div className="text-purple-300 text-sm font-medium mb-2">💡 Neuroscience Tip</div>
              <div className="text-white">{currentTip}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Module and Journal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Module */}
          {nextTask && (
            <TaskModule
              nextTask={nextTask}
              onStartTask={onStartTask}
              onDirectComplete={onDirectComplete}
              onTaskComplete={onTaskComplete}
            />
          )}

          {/* Journal Module */}
          <JournalModule />
        </div>

        {/* Right Column - Task Lists */}
        <div className="space-y-6">
          {/* Desktop Task List */}
          <div className="hidden lg:block">
            {tasks.length > 0 ? (
              <TaskList
                tasks={tasks}
                nextTaskId={nextTask?.id || null}
                onTaskSelect={onTaskSelect}
              />
            ) : !isLoadingTasks ? (
              <div className="text-center py-8 text-gray-400">
                <p>No tasks found</p>
              </div>
            ) : null}
          </div>

          {/* Mobile Task List */}
          <div className="lg:hidden">
            {tasks.length > 0 ? (
              <MobileTaskList
                tasks={tasks}
                nextTaskId={nextTask?.id || null}
                onTaskSelect={onTaskSelect}
              />
            ) : !isLoadingTasks ? (
              <div className="text-center py-8 text-gray-400">
                <p>No tasks found</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;