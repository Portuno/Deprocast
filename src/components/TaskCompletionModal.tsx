import React, { useState, useEffect } from 'react';
import { X, Clock, TrendingUp, Lightbulb, CheckCircle } from 'lucide-react';
import { Task } from '../data/mockData';

interface TaskCompletionData {
  taskTitle: string;
  estimatedTimeMinutes: number;
  actualTimeMinutes: number;
  motivationBefore: number;
  motivationAfter: number;
  dopamineRating: number;
  nextTaskMotivation: number;
  breakthroughMoments: string;
  taskInitiationDelay: number; // in seconds
}

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onComplete: (data: TaskCompletionData) => void;
}

const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  onClose,
  task,
  onComplete
}) => {
  const [formData, setFormData] = useState<TaskCompletionData>({
    taskTitle: task?.title || '',
    estimatedTimeMinutes: task?.estimatedTimeMinutes || 0,
    actualTimeMinutes: 0,
    motivationBefore: 5,
    motivationAfter: 5,
    dopamineRating: 5,
    nextTaskMotivation: 5,
    breakthroughMoments: '',
    taskInitiationDelay: 0
  });

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [clickTime, setClickTime] = useState<Date | null>(null);

  // Initialize start time when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setStartTime(new Date());
      setClickTime(new Date());
      setFormData(prev => ({
        ...prev,
        taskTitle: task.title,
        estimatedTimeMinutes: task.estimatedTimeMinutes || 0
      }));
    }
  }, [isOpen, task]);

  // Calculate actual time when modal opens
  useEffect(() => {
    if (startTime && isOpen) {
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      const diffMinutes = Math.round(diffMs / 60000);
      setFormData(prev => ({
        ...prev,
        actualTimeMinutes: Math.max(1, diffMinutes) // At least 1 minute
      }));
    }
  }, [startTime, isOpen]);

  // Calculate task initiation delay
  useEffect(() => {
    if (clickTime && startTime) {
      const diffMs = startTime.getTime() - clickTime.getTime();
      const diffSeconds = Math.round(diffMs / 1000);
      setFormData(prev => ({
        ...prev,
        taskInitiationDelay: diffSeconds
      }));
    }
  }, [clickTime, startTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
    onClose();
  };

  const handleInputChange = (field: keyof TaskCompletionData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-white">Complete Task</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
            <p className="text-gray-300 text-sm">{task.description}</p>
          </div>

          {/* Pre-Task Baseline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Pre-Task Baseline</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Motivation (1-10)
                </label>
                <select
                  value={formData.motivationBefore}
                  onChange={(e) => handleInputChange('motivationBefore', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Initiation Delay
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">{formData.taskInitiationDelay}s</span>
                  <span className="text-gray-400 text-sm">Time from click to start</span>
                </div>
              </div>
            </div>
          </div>

          {/* Post-Task Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Post-Task Metrics</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Final Motivation (1-10)
                </label>
                <select
                  value={formData.motivationAfter}
                  onChange={(e) => handleInputChange('motivationAfter', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dopamine Rating (1-10)
                </label>
                <select
                  value={formData.dopamineRating}
                  onChange={(e) => handleInputChange('dopamineRating', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Next Task Motivation (1-10)
                </label>
                <select
                  value={formData.nextTaskMotivation}
                  onChange={(e) => handleInputChange('nextTaskMotivation', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Performance
              </label>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">{formData.actualTimeMinutes} min</span>
                <span className="text-gray-400 text-sm">Actual time</span>
              </div>
            </div>
          </div>

          {/* Breakthrough Moments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span>Breakthrough Moments</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Any insights or moments when resistance disappeared?
              </label>
              <textarea
                value={formData.breakthroughMoments}
                onChange={(e) => handleInputChange('breakthroughMoments', e.target.value)}
                placeholder="Describe any 'aha' moments, resistance breakthroughs, or insights..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCompletionModal;
