import React from 'react';
import { CheckCircle, Clock, Play, Target } from 'lucide-react';
import { Task } from '../data/mockData';

interface TaskListProps {
  tasks: Task[];
  nextTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, nextTaskId, onTaskSelect }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Play className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 text-green-300 border-green-700/30';
      case 'in-progress':
        return 'bg-blue-900/30 text-blue-300 border-blue-700/30';
      default:
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/50 text-red-300 border-red-700/30';
      case 'medium':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/30';
      default:
        return 'bg-green-900/50 text-green-300 border-green-700/30';
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Task Management</h3>
      <p className="text-sm text-gray-400 mb-4">Select a task to make it your next focus.</p>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-500" />
            <h4 className="text-sm font-medium text-yellow-300">PENDING ({pendingTasks.length})</h4>
          </div>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskSelect(task.id)}
                className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-3 cursor-pointer transition-colors border border-gray-700/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(task.status)}
                      {task.id === nextTaskId && (
                        <span className="text-blue-400 text-xs font-medium bg-blue-900/30 px-2 py-1 rounded-full border border-blue-700/30">
                          - NEXT TASK
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-medium text-white mb-1 leading-tight">{task.title}</h5>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{task.description}</p>
                  </div>
                  <div className="ml-3 flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{task.estimatedTimeMinutes}min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Tasks */}
      {inProgressTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Play className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-medium text-blue-300">IN PROGRESS ({inProgressTasks.length})</h4>
          </div>
          <div className="space-y-2">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskSelect(task.id)}
                className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-3 cursor-pointer transition-colors border border-gray-700/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(task.status)}
                    </div>
                    <h5 className="text-sm font-medium text-white mb-1 leading-tight">{task.title}</h5>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{task.description}</p>
                  </div>
                  <div className="ml-3 flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{task.estimatedTimeMinutes}min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <h4 className="text-sm font-medium text-green-300">COMPLETED ({completedTasks.length})</h4>
          </div>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskSelect(task.id)}
                className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-3 cursor-pointer transition-colors border border-gray-700/30 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(task.status)}
                    </div>
                    <h5 className="text-sm font-medium text-white mb-1 leading-tight line-through">{task.title}</h5>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{task.description}</p>
                  </div>
                  <div className="ml-3 flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{task.estimatedTimeMinutes}min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tasks available</p>
          <p className="text-sm">Generate some microtasks to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;