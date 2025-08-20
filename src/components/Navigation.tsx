import React from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  BookOpen, 
  Calendar, 
  Settings,
  User
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

interface NavigationProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
  items: NavigationItem[];
}

const iconMap = {
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  Calendar,
  Settings,
  User,
};

const Navigation: React.FC<NavigationProps> = ({ activeItem, onItemClick, items }) => {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 h-full bg-gray-900/20 backdrop-blur-xl border-r border-gray-700/30">
        <div className="p-6">
          <nav className="space-y-2">
            {items.map((item) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap];
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-white shadow-lg glow-md'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30 hover:border-gray-600/30 border border-transparent'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/40">
        <nav className="grid grid-cols-5">
          {items.slice(0,5).map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className={`flex flex-col items-center justify-center py-3 text-xs ${isActive ? 'text-blue-400' : 'text-gray-400'}`}
                aria-label={item.label}
              >
                <IconComponent className="w-5 h-5" />
                <span className="mt-1">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Navigation;