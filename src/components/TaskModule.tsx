import React, { useState } from 'react';
import { Target, Brain, Play, CheckCircle } from 'lucide-react';
import { Task } from '../data/mockData';
import PomodoroTimer from './PomodoroTimer';
import TaskCompletionModal from './TaskCompletionModal';

interface TaskCompletionData {
  taskTitle: string;
  estimatedTimeMinutes: number;
  actualTimeMinutes: number;
  motivationBefore: number;
  motivationAfter: number;
  dopamineRating: number;
  nextTaskMotivation: number;
  breakthroughMoments: string;
  taskInitiationDelay: number;
}

interface TaskModuleProps {
  nextTask: Task;
  onStartTask: (taskId: string) => void;
  onTaskComplete: (completionData: any) => void;
  onDirectComplete?: (taskId: string) => void;
}

const TaskModule: React.FC<TaskModuleProps> = ({ 
  nextTask, 
  onStartTask,
  onTaskComplete,
  onDirectComplete
}) => {
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [isTaskInProgress, setIsTaskInProgress] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);

  const handleInitiateTask = () => {
    if (nextTask) {
      setIsTaskInProgress(true);
      setShowPomodoro(true);
      setTaskStartTime(new Date());
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

  const handleDirectComplete = () => {
    if (nextTask) {
      setShowCompletionModal(true);
    }
  };

  const handleModalComplete = (completionData: TaskCompletionData) => {
    // Update the completion data with the actual task start time
    const actualTimeMinutes = taskStartTime 
      ? Math.max(1, Math.round((new Date().getTime() - taskStartTime.getTime()) / 60000))
      : completionData.actualTimeMinutes;

    const finalCompletionData = {
      ...completionData,
      actualTimeMinutes,
      taskInitiationDelay: taskStartTime 
        ? Math.round((taskStartTime.getTime() - new Date().getTime()) / 1000)
        : 0
    };

    // Call the parent's completion handler
    if (onDirectComplete) {
      onDirectComplete(nextTask.id);
    }

    // Also call the detailed completion handler if available
    if (onTaskComplete) {
      onTaskComplete(finalCompletionData);
    }

    setIsTaskInProgress(false);
    setTaskStartTime(null);
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
        {/* Task Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg md:text-xl font-semibold text-white">YOUR NEXT TASK</h3>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
            {nextTask.title}
          </h2>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            {nextTask.description}
          </p>
        </div>

        {/* Task Details */}
        <div className="mb-6 flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Estimated time:</span>
            <span className="text-white font-medium">~{nextTask.estimatedTimeMinutes} min</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isTaskInProgress ? (
            <button
              onClick={handleInitiateTask}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Initiate Task</span>
            </button>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p className="text-purple-400 text-sm">Task in progress...</p>
            </div>
          )}

          {!isTaskInProgress && (
            <button
              onClick={handleDirectComplete}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Task</span>
            </button>
          )}
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

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        task={nextTask}
        onComplete={handleModalComplete}
      />
    </>
  );
};

export default TaskModule;