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
      <div className="flex-1 p-4 pt-4">
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
          <h3 className="text-sm font-medium text-white mb-4">Task Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-900/60 rounded-lg p-4 text-center border border-blue-700/40">
              <ClipboardList className="w-5 h-5 text-blue-300 mx-auto mb-2" />
              <div className="text-blue-200 font-bold text-lg">{taskStats.total}</div>
              <div className="text-blue-100 text-sm">Total</div>
            </div>
            <div className="bg-yellow-900/60 rounded-lg p-4 text-center border border-yellow-700/40">
              <Clock className="w-5 h-5 text-yellow-300 mx-auto mb-2" />
              <div className="text-yellow-200 font-bold text-lg">{taskStats.pending}</div>
              <div className="text-yellow-100 text-sm">Pending</div>
            </div>
            <div className="bg-blue-900/60 rounded-lg p-4 text-center border border-blue-700/40">
              <Rocket className="w-5 h-5 text-blue-300 mx-auto mb-2" />
              <div className="text-blue-200 font-bold text-lg">{taskStats.inProgress}</div>
              <div className="text-blue-100 text-sm">In Progress</div>
            </div>
            <div className="bg-green-900/60 rounded-lg p-4 text-center border border-green-700/40">
              <CheckCircle className="w-5 h-5 text-green-300 mx-auto mb-2" />
              <div className="text-green-200 font-bold text-lg">{taskStats.completed}</div>
              <div className="text-green-100 text-sm">Completed</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;