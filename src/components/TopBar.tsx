import React from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { Project } from '../data/mockData';

interface TopBarProps {
  currentProject: Project;
  projects: Project[];
  onProjectChange: (projectId: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentProject, projects, onProjectChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <div className="h-16 bg-gray-900/30 backdrop-blur-xl border-b border-gray-700/30 px-6 flex items-center justify-between">
      {/* Logo and App Name */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide">Deprocast</h1>
      </div>

      {/* Project Selector */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg text-white hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200 hover:glow-sm"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentProject.color }}
          ></div>
          <span className="font-medium">{currentProject.name}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-2xl z-50">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  onProjectChange(project.id);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700/50 transition-colors duration-150 ${
                  project.id === currentProject.id ? 'bg-gray-700/30' : ''
                } ${project.id === projects[0].id ? 'rounded-t-lg' : ''} ${
                  project.id === projects[projects.length - 1].id ? 'rounded-b-lg' : ''
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                ></div>
                <span className="text-white font-medium">{project.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;