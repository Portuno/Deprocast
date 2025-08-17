import React from 'react';
import TaskModule from '../components/TaskModule';
import JournalModule from '../components/JournalModule';
import TaskList from '../components/TaskList';
import { Task } from '../data/mockData';
import { TrendingUp, Clock, CheckCircle2, Target } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  nextTaskId: string | null;
  nextTask: Task | null;
  onTaskSelect: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  nextTaskId,
  nextTask,
  onTaskSelect,
  onStartTask
}) => {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Central Panel */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-green-400">{completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">{inProgressTasks}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-400">{completedTasks}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{pendingTasks}</p>
              </div>
              <Target className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <TaskModule
          nextTask={nextTask}
          onStartTask={onStartTask}
        />
        <JournalModule />
      </div>

      {/* Right Panel */}
      <TaskList
        tasks={tasks}
        nextTaskId={nextTaskId}
        onTaskSelect={onTaskSelect}
      />
    </div>
  );
};

export default Dashboard;