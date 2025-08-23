import React, { useState, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { DbProject } from '../integrations/supabase/projects';

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

  const handleSignOut = () => {
    console.log('Sign out clicked');
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/30">
      {/* Top row - Logo and Sign Out */}
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

        {/* Right side - Sign out */}
        <button
          onClick={handleSignOut}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Middle row - Tip spanning full width */}
      <div className="px-6 py-3">
        <div className="w-full bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/30 rounded-lg px-6 py-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-purple-300 text-base">💡</span>
            <span className="text-white text-base font-medium">{currentTip}</span>
          </div>
        </div>
      </div>

      {/* Bottom row - Project Selector */}
      <div className="px-6 py-3 flex justify-end">
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
      </div>
    </div>
  );
};

export default TopBar;