import React, { useState } from 'react';
import { Play, Clock, Target, Brain, Zap } from 'lucide-react';
import { Task } from '../data/mockData';
import PomodoroTimer from './PomodoroTimer';

interface TaskModuleProps {
  nextTask: Task | null;
  onStartTask: (taskId: string) => void;
  onTaskComplete?: (completionData: any) => void;
}

const TaskModule: React.FC<TaskModuleProps> = ({ 
  nextTask, 
  onStartTask,
  onTaskComplete 
}) => {
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [isTaskInProgress, setIsTaskInProgress] = useState(false);

  const handleInitiateTask = () => {
    if (nextTask) {
      setIsTaskInProgress(true);
      setShowPomodoro(true);
      onStartTask(nextTask.id);
    }
  };

  const handlePomodoroComplete = (completionData: any) => {
    setShowPomodoro(false);
    setIsTaskInProgress(false);
    
    // Pass completion data to parent component
    if (onTaskComplete) {
      onTaskComplete(completionData);
    }
  };

  const handlePomodoroCancel = () => {
    setShowPomodoro(false);
    setIsTaskInProgress(false);
  };

  if (!nextTask) {
    return (
      <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6 md:p-8">
        <div className="text-center">
          <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-400 mb-2">No Tasks Available</h3>
          <p className="text-sm md:text-base text-gray-500">
            All tasks are completed! Great job staying productive.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <h3 className="text-base md:text-lg font-semibold text-blue-400 uppercase tracking-wide">
                Your Next Task
              </h3>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              {nextTask.title}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Priority: {nextTask.priority}</span>
              </div>
              {nextTask.estimatedTimeMinutes && (
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>~{nextTask.estimatedTimeMinutes} min</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Description */}
        {nextTask.description && (
          <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              {nextTask.description}
            </p>
          </div>
        )}

        {/* Neuroscience Protocol Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <h4 className="font-semibold text-white">🧠 Pomodoro+ Protocol</h4>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>25-minute focused work sessions with dopamine priming</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>5-minute celebration breaks to reinforce neural pathways</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Real-time obstacle resolution with AI-powered solutions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Comprehensive data collection for personalized coaching</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          {!isTaskInProgress ? (
            <button
              onClick={handleInitiateTask}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative flex items-center space-x-3">
                <Zap className="w-6 h-6 animate-pulse" />
                <span>🚀 Initiate Task</span>
              </div>
            </button>
          ) : (
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Task in Progress</span>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-gray-800/20 rounded-lg border border-gray-700/20">
          <h4 className="text-sm font-medium text-gray-300 mb-2">💡 Quick Tips:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Clear your workspace before starting</li>
            <li>• Put your phone in another room</li>
            <li>• Have water and snacks ready</li>
            <li>• Remember: 25 minutes of focus beats 2 hours of distracted work</li>
            <li>• Celebrate every micro-win to train your brain</li>
          </ul>
        </div>
      </div>

      {/* Pomodoro Timer Modal */}
      {showPomodoro && (
        <PomodoroTimer
          isActive={showPomodoro}
          onComplete={handlePomodoroComplete}
          onCancel={handlePomodoroCancel}
          taskTitle={nextTask.title}
          estimatedTimeMinutes={nextTask.estimatedTimeMinutes}
        />
      )}
    </>
  );
};

export default TaskModule;