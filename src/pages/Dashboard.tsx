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