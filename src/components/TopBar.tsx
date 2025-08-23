import React, { useState } from 'react';
import { ChevronDown, LogOut, TrendingUp } from 'lucide-react';
import { DbProject } from '../integrations/supabase/projects';

interface TopBarProps {
  currentProject: DbProject | null;
  projects: DbProject[];
  onProjectChange: (projectId: string) => void;
  progressPercentage?: number;
  completedTasks?: number;
  totalTasks?: number;
}

const TopBar: React.FC<TopBarProps> = ({ 
  currentProject, 
  projects, 
  onProjectChange,
  progressPercentage = 0,
  completedTasks = 0,
  totalTasks = 0
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const handleSignOut = () => {
    // Implement sign out logic
    console.log('Sign out clicked');
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/30 px-6 py-4 flex items-center justify-between">
      {/* Left side - Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-xl font-bold text-white">Deprocast</span>
      </div>

      {/* Center - Overall Progress */}
      <div className="flex-1 max-w-md mx-8">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-300">Overall Progress</h3>
            </div>
            <span className="text-sm font-bold text-blue-400">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{completedTasks} completed</span>
            <span>{totalTasks - completedTasks} remaining</span>
          </div>
        </div>
      </div>

      {/* Right side - Project selector and sign out */}
      <div className="flex items-center space-x-4">
        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg border border-gray-700/30 transition-colors"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm font-medium">
              {currentProject ? currentProject.title : 'Select Project'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <div className="py-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      onProjectChange(project.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;