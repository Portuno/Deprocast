import React from 'react';
import TaskModule from '../components/TaskModule';
import JournalModule from '../components/JournalModule';
import TaskList from '../components/TaskList';
import MobileTaskList from '../components/MobileTaskList';
import { Task } from '../data/mockData';

interface DashboardProps {
  tasks: Task[];
  nextTaskId: string | null;
  nextTask: Task | null;
  onTaskSelect: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
  currentProject: any;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  nextTaskId,
  nextTask,
  onTaskSelect,
  onStartTask,
  currentProject
}) => {
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

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back! 🚀
          </h1>
          <p className="text-gray-400 text-lg">
            {currentProject ? `Working on: ${currentProject.name}` : 'Ready to tackle your goals'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} border border-gray-700/30 rounded-xl p-3 md:p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <div className={`text-2xl md:text-3xl mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className={`text-lg md:text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4 md:p-6">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Module */}
          <div className="lg:col-span-1">
            <TaskModule
              nextTask={nextTask}
              onStartTask={onStartTask}
            />
          </div>

          {/* Center Column - Journal Module */}
          <div className="lg:col-span-1">
            <JournalModule />
          </div>

          {/* Right Column - Task List (Desktop) */}
          <div className="hidden lg:block">
            <TaskList
              tasks={tasks}
              nextTaskId={nextTaskId}
              onTaskSelect={onTaskSelect}
            />
          </div>
        </div>

        {/* Mobile Task List */}
        <div className="lg:hidden">
          <MobileTaskList
            tasks={tasks}
            nextTaskId={nextTaskId}
            onTaskSelect={onTaskSelect}
          />
        </div>

        {/* Motivation Section */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-3">🧠 Neuroscience Tip</h3>
          <p className="text-gray-300 mb-4">
            Your brain releases dopamine when you complete tasks, creating a positive feedback loop. 
            By breaking large tasks into 25-minute focused sessions, you're training your brain to 
            associate work with reward rather than stress.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-purple-500/20 rounded-lg p-3">
              <div className="text-purple-400 font-semibold mb-1">Dopamine Priming</div>
              <div className="text-purple-300">Visualize success before starting</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-3">
              <div className="text-blue-400 font-semibold mb-1">Focused Sessions</div>
              <div className="text-blue-300">25 minutes of undistracted work</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-3">
              <div className="text-green-400 font-semibold mb-1">Micro-Wins</div>
              <div className="text-green-300">Celebrate every small victory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;