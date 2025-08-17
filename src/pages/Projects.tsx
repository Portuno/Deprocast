import React, { useState } from 'react';
import { Plus, FolderOpen, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { Project, Task } from '../data/mockData';

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  currentProjectId: string;
  onProjectChange: (projectId: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ 
  projects, 
  tasks, 
  currentProjectId, 
  onProjectChange 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#00D4FF');

  const colors = ['#00D4FF', '#A855F7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const completed = projectTasks.filter(task => task.status === 'completed').length;
    const total = projectTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-gray-400">Manage your projects and track progress</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Create Project Form */}
        {showCreateForm && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="flex space-x-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        selectedColor === color ? 'border-white scale-110' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Here you would typically add the project to your state
                    setShowCreateForm(false);
                    setNewProjectName('');
                    setSelectedColor('#00D4FF');
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Create Project
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProjectName('');
                    setSelectedColor('#00D4FF');
                  }}
                  className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const stats = getProjectStats(project.id);
            const isActive = project.id === currentProjectId;
            
            return (
              <div
                key={project.id}
                onClick={() => onProjectChange(project.id)}
                className={`bg-gray-900/30 backdrop-blur-xl border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:bg-gray-800/40 hover:border-gray-600/40 ${
                  isActive 
                    ? 'border-blue-400/50 ring-2 ring-blue-400/30 bg-blue-900/20' 
                    : 'border-gray-700/30'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <FolderOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <button className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{stats.completed}/{stats.total} tasks</span>
                  </div>
                  
                  <div className="w-full bg-gray-700/30 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${stats.percentage}%`,
                        backgroundColor: project.color
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{stats.percentage}% complete</span>
                    {isActive && (
                      <span className="text-xs text-blue-400 font-medium">ACTIVE</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Projects;