import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
}

const Navigation: React.FC<NavigationProps> = ({ currentProject, taskStats }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/projects', icon: FolderOpen, label: 'Projects' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/protocols', icon: Settings, label: 'Protocols' },
    { path: '/profile', icon: User, label: 'My Profile' },
  ];

  return (
    <nav className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Logo and App Name */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold">Deprocast</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
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