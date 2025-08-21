import React, { useState } from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Task } from '../data/mockData';

interface MobileTaskListProps {
  tasks: Task[];
  nextTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

const MobileTaskList: React.FC<MobileTaskListProps> = ({ tasks, nextTaskId, onTaskSelect }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pending: true,
    inProgress: true,
    completed: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const renderTaskSection = (tasks: Task[], title: string, sectionKey: string, icon: React.ReactNode, color: string) => {
    if (tasks.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];
    const IconComponent = isExpanded ? ChevronUp : ChevronDown;

    return (
      <div className="bg-gray-900/20 backdrop-blur-xl border border-gray-700/30 rounded-xl mb-4 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/20 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {icon}
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              {title} ({tasks.length})
            </h4>
          </div>
          <IconComponent className="w-4 h-4 text-gray-400" />
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 space-y-2">
            {tasks.map((task) => (
              <MobileTaskCard 
                key={task.id} 
                task={task} 
                isNext={task.id === nextTaskId}
                onSelect={onTaskSelect}
                color={color}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lg:hidden p-4 space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Task Management</h3>
        <p className="text-sm text-gray-400">Tap to expand sections and select tasks</p>
      </div>

      {renderTaskSection(
        inProgressTasks,
        'In Progress',
        'inProgress',
        <Clock className="w-4 h-4 text-blue-400" />,
        'blue'
      )}

      {renderTaskSection(
        pendingTasks,
        'Pending',
        'pending',
        <AlertCircle className="w-4 h-4 text-yellow-400" />,
        'yellow'
      )}

      {renderTaskSection(
        completedTasks,
        'Completed',
        'completed',
        <CheckCircle2 className="w-4 h-4 text-green-400" />,
        'green'
      )}
    </div>
  );
};

interface MobileTaskCardProps {
  task: Task;
  isNext: boolean;
  onSelect: (taskId: string) => void;
  color: string;
}

const MobileTaskCard: React.FC<MobileTaskCardProps> = ({ task, isNext, onSelect, color }) => {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
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

  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    green: 'bg-green-500/10 border-green-500/20'
  };

  return (
    <div
      onClick={() => task.status === 'pending' && onSelect(task.id)}
      className={`p-3 bg-gray-800/30 border-l-4 ${getPriorityColor(task.priority)} rounded-r-lg border border-gray-700/30 transition-all duration-200 ${
        task.status === 'pending' 
          ? 'cursor-pointer hover:bg-gray-700/40 hover:border-gray-600/40 active:scale-98' 
          : 'opacity-60'
      } ${isNext ? 'ring-2 ring-blue-400/50 bg-blue-900/20' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        {getStatusIcon(task.status)}
        <div className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]} border`}>
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
        <div className="mt-2 text-xs text-blue-400 font-medium flex items-center">
          <span className="mr-1">←</span> NEXT TASK
        </div>
      )}
    </div>
  );
};

export default MobileTaskList;
