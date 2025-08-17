import React from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Task } from '../data/mockData';

interface TaskListProps {
  tasks: Task[];
  nextTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, nextTaskId, onTaskSelect }) => {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400';
      case 'medium':
        return 'border-l-yellow-400';
      default:
        return 'border-l-green-400';
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const renderTaskGroup = (tasks: Task[], title: string, icon: React.ReactNode) => {
    if (tasks.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          {icon}
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            {title} ({tasks.length})
          </h4>
        </div>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isNext={task.id === nextTaskId}
              onSelect={onTaskSelect}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-900/20 backdrop-blur-xl border-l border-gray-700/30 p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Task Management</h3>
        <p className="text-sm text-gray-400">Select a task to make it your next focus</p>
      </div>

      {renderTaskGroup(
        inProgressTasks,
        'In Progress',
        <Clock className="w-4 h-4 text-blue-400" />
      )}

      {renderTaskGroup(
        pendingTasks,
        'Pending',
        <AlertCircle className="w-4 h-4 text-yellow-400" />
      )}

      {renderTaskGroup(
        completedTasks,
        'Completed',
        <CheckCircle2 className="w-4 h-4 text-green-400" />
      )}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  isNext: boolean;
  onSelect: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isNext, onSelect }) => {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400';
      case 'medium':
        return 'border-l-yellow-400';
      default:
        return 'border-l-green-400';
    }
  };

  return (
    <div
      onClick={() => task.status === 'pending' && onSelect(task.id)}
      className={`p-4 bg-gray-800/30 border-l-4 ${getPriorityColor(task.priority)} rounded-r-lg border border-gray-700/30 transition-all duration-200 ${
        task.status === 'pending' 
          ? 'cursor-pointer hover:bg-gray-700/40 hover:border-gray-600/40' 
          : 'opacity-60'
      } ${isNext ? 'ring-2 ring-blue-400/50 bg-blue-900/20' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        {getStatusIcon(task.status)}
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          task.priority === 'high' 
            ? 'bg-red-500/20 text-red-300' 
            : task.priority === 'medium'
            ? 'bg-yellow-500/20 text-yellow-300'
            : 'bg-green-500/20 text-green-300'
        }`}>
          {task.priority.toUpperCase()}
        </div>
      </div>
      <p className={`text-sm font-medium ${
        task.status === 'completed' 
          ? 'text-gray-400 line-through' 
          : 'text-white'
      } ${isNext ? 'text-blue-300' : ''}`}>
        {task.title}
      </p>
      {isNext && (
        <div className="mt-2 text-xs text-blue-400 font-medium">
          ← NEXT TASK
        </div>
      )}
    </div>
  );
};

export default TaskList;