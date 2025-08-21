import React from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  BookOpen, 
  Calendar, 
  User
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

interface MobileNavigationProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
  items: NavigationItem[];
}

const iconMap = {
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  Calendar,
  User,
};

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeItem, onItemClick, items }) => {
  return (
    <div className="lg:hidden mobile-navigation bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl">
      <nav className="grid grid-cols-5 px-2 py-3">
        {items.slice(0,5).map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap];
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/40'
              }`}
              aria-label={item.label}
            >
              <IconComponent className={`w-6 h-6 mb-1 transition-transform duration-200 ${
                isActive ? 'scale-110' : 'scale-100'
              }`} />
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-blue-300' : 'text-gray-400'
              }`}>
                {item.label.split(' ')[0]}
              </span>
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNavigation;
