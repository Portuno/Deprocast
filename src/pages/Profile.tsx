import React, { useEffect, useMemo, useState } from 'react';
import { User, Settings, TrendingUp, Calendar, Edit3, Save, Brain, Sparkles, BarChart3, LineChart, Download } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { getOrCreateProfile, updateProfile } from '../integrations/supabase/profiles';
import { generateUserBlueprint, type UserBlueprint } from '../integrations/supabase/blueprint';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    timezone: 'UTC-8 (Pacific)',
    workingHours: '9:00 AM - 6:00 PM',
    focusGoal: '4 hours',
    theme: 'dark'
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rec = await getOrCreateProfile();
      if (!mounted || !rec) return;
      setProfile((p) => ({
        ...p,
        name: rec.full_name ?? p.name,
        email: rec.email ?? p.email,
        timezone: rec.timezone ?? p.timezone,
        workingHours: rec.working_hours ?? p.workingHours,
        focusGoal: rec.focus_goal ?? p.focusGoal,
        theme: rec.theme ?? p.theme,
      }));
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) return;
      const rec = await getOrCreateProfile();
      if (!rec) return;
      setProfile((p) => ({
        ...p,
        name: rec.full_name ?? p.name,
        email: rec.email ?? p.email,
        timezone: rec.timezone ?? p.timezone,
        workingHours: rec.working_hours ?? p.workingHours,
        focusGoal: rec.focus_goal ?? p.focusGoal,
        theme: rec.theme ?? p.theme,
      }));
    });
    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, []);

  const stats = {
    tasksCompleted: 127,
    focusHours: 89.5,
    streakDays: 12,
    productivity: 87,
    todayCompletionPercent: 62,
  };

  const energySeries = useMemo(() => [50, 65, 80, 60, 75, 55, 70], []);
  const taskPerf = useMemo(() => (
    [
      { label: 'Mon', est: 5, act: 6 },
      { label: 'Tue', est: 4, act: 3 },
      { label: 'Wed', est: 6, act: 7 },
      { label: 'Thu', est: 3, act: 3 },
      { label: 'Fri', est: 4, act: 5 },
    ]
  ), []);

  const handleSave = async () => {
    setIsEditing(false);
    await updateProfile({
      full_name: profile.name,
      email: profile.email,
      timezone: profile.timezone,
      working_hours: profile.workingHours,
      focus_goal: profile.focusGoal,
      theme: profile.theme,
    }).catch(() => {});
  };

  const handleGenerateBlueprint = async () => {
    setIsGeneratingBlueprint(true);
    try {
      const blueprint = await generateUserBlueprint();
      
      // Create a downloadable JSON file
      const dataStr = JSON.stringify(blueprint, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `deprocast-blueprint-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      // Show success message with brief summary
      const summary = `🎉 Blueprint Generated Successfully!\n\n` +
        `📊 Profile: ${blueprint.profile.personalInfo.name}\n` +
        `📁 Projects: ${blueprint.projects.total}\n` +
        `✅ Tasks: ${blueprint.tasks.total} (${blueprint.tasks.completed} completed)\n` +
        `📖 Journal Entries: ${blueprint.journal.totalEntries}\n` +
        `🚧 Obstacles Tracked: ${blueprint.obstacles.total}\n` +
        `📅 Calendar Events: ${blueprint.calendar.totalEvents}\n` +
        `📈 Productivity Score: ${blueprint.insights.productivityScore}%\n` +
        `🧠 Consistency Score: ${blueprint.insights.consistencyScore}%\n\n` +
        `✨ Your complete context blueprint has been downloaded!\n\n` +
        `This JSON file contains ALL your Deprocast data structured for AI context:\n` +
        `• Work patterns & preferences\n` +
        `• Productivity metrics & insights\n` +
        `• Emotional patterns & energy levels\n` +
        `• Common obstacles & solutions\n` +
        `• Project goals & motivations\n\n` +
        `Use this with ChatGPT, Claude, or any AI for personalized productivity coaching! 🚀`;
      
      alert(summary);
      console.log('Blueprint generated successfully:', blueprint);
      
    } catch (error) {
      console.error('Error generating blueprint:', error);
      alert('Error generating blueprint. Please try again.');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Profile</h1>
            <p className="text-gray-400">Your self-knowledge hub — track progress and understand your patterns</p>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5"
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Top overview: stats + basic profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Visual Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <RingCard label="Tasks Today" value={`${stats.todayCompletionPercent}%`} percent={stats.todayCompletionPercent} color="from-blue-400 to-cyan-400" />
            <StatCard label="Focus Hours" value={`${stats.focusHours}h`} color="text-green-400" />
            <StatCard label="Day Streak" value={`${stats.streakDays}`} color="text-yellow-400" />
            <StatCard label="Productivity" value={`${stats.productivity}%`} color="text-emerald-400" />
          </div>
          {/* Basic Profile Side */}
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{profile.name || 'Your Name'}</p>
                <p className="text-sm text-gray-400">{profile.email || 'your@email.com'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoPill label="Timezone" value={profile.timezone} />
              <InfoPill label="Working Hours" value={profile.workingHours} />
              <InfoPill label="Focus Goal" value={profile.focusGoal} />
              <InfoPill label="Theme" value={profile.theme} />
            </div>
          </div>
        </div>

        {/* Context Blueprint - central module */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 mb-6">
          <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                <Brain className="w-7 h-7 text-indigo-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Context Blueprint</h2>
                <p className="text-gray-400 text-sm">An AI-created profile to optimize your productivity and coaching interactions.</p>
              </div>
            </div>
            <button
              onClick={handleGenerateBlueprint}
              disabled={isGeneratingBlueprint}
              className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium flex items-center gap-2 transition-all duration-200"
              aria-label="Generate my profile"
            >
              {isGeneratingBlueprint ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate My Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pattern Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><LineChart className="w-5 h-5 text-blue-400" /> Energy Patterns</h3>
                <span className="text-xs text-gray-400">Last 7 days</span>
              </div>
              <EnergyLineChart values={energySeries} />
            </div>
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-400" /> Task Performance</h3>
                <span className="text-xs text-gray-400">Estimated vs Actual (hours)</span>
              </div>
              <TaskPerfBars data={taskPerf} />
            </div>
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Personalized Insight</h3>
              <p className="text-gray-300 text-sm">An energy peak was detected from 9–11 AM on Tuesdays. Use it for high-cognitive tasks and deep work sessions.</p>
            </div>
          </div>

          {/* Right Panel: Recent Activity + Quick Settings */}
          <div className="space-y-6">
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-3 text-sm">
                <ActivityItem color="bg-green-400" text={'Completed "Design wireframes"'} />
                <ActivityItem color="bg-blue-400" text={'Started focus session'} />
                <ActivityItem color="bg-purple-400" text={'Added journal entry'} />
                <ActivityItem color="bg-yellow-400" text={'Used Deep Focus protocol'} />
              </div>
            </div>
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Quick Settings</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Daily Focus Goal</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.focusGoal}
                      onChange={(e) => setProfile({ ...profile, focusGoal: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-white bg-gray-800/30 px-4 py-2 rounded-lg text-sm">{profile.focusGoal}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  {isEditing ? (
                    <select
                      value={profile.theme}
                      onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  ) : (
                    <p className="text-white bg-gray-800/30 px-4 py-2 rounded-lg text-sm capitalize">{profile.theme}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

// UI helpers
type RingCardProps = { label: string; value: string; percent: number; color: string };
const RingCard: React.FC<RingCardProps> = ({ label, value, percent, color }) => {
  const angle = Math.max(0, Math.min(100, percent)) * 3.6;
  return (
    <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700/30 flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-full"
        style={{
          background: `conic-gradient(var(--tw-gradient-from) 0deg, var(--tw-gradient-to) ${angle}deg, rgba(31,41,55,0.6) ${angle}deg 360deg)`,
        }}
      >
        <div className="w-14 h-14 rounded-full bg-gray-900/90 m-1 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{value}</span>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <div className={`hidden ${color}`} />
    </div>
  );
};

type StatCardProps = { label: string; value: string; color: string };
const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700/30 text-center">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

type InfoPillProps = { label: string; value: string };
const InfoPill: React.FC<InfoPillProps> = ({ label, value }) => (
  <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm text-white">{value}</p>
  </div>
);

type ActivityItemProps = { color: string; text: string };
const ActivityItem: React.FC<ActivityItemProps> = ({ color, text }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-gray-300 text-sm">{text}</span>
  </div>
);

type EnergyLineChartProps = { values: number[] };
const EnergyLineChart: React.FC<EnergyLineChartProps> = ({ values }) => {
  const width = 520;
  const height = 140;
  const padding = 8;
  const step = (width - padding * 2) / (values.length - 1);
  const max = 100;
  const points = values
    .map((v, i) => `${padding + i * step},${height - padding - (v / max) * (height - padding * 2)}`)
    .join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="text-blue-400">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
};

type TaskPerf = { label: string; est: number; act: number };
type TaskPerfBarsProps = { data: TaskPerf[] };
const TaskPerfBars: React.FC<TaskPerfBarsProps> = ({ data }) => {
  const max = Math.max(...data.flatMap(d => [d.est, d.act]), 1);
  return (
    <div className="grid grid-cols-5 gap-3">
      {data.map(d => (
        <div key={d.label} className="text-center">
          <div className="h-28 flex items-end gap-1 justify-center">
            <div className="w-3 bg-purple-500/40" style={{ height: `${(d.est / max) * 100}%` }} title={`Estimated ${d.est}h`} />
            <div className="w-3 bg-blue-500/70" style={{ height: `${(d.act / max) * 100}%` }} title={`Actual ${d.act}h`} />
          </div>
          <div className="mt-1 text-xs text-gray-400">{d.label}</div>
        </div>
      ))}
    </div>
  );
};