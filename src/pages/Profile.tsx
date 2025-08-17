import React, { useState } from 'react';
import { User, Settings, Trophy, TrendingUp, Calendar, Target, Edit3, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    timezone: 'UTC-8 (Pacific)',
    workingHours: '9:00 AM - 6:00 PM',
    focusGoal: '4 hours',
    theme: 'dark'
  });

  const stats = {
    tasksCompleted: 127,
    focusHours: 89.5,
    streakDays: 12,
    protocolsUsed: 8,
    journalEntries: 23,
    productivity: 87
  };

  const achievements = [
    { id: 1, name: 'First Steps', description: 'Completed your first task', icon: '🎯', earned: true },
    { id: 2, name: 'Focus Master', description: 'Completed 50 focus sessions', icon: '🧠', earned: true },
    { id: 3, name: 'Streak Keeper', description: 'Maintained a 7-day streak', icon: '🔥', earned: true },
    { id: 4, name: 'Journal Writer', description: 'Written 20 journal entries', icon: '📝', earned: true },
    { id: 5, name: 'Protocol Expert', description: 'Used 10 different protocols', icon: '⚡', earned: false },
    { id: 6, name: 'Century Club', description: 'Completed 100 tasks', icon: '💯', earned: true }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-400">Manage your account and track your progress</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5"
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
                  <p className="text-gray-400">{profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-white bg-gray-800/30 px-4 py-3 rounded-lg">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-white bg-gray-800/30 px-4 py-3 rounded-lg">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  {isEditing ? (
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
                    >
                      <option value="UTC-8 (Pacific)">UTC-8 (Pacific)</option>
                      <option value="UTC-5 (Eastern)">UTC-5 (Eastern)</option>
                      <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                      <option value="UTC+1 (CET)">UTC+1 (CET)</option>
                    </select>
                  ) : (
                    <p className="text-white bg-gray-800/30 px-4 py-3 rounded-lg">{profile.timezone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Working Hours</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.workingHours}
                      onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-white bg-gray-800/30 px-4 py-3 rounded-lg">{profile.workingHours}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Productivity Stats */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Productivity Statistics</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{stats.tasksCompleted}</div>
                  <div className="text-sm text-gray-400">Tasks Completed</div>
                </div>

                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">{stats.focusHours}h</div>
                  <div className="text-sm text-gray-400">Focus Hours</div>
                </div>

                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.streakDays}</div>
                  <div className="text-sm text-gray-400">Day Streak</div>
                </div>

                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{stats.protocolsUsed}</div>
                  <div className="text-sm text-gray-400">Protocols Used</div>
                </div>

                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-400 mb-1">{stats.journalEntries}</div>
                  <div className="text-sm text-gray-400">Journal Entries</div>
                </div>

                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">{stats.productivity}%</div>
                  <div className="text-sm text-gray-400">Productivity</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Achievements</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      achievement.earned
                        ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-400/30'
                        : 'bg-gray-800/30 border-gray-600/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          achievement.earned ? 'text-yellow-300' : 'text-gray-400'
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                      </div>
                      {achievement.earned && (
                        <div className="text-yellow-400">
                          <Trophy className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Quick Settings */}
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

            {/* Recent Activity */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Recent Activity</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Completed "Design wireframes"</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Started focus session</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Added journal entry</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Used Deep Focus protocol</span>
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