import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, LogOut, FolderOpen } from 'lucide-react';
import { DbProject } from '../integrations/supabase/projects';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  currentProject: DbProject | null;
  projects: DbProject[];
  onProjectChange: (projectId: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  currentProject,
  projects,
  onProjectChange
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const { user, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Array of tips that will be randomly selected
  const tips = [
    "Clear your workspace before starting",
    "Put your phone in another room",
    "Have water and snacks ready",
    "Remember: 25 minutes of focus beats 2 hours of distracted work",
    "Celebrate every micro-win to train your brain",
    "Use \"Complete Task\" if you finished without the timer",
    "Gratitude is the engine of abundance. Celebrate your small victories.",
    "Effort isn't the goal, it's the path. Enjoy the process.",
    "Your brain doesn't distinguish between big and small wins. Celebrate them all.",
    "Dopamine is your motivation currency. Earn it smartly.",
    "Your willpower isn't infinite. Use it wisely to just start.",
    "Transformation isn't about more action, but more alignment.",
    "Success is a series of small, well-executed habits.",
    "True desires are a frequency, not a prize. Tune in to them.",
    "Your brain has its own rhythm. Don't exhaust it; give it rest.",
    "Procrastination isn't a flaw; it's a signal the task feels overwhelming.",
    "Less noise, more focus. Eliminate distractions.",
    "Creativity doesn't shout; it whispers. Take a moment to listen.",
    "Don't ask \"What else should I do?\" Ask \"What's polluting my focus?\"",
    "Perfectionism is the enemy of progress. Don't wait for perfect to begin.",
    "True change happens when your body feels safe with it.",
    "Discomfort is your brain's gym. Embrace it; it's a sign of growth.",
    "Don't deceive yourself: real work happens during the effort, not the reward.",
    "Your inner state is everything. External reality is just a reflection.",
    "Act from peace, not from desperation.",
    "Your brain can't focus if it can't rest.",
    "Magic happens when you stop forcing and start flowing.",
    "The \"how\" isn't your responsibility. Trust the \"now.\"",
    "Dopamine gets depleted. Don't chase high spikes; seek a steady flow.",
    "Doubt is your biggest obstacle. Replace it with faith in your process.",
    "Don't be defined by failures. Every stumble is data to improve.",
    "Focus is a muscle. Train it with small acts of concentration.",
    "The mind is the map, not the territory. Choose your thoughts wisely.",
    "Your micro-victories build the path to your bigger future.",
    "Your nervous system is the bridge between your inner world and reality.",
    "Move away from distraction, move toward intention.",
    "Discipline is the price of freedom.",
    "True manifestation is being, not pretending.",
    "Fear is just an emotion. Don't let it become a decision.",
    "Mental fatigue is real. Don't ignore it; give it a break.",
    "Patience is a virtue, especially when building a habit.",
    "Your \"future self\" is waiting for you in the present.",
    "Don't compare yourself. Your journey is unique, and so are your rules.",
    "What the world calls procrastination, you call data.",
    "Strength isn't in pushing, but in flowing.",
    "Every 25 minutes of focus is a step to rewiring your brain."
  ];

  // Set a random tip on component mount (page reload)
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    setCurrentTip(tips[randomIndex]);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };

    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProjectDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // The useAuth hook will handle the redirect
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDropdownToggle = () => {
    if (!isProjectDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
    setIsProjectDropdownOpen(!isProjectDropdownOpen);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/30 relative z-50">
      {/* Single row - Logo, Tip, and User Info */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Deprocast</span>
        </div>

        {/* Center - Tip (compact) */}
        <div className="flex-1 max-w-2xl mx-6">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/30 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <span className="text-purple-300 text-sm">💡</span>
              <span className="text-white text-sm font-medium truncate">{currentTip}</span>
            </div>
          </div>
        </div>

        {/* Right side - User info, Project selector, and Sign out */}
        <div className="flex items-center space-x-4">
          {/* User info */}
          {user && (
            <div className="text-sm text-gray-300">
              <span className="hidden sm:inline">Welcome, </span>
              <span className="font-medium text-white">{user.user_metadata?.full_name || user.email}</span>
            </div>
          )}

          {/* Project selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              ref={buttonRef}
              onClick={handleDropdownToggle}
              className={`flex items-center space-x-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/60 text-white rounded-lg border transition-all duration-200 min-w-[200px] ${
                isProjectDropdownOpen 
                  ? 'border-blue-500/50 bg-gray-700/60' 
                  : 'border-gray-600/40 hover:border-gray-500/60'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="flex-1 text-left">
                <span className="text-sm font-medium block truncate">
                {currentProject ? currentProject.title : 'Select Project'}
              </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                isProjectDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Project Dropdown Portal */}
      {isProjectDropdownOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[999998]" 
            onClick={() => setIsProjectDropdownOpen(false)} 
          />
          
          {/* Dropdown */}
          <div 
            className="fixed w-72 bg-gray-900 backdrop-blur-xl border border-gray-600/60 rounded-xl shadow-2xl z-[999999] max-h-80 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`
            }}
            ref={dropdownRef}
          >
            {projects.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <FolderOpen className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No projects found</p>
                <p className="text-xs text-gray-500 mt-1">Create a project to get started</p>
              </div>
            ) : (
              <div className="py-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      onProjectChange(project.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 transition-all duration-200 group relative ${
                      currentProject?.id === project.id
                        ? 'bg-blue-600/25 text-blue-300'
                        : 'hover:bg-gray-700/60 text-gray-200 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        currentProject?.id === project.id 
                          ? 'bg-blue-400' 
                          : 'bg-gray-500 group-hover:bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {project.title}
                        </div>
                        {project.description && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {project.description}
                          </div>
                        )}
                      </div>
                      {currentProject?.id === project.id && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    {/* Active project indicator line */}
                    {currentProject?.id === project.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default TopBar;