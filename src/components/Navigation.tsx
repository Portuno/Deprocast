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
      {/* Main Navigation Items */}
      <div className="p-4 pt-2">
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

      {/* Task Overview - Positioned higher and more prominently */}
      {taskStats && (
        <div className="p-4 border-t border-gray-700 mt-2">
          <h3 className="text-sm font-medium text-white mb-3">Task Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-900/60 rounded-lg p-3 text-center border border-blue-700/40">
              <ClipboardList className="w-4 h-4 text-blue-300 mx-auto mb-1" />
              <div className="text-blue-200 font-bold text-base">{taskStats.total}</div>
              <div className="text-blue-100 text-xs">Total</div>
            </div>
            <div className="bg-yellow-900/60 rounded-lg p-3 text-center border border-yellow-700/40">
              <Clock className="w-4 h-4 text-yellow-300 mx-auto mb-1" />
              <div className="text-yellow-200 font-bold text-base">{taskStats.pending}</div>
              <div className="text-yellow-100 text-xs">Pending</div>
            </div>
            <div className="bg-blue-900/60 rounded-lg p-3 text-center border border-blue-700/40">
              <Rocket className="w-4 h-4 text-blue-300 mx-auto mb-1" />
              <div className="text-blue-200 font-bold text-base">{taskStats.inProgress}</div>
              <div className="text-blue-100 text-xs">In Progress</div>
            </div>
            <div className="bg-green-900/60 rounded-lg p-3 text-center border border-green-700/40">
              <CheckCircle className="w-4 h-4 text-green-300 mx-auto mb-1" />
              <div className="text-green-200 font-bold text-base">{taskStats.completed}</div>
              <div className="text-green-100 text-xs">Completed</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;