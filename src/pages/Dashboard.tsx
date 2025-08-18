import React from 'react';
import TaskModule from '../components/TaskModule';
import JournalModule from '../components/JournalModule';
import TaskList from '../components/TaskList';
import { Task } from '../data/mockData';
import { generateMicrotasksForProject, getOrCreateUuidChatId, setChatId, ensurePlatformChatId } from '../integrations/mabot/client';
import type { DbProject } from '../integrations/supabase/projects';
import { bulkInsertTasks } from '../integrations/supabase/tasks';
import { TrendingUp, Clock, CheckCircle2, Target } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  nextTaskId: string | null;
  nextTask: Task | null;
  onTaskSelect: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
  currentProject?: DbProject | null;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  nextTaskId,
  nextTask,
  onTaskSelect,
  onStartTask,
  currentProject
}) => {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleGenerateMicrotasks = async () => {
    try {
      if (!currentProject) {
        // eslint-disable-next-line no-console
        console.error('No current project selected');
        return;
      }

      // Per-project chat continuity
      const chatId = getOrCreateUuidChatId(currentProject.id);
      setChatId(chatId);
      ensurePlatformChatId('deproPB');

      const projectDescription = currentProject.description;
      const outcomeGoal = currentProject.description;
      const res = await generateMicrotasksForProject({
        project_description: projectDescription,
        outcome_goal: outcomeGoal,
        available_time_blocks: [],
        target_completion_date: currentProject.target_completion_date,
        title: currentProject.title,
        category: currentProject.category,
        motivation: currentProject.motivation,
        perceived_difficulty: currentProject.perceived_difficulty,
        known_obstacles: currentProject.known_obstacles,
        skills_resources_needed: currentProject.skills_resources_needed ?? []
      });

      if (!res || !res.success || !res.data) {
        // eslint-disable-next-line no-console
        console.error('Mabot response error', res);
        return;
      }

      const raw: any = (res as any).data;
      let tasksAny: any[] | null = Array.isArray(raw?.tasks) ? (raw.tasks as any[]) : null;

      // Fallback: try to parse assistant text JSON
      if (!tasksAny) {
        try {
          const messages = (raw?.messages as Array<any>) || [];
          const assistant = messages.find((m) => m?.role === 'assistant');
          const contents = (assistant?.contents as Array<any>) || [];
          const text = (contents.find((c) => c?.type === 'text')?.value as string) || '';
          if (text) {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed?.tasks)) tasksAny = parsed.tasks as any[];
          }
        } catch {
          // ignore parse errors
        }
      }

      if (!Array.isArray(tasksAny)) {
        // eslint-disable-next-line no-console
        console.error('Mabot did not return tasks in the expected format');
        return;
      }

      const toPriority = (risk: string | undefined): Task['priority'] => {
        if (risk === 'high') return 'high';
        if (risk === 'medium') return 'medium';
        return 'low';
      };

      const mapped: Task[] = tasksAny.map((t: any) => {
        const title: string = t?.micro_task || t?.title || 'Microtask';
        const desc: string = t?.description || t?.why || '';
        const ac: string[] = Array.isArray(t?.acceptance_criteria) ? t.acceptance_criteria : [];
        const description = ac.length > 0 ? `${desc}\nAcceptance: ${ac.join('; ')}` : desc;
        const est: number | undefined = t?.estimate_minutes ?? t?.estimatedTimeMinutes;
        const risk: string | undefined = t?.risk ?? t?.resistanceLevel;
        const tags: string[] = Array.isArray(t?.tags) ? t.tags : [];
        return {
          id: String(t?.id || Math.random().toString(36).slice(2)),
          title,
          description,
          status: 'pending',
          priority: toPriority(risk),
          projectId: currentProject.id,
          estimatedTimeMinutes: typeof est === 'number' ? est : undefined,
          dopamineScore: t?.dopamineScore,
          taskType: tags[0] || t?.taskType,
          resistanceLevel: (risk as any) || undefined,
          dependencyTaskId: t?.dependencyTaskExternalId ?? undefined,
        } as Task;
      });

      // Persist (requires micro_tasks table); ignore DB write errors gracefully
      try {
        await bulkInsertTasks(currentProject.id, mapped);
      } catch {
        // ignore persistence errors for now
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Generate microtasks failed', err);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Central Panel */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-green-400">{completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">{inProgressTasks}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-400">{completedTasks}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{pendingTasks}</p>
              </div>
              <Target className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {tasks.length === 0 && (
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-10 text-center">
            <div className="text-gray-400 mb-4">No Tasks Available</div>
            <button onClick={handleGenerateMicrotasks} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200">Generate Microtasks</button>
          </div>
        )}

        <TaskModule
          nextTask={nextTask}
          onStartTask={onStartTask}
        />
        <JournalModule currentProjectId={currentProject?.id ?? null} />
      </div>

      {/* Right Panel */}
      <TaskList
        tasks={tasks}
        nextTaskId={nextTaskId}
        onTaskSelect={onTaskSelect}
      />
    </div>
  );
};

export default Dashboard;