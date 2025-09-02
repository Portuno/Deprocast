import React, { useState } from 'react';
import TaskModule from '../components/TaskModule';
import JournalModule from '../components/JournalModule';
import TaskList from '../components/TaskList';
import MobileTaskList from '../components/MobileTaskList';
import { Task } from '../data/mockData';
import { generateMicrotasksWithMabot } from '../integrations/mabot/generateTasks';

interface TaskCompletionData {
  taskTitle: string;
  estimatedTimeMinutes: number;
  actualTimeMinutes: number;
  motivationBefore: number;
  motivationAfter: number;
  dopamineRating: number;
  nextTaskMotivation: number;
  breakthroughMoments: string;
  taskInitiationDelay: number;
}

interface DashboardProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
  onTaskComplete: (completionData: TaskCompletionData) => void;
  onDirectComplete: (taskId: string) => void;
  isLoadingTasks: boolean;
  onRefresh: () => void;
  currentProject: any;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  onTaskSelect,
  onStartTask,
  onTaskComplete,
  onDirectComplete,
  isLoadingTasks,
  onRefresh,
  currentProject
}) => {
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const [nextTaskId, setNextTaskId] = useState<string | null>(null);

  // Neuroscience tips array for the loading screen
  const neuroscienceTips = [
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
  React.useEffect(() => {
    const randomIndex = Math.floor(Math.random() * neuroscienceTips.length);
    setCurrentTip(neuroscienceTips[randomIndex]);
  }, []);

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getProductivityInsights = () => {
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;

    if (completed === 0 && inProgress === 0) return "Ready to start your journey!";
    if (completed === 0) return "Great start! Keep the momentum going.";
    if (inProgress === 0) return "Excellent completion rate! Time to tackle new challenges.";
    return "Balanced progress! You're maintaining steady momentum.";
  };

  const generateMicrotasks = async () => {
    if (!currentProject) {
      alert('Please select a project first');
      return;
    }

    // Start loading immediately
    setIsGeneratingTasks(true);
    setGenerationProgress(0);
    setTipIndex(0);
    setCurrentTip(neuroscienceTips[0]);

    // Start progress animation (will be completed when API call finishes)
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) { // Stop at 90% until API completes
          return 90;
        }
        return prev + 0.5; // Slower progress to feel more natural
      });
    }, 100);

    // Rotate tips every 4 seconds
    const tipInterval = setInterval(() => {
      setTipIndex(prev => {
        const nextIndex = (prev + 1) % 3; // Show only 3 tips
        setCurrentTip(neuroscienceTips[nextIndex]);
        return nextIndex;
      });
    }, 4000);

    try {
      // Make the API call immediately
      const result = await generateMicrotasksWithMabot({
        projectId: currentProject.id,
        projectTitle: currentProject.title,
        projectDescription: currentProject.description || '',
        existingTasks: tasks.length
      });

      // Complete the progress when API call finishes
      setGenerationProgress(100);
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onRefresh) {
        onRefresh();
      }

      console.log('Generated tasks:', result);

    } catch (error) {
      console.error('Error generating tasks:', error);
      alert('Failed to generate tasks. Please try again.');
    } finally {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
      setTimeout(() => {
        setIsGeneratingTasks(false);
        setGenerationProgress(0);
        setCurrentTip('');
        setTipIndex(0);
      }, 1500);
    }
  };

  // Handle selecting the next task
  const handleSelectNextTask = (taskId: string) => {
    setNextTaskId(taskId);
    console.log('Next task selected:', taskId);
  };

  // Handle editing task title
  const handleEditTaskTitle = (taskId: string, newTitle: string) => {
    console.log('Task title edited:', taskId, newTitle);
    // Here you would typically update the task in the database
    // For now, we'll just log it
  };

  const nextTask = nextTaskId 
    ? tasks.find(task => task.id === nextTaskId) 
    : tasks.find(task => task.status === 'pending') || null;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Generate Tasks Button - Only visible when no tasks exist */}
      {tasks.length === 0 && (
        <div className="mb-6 text-center">
          <button
            onClick={generateMicrotasks}
            disabled={isGeneratingTasks}
            className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
              isGeneratingTasks
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            {isGeneratingTasks ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Tasks...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Generate Microtasks
              </>
            )}
          </button>
          <p className="text-sm text-gray-400 mt-2">
            Create focused, actionable tasks to break down your project
          </p>
        </div>
      )}

      {/* Enhanced Generation Progress */}
      {isGeneratingTasks && (
        <div className="mb-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30 shadow-2xl">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">🧠 AI Task Generation in Progress</h3>
              <p className="text-gray-300">Mabot is analyzing your project and creating intelligent microtasks...</p>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${generationProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              {/* Intentionally hide percentage and ETA during generation */}
            </div>

            {/* Enhanced Tip Display */}
            <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-300 text-lg">💡</span>
                </div>
                <div className="text-purple-300 text-lg font-semibold">Neuroscience Insight</div>
                <div className="ml-3 text-purple-400 text-sm font-medium">
                  Tip {tipIndex + 1} of 3
                </div>
              </div>
              <div className="text-white text-lg leading-relaxed font-medium">
                {currentTip}
              </div>
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        index === tipIndex
                          ? 'bg-purple-400 scale-125'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid - Adjusted for wider task management */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Task Module and Journal (smaller) */}
        <div className="xl:col-span-2 space-y-6">
          {nextTask && (
            <TaskModule
              nextTask={nextTask}
              onStartTask={onStartTask}
              onDirectComplete={onDirectComplete}
              onTaskComplete={onTaskComplete}
            />
          )}
          <JournalModule />
        </div>

        {/* Right Column - Task Lists (wider) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="hidden lg:block">
            {tasks.length > 0 ? (
              <TaskList
                tasks={tasks}
                nextTaskId={nextTaskId}
                onTaskSelect={onTaskSelect}
                onSelectNextTask={handleSelectNextTask}
                onEditTaskTitle={handleEditTaskTitle}
              />
            ) : !isLoadingTasks ? (
              <div className="text-center py-8 text-gray-400">
                <p>No tasks found</p>
              </div>
            ) : null}
          </div>

          <div className="lg:hidden">
            {tasks.length > 0 ? (
              <MobileTaskList
                tasks={tasks}
                nextTaskId={nextTaskId}
                onTaskSelect={onTaskSelect}
                onSelectNextTask={handleSelectNextTask}
                onEditTaskTitle={handleEditTaskTitle}
              />
            ) : !isLoadingTasks ? (
              <div className="text-center py-8 text-gray-400">
                <p>No tasks found</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;