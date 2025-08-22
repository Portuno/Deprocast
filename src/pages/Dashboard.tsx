import React, { useState } from 'react';
import TaskModule from '../components/TaskModule';
import JournalModule from '../components/JournalModule';
import TaskList from '../components/TaskList';
import MobileTaskList from '../components/MobileTaskList';
import { Task } from '../data/mockData';

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
  // Debug log to check if onRefresh is being passed
  console.log('Dashboard props:', { onRefresh, hasOnRefresh: typeof onRefresh === 'function' });
  const [completionHistory, setCompletionHistory] = useState<TaskCompletionData[]>([]);

  // Calculate real-time statistics
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const totalTasks = tasks.length;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: '📋',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Pending',
      value: pendingTasks.length,
      icon: '⏳',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'In Progress',
      value: inProgressTasks.length,
      icon: '🚀',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Completed',
      value: completedTasks.length,
      icon: '✅',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    }
  ];

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
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back! 🚀
        </h1>
        <p className="text-gray-400 mb-4">
          Working on: {currentProject?.name || 'No project selected'}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Tasks
          </button>
        )}
      </div>

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

      {/* Progress Bar */}
      <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4 md:p-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-400">{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{completedTasks.length} completed</span>
          <span>{totalTasks - completedTasks.length} remaining</span>
        </div>
      </div>

      {/* Productivity Insights */}
      {insights && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6 mt-6">
          <h3 className="text-xl font-bold text-white mb-4">📊 Productivity Insights</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{insights.totalSessions}</div>
              <div className="text-sm text-gray-400">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{insights.avgMotivationBefore}</div>
              <div className="text-sm text-gray-400">Avg Motivation Before</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{insights.avgMotivationAfter}</div>
              <div className="text-sm text-gray-400">Avg Motivation After</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{insights.avgDopamineRating}</div>
              <div className="text-sm text-gray-400">Avg Dopamine Rating</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-300">
              💡 Your motivation increased by <span className="text-green-400 font-semibold">
                {insights.avgMotivationAfter - insights.avgMotivationBefore > 0 ? '+' : ''}
                {(insights.avgMotivationAfter - insights.avgMotivationBefore).toFixed(1)}
              </span> points on average!
            </div>
          </div>
        </div>
      )}

      {/* Neuroscience Tip */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 text-center mt-6">
        <h3 className="text-xl font-bold text-white mb-3">🧠 Pomodoro+ Neuroscience</h3>
        <p className="text-gray-300 mb-4">
          The Pomodoro+ protocol creates artificial completion opportunities every 25 minutes, 
          triggering dopamine release regardless of task size. This "rewires" your brain to 
          associate work with reward rather than stress.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-purple-500/20 rounded-lg p-3">
            <div className="text-purple-400 font-semibold mb-1">Dopamine Priming</div>
            <div className="text-purple-300">Visualize success before starting</div>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3">
            <div className="text-blue-400 font-semibold mb-1">Celebration Breaks</div>
            <div className="text-blue-300">5-minute physical celebration sessions</div>
          </div>
          <div className="bg-green-500/20 rounded-lg p-3">
            <div className="text-green-400 font-semibold mb-1">Data Collection</div>
            <div className="text-green-300">Track progress for AI coaching insights</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;