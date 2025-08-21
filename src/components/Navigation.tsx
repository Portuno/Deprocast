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
    <div className="hidden md:block w-64 h-full bg-gray-900/20 backdrop-blur-xl border-r border-gray-700/30">
      <div className="p-6">
        <nav className="space-y-2">
          {items.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const isActive = activeItem === item.id;
            
            // Safety check to ensure IconComponent exists
            if (!IconComponent) {
              console.warn(`Icon component not found for: ${item.icon}`);
              return null;
            }
            
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
  );
};

export default Navigation;