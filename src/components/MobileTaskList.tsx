import React, { useState } from 'react';
import { CheckCircle, Clock, Play, Target, Edit2, Check, X } from 'lucide-react';
import { Task } from '../data/mockData';

interface MobileTaskListProps {
  tasks: Task[];
  nextTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onSelectNextTask: (taskId: string) => void;
  onEditTaskTitle: (taskId: string, newTitle: string) => void;
}

const MobileTaskList: React.FC<MobileTaskListProps> = ({ tasks, nextTaskId, onTaskSelect, onSelectNextTask, onEditTaskTitle }) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

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

  const handleStartEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editingTitle.trim()) {
      onEditTaskTitle(editingTaskId, editingTitle.trim());
      setEditingTaskId(null);
      setEditingTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const handleSelectNextTask = (taskId: string) => {
    onSelectNextTask(taskId);
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-3">
      <h3 className="text-base font-semibold text-white mb-3">Task Management</h3>
      <p className="text-xs text-gray-400 mb-3">Tap on a task to select it as your next focus, or edit the title.</p>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-3 h-3 text-yellow-500" />
            <h4 className="text-xs font-medium text-yellow-300">PENDING ({pendingTasks.length})</h4>
          </div>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-2 transition-colors border border-gray-700/30 ${
                  task.id === nextTaskId ? 'ring-2 ring-blue-400/50 bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(task.status)}
                      {task.id === nextTaskId && (
                        <span className="text-blue-400 text-xs font-medium bg-blue-900/30 px-1.5 py-0.5 rounded-full border border-blue-700/30">
                          NEXT
                        </span>
                      )}
                    </div>
                    
                    {/* Task Title - Editable or Clickable */}
                    {editingTaskId === task.id ? (
                      <div className="flex items-center space-x-2 mb-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 
                          className="text-xs font-medium text-white leading-tight cursor-pointer hover:text-blue-300 transition-colors"
                          onClick={() => handleSelectNextTask(task.id)}
                          title="Tap to select as next task"
                        >
                          {task.title}
                        </h5>
                        <button
                          onClick={() => handleStartEditing(task)}
                          className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded"
                          title="Edit task title"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{task.description}</p>
                  </div>
                  <div className="ml-2 flex flex-col items-end space-y-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{task.estimatedTimeMinutes}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Tasks */}
      {inProgressTasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Play className="w-3 h-3 text-blue-500" />
            <h4 className="text-xs font-medium text-blue-300">IN PROGRESS ({inProgressTasks.length})</h4>
          </div>
          <div className="space-y-2">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-2 transition-colors border border-gray-700/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(task.status)}
                    </div>
                    
                    {/* Task Title - Editable */}
                    {editingTaskId === task.id ? (
                      <div className="flex items-center space-x-2 mb-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="text-xs font-medium text-white leading-tight">
                          {task.title}
                        </h5>
                        <button
                          onClick={() => handleStartEditing(task)}
                          className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded"
                          title="Edit task title"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{task.description}</p>
                  </div>
                  <div className="ml-2 flex flex-col items-end space-y-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{task.estimatedTimeMinutes}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <h4 className="text-xs font-medium text-green-300">COMPLETED ({completedTasks.length})</h4>
          </div>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-2 transition-colors border border-gray-700/30 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(task.status)}
                    </div>
                    
                    {/* Task Title - Editable */}
                    {editingTaskId === task.id ? (
                      <div className="flex items-center space-x-2 mb-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="text-xs font-medium text-white leading-tight line-through">
                          {task.title}
                        </h5>
                        <button
                          onClick={() => handleStartEditing(task)}
                          className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded"
                          title="Edit task title"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{task.description}</p>
                  </div>
                  <div className="ml-2 flex flex-col items-end space-y-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{task.estimatedTimeMinutes}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <Target className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No tasks available</p>
          <p className="text-xs">Generate some microtasks to get started!</p>
        </div>
      )}
    </div>
  );
};

export default MobileTaskList;
