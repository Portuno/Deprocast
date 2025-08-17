import React, { useState } from 'react';
import { Plus, Search, Calendar, Tag, Smile, Meh, Frown } from 'lucide-react';
import { JournalEntry, journalEntries } from '../data/mockData';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(journalEntries);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral' as JournalEntry['mood'],
    tags: ''
  });

  const moodIcons = {
    great: { icon: Smile, color: 'text-green-400', bg: 'bg-green-500/20' },
    good: { icon: Smile, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    neutral: { icon: Meh, color: 'text-gray-400', bg: 'bg-gray-500/20' },
    low: { icon: Frown, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    stressed: { icon: Frown, color: 'text-red-400', bg: 'bg-red-500/20' }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  const handleCreateEntry = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      date: new Date().toISOString().split('T')[0],
      tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '', mood: 'neutral', tags: '' });
    setShowCreateForm(false);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Journal</h1>
            <p className="text-gray-400">Capture your thoughts and track your journey</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>New Entry</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
              >
                <option value="all">All Moods</option>
                <option value="great">Great</option>
                <option value="good">Good</option>
                <option value="neutral">Neutral</option>
                <option value="low">Low</option>
                <option value="stressed">Stressed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Entry Form */}
        {showCreateForm && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">New Journal Entry</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Entry title..."
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
              />
              
              <textarea
                placeholder="What's on your mind?"
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
              />
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
                  <select
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value as JournalEntry['mood'] })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
                  >
                    <option value="great">Great</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="low">Low</option>
                    <option value="stressed">Stressed</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="work, personal, ideas..."
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateEntry}
                  disabled={!newEntry.title || !newEntry.content}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewEntry({ title: '', content: '', mood: 'neutral', tags: '' });
                  }}
                  className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const MoodIcon = moodIcons[entry.mood].icon;
            
            return (
              <div
                key={entry.id}
                className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6 hover:bg-gray-800/40 hover:border-gray-600/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${moodIcons[entry.mood].bg}`}>
                      <MoodIcon className={`w-5 h-5 ${moodIcons[entry.mood].color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed">{entry.content}</p>
                
                {entry.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No journal entries found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or create a new entry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;