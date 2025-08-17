import React, { useState } from 'react';
import { Play, Zap } from 'lucide-react';
import { Task } from '../data/mockData';

interface TaskModuleProps {
  nextTask: Task | null;
  onStartTask: (taskId: string) => void;
}

const TaskModule: React.FC<TaskModuleProps> = ({ nextTask, onStartTask }) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    if (!nextTask) return;
    
    setIsStarting(true);
    setTimeout(() => {
      onStartTask(nextTask.id);
      setIsStarting(false);
    }, 1500);
  };

  if (!nextTask) {
    return (
      <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
        <Zap className="w-16 h-16 text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Tasks Available</h3>
        <p className="text-gray-500">All tasks completed! Great work.</p>
      </div>
    );
  }

  const priorityColors = {
    high: 'border-red-400/50 shadow-red-400/20',
    medium: 'border-yellow-400/50 shadow-yellow-400/20',
    low: 'border-green-400/50 shadow-green-400/20',
  };

  return (
    <div className={`bg-gray-900/30 backdrop-blur-xl border-2 ${priorityColors[nextTask.priority]} rounded-xl p-8 shadow-2xl`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-300">Your Next Task</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          nextTask.priority === 'high' 
            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
            : nextTask.priority === 'medium'
            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            : 'bg-green-500/20 text-green-300 border border-green-500/30'
        }`}>
          {nextTask.priority.toUpperCase()}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
        {nextTask.title}
      </h2>

      <button
        onClick={handleStart}
        disabled={isStarting}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
          isStarting
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-not-allowed opacity-75'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white hover:shadow-2xl hover:glow-lg transform hover:-translate-y-1'
        }`}
      >
        <div className="flex items-center justify-center space-x-3">
          {isStarting ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Starting Task...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span>Start Task</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default TaskModule;