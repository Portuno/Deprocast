import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Journal from './pages/Journal';
import Calendar from './pages/Calendar';
import Protocols from './pages/Protocols';
import Profile from './pages/Profile';
import { projects, tasks as initialTasks, navigationItems, Task } from './data/mockData';

function App() {
  const [currentProjectId, setCurrentProjectId] = useState(projects[0].id);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [nextTaskId, setNextTaskId] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];
  const currentProjectTasks = tasks.filter(task => task.projectId === currentProjectId);

  // AI suggestion logic - prioritize high priority pending tasks
  useEffect(() => {
    const pendingTasks = currentProjectTasks.filter(task => task.status === 'pending');
    if (pendingTasks.length > 0) {
      // Sort by priority: high -> medium -> low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sortedTasks = pendingTasks.sort((a, b) => 
        priorityOrder[b.priority] - priorityOrder[a.priority]
      );
      setNextTaskId(sortedTasks[0].id);
    } else {
      setNextTaskId(null);
    }
  }, [currentProjectId, tasks]);

  const nextTask = nextTaskId ? tasks.find(task => task.id === nextTaskId) || null : null;

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  const handleTaskSelect = (taskId: string) => {
    setNextTaskId(taskId);
  };

  const handleStartTask = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'in-progress' as const }
          : task
      )
    );
  };

  const renderCurrentPage = () => {
    switch (activeNavItem) {
      case 'dashboard':
        return (
          <Dashboard
            tasks={currentProjectTasks}
            nextTaskId={nextTaskId}
            nextTask={nextTask}
            onTaskSelect={handleTaskSelect}
            onStartTask={handleStartTask}
          />
        );
      case 'projects':
        return (
          <Projects
            projects={projects}
            tasks={tasks}
            currentProjectId={currentProjectId}
            onProjectChange={handleProjectChange}
          />
        );
      case 'journal':
        return <Journal />;
      case 'calendar':
        return <Calendar />;
      case 'protocols':
        return <Protocols />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <Dashboard
            tasks={currentProjectTasks}
            nextTaskId={nextTaskId}
            nextTask={nextTask}
            onTaskSelect={handleTaskSelect}
            onStartTask={handleStartTask}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <TopBar
          currentProject={currentProject}
          projects={projects}
          onProjectChange={handleProjectChange}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation */}
          <Navigation
            activeItem={activeNavItem}
            onItemClick={setActiveNavItem}
            items={navigationItems}
          />

          {/* Central Panel */}
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}

export default App;