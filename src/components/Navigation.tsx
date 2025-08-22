import React from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  BookOpen, 
  Calendar, 
  Settings, 
  User,
  ClipboardList,
  Clock,
  Rocket,
  CheckCircle
} from 'lucide-react';

interface NavigationProps {
  currentProject?: { id: string; name: string } | null;
  taskStats?: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentProject, taskStats, activeItem, onItemClick }) => {
  const navigationItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'protocols', icon: Settings, label: 'Protocols' },
    { id: 'profile', icon: User, label: 'My Profile' },
  ];

  return (
    <nav className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Navigation Items */}
      <div className="flex-1 p-4 pt-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Task Statistics */}
      {taskStats && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Task Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-900/50 rounded-lg p-3 text-center">
              <ClipboardList className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <div className="text-blue-400 font-semibold text-sm">{taskStats.total}</div>
              <div className="text-gray-400 text-xs">Total</div>
            </div>
            <div className="bg-yellow-900/50 rounded-lg p-3 text-center">
              <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-yellow-400 font-semibold text-sm">{taskStats.pending}</div>
              <div className="text-gray-400 text-xs">Pending</div>
            </div>
            <div className="bg-blue-900/50 rounded-lg p-3 text-center">
              <Rocket className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <div className="text-blue-400 font-semibold text-sm">{taskStats.inProgress}</div>
              <div className="text-gray-400 text-xs">In Progress</div>
            </div>
            <div className="bg-green-900/50 rounded-lg p-3 text-center">
              <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <div className="text-green-400 font-semibold text-sm">{taskStats.completed}</div>
              <div className="text-gray-400 text-xs">Completed</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;