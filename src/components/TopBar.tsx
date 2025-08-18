import React from 'react';
import ModalPortal from './ModalPortal';
import { ChevronDown, Zap, LogOut } from 'lucide-react';
import type { DbProject } from '../integrations/supabase/projects';
import { supabase } from '../integrations/supabase/client';

interface TopBarProps {
  currentProject: DbProject | null;
  projects: DbProject[];
  onProjectChange: (projectId: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentProject, projects, onProjectChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = React.useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 320 });

  const updateMenuPosition = React.useCallback(() => {
    const el = toggleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 320;
    let left = rect.right - width;
    if (left < 8) left = 8;
    const maxLeft = window.innerWidth - width - 8;
    if (left > maxLeft) left = maxLeft;
    const top = rect.bottom + 8;
    setMenuPos({ top, left, width });
  }, []);

  React.useEffect(() => {
    if (!isDropdownOpen) return;
    updateMenuPosition();
    const handler = () => updateMenuPosition();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [isDropdownOpen, updateMenuPosition]);

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
      <div className="relative flex items-center gap-3">
        <button
          ref={toggleRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg text-white hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200 hover:glow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <span className="font-medium">{currentProject?.title || 'Select Project'}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <button
          onClick={async () => { await supabase.auth.signOut(); }}
          className="p-2 rounded-lg bg-gray-800/50 border border-gray-600/30 hover:bg-gray-700/50"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 text-gray-300" />
        </button>

        {isDropdownOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[120]" onClick={() => setIsDropdownOpen(false)}>
              <div
                className="absolute bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl max-h-80 overflow-y-auto"
                style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
                onClick={(e) => e.stopPropagation()}
              >
                {projects.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">No projects yet</div>
                ) : (
                  projects.map((project, index) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onProjectChange(project.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors duration-150 flex items-start gap-3 ${
                        currentProject && project.id === currentProject.id ? 'bg-gray-700/30' : ''
                      } ${index === 0 ? 'rounded-t-xl' : ''} ${
                        index === projects.length - 1 ? 'rounded-b-xl' : ''
                      }`}
                    >
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{project.title}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span>Due {new Date(project.target_completion_date).toLocaleDateString()}</span>
                          {project.category && <span className="px-2 py-0.5 rounded bg-gray-800/60 border border-gray-700/40 text-gray-300">{project.category}</span>}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </div>
  );
};

export default TopBar;