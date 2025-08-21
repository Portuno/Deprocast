import React, { useState } from 'react';
import { Plus, Search, Calendar, Tag, Smile, Meh, Frown } from 'lucide-react';
import { JournalEntry } from '../data/mockData';
import { listJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../integrations/supabase/journal';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral' as JournalEntry['mood'],
    tags: '',
    energy: 5,
    focus: 5,
    emotions: '' as string,
    summary: '',
    keyType: 'win' as 'win' | 'loss',
    keyText: '',
    keyTimeOfDay: '',
    keyTrigger: ''
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

  const handleCreateEntry = async () => {
    const payload: any = {
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      energy: newEntry.energy,
      focus: newEntry.focus,
      emotions: newEntry.emotions.split(',').map(e => e.trim()).filter(Boolean),
      summary: newEntry.summary,
      key_event: {
        type: newEntry.keyType,
        text: newEntry.keyText,
        timeOfDay: newEntry.keyTimeOfDay || undefined,
        trigger: newEntry.keyTrigger || undefined,
      },
    };

    // Only include tags if user provided at least one to stay compatible before DB migration is applied
    const inputTags = newEntry.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (inputTags.length > 0) {
      payload.tags = inputTags;
    }

    const created = await createJournalEntry(payload);
    const normalized: JournalEntry = {
      id: created.id,
      title: created.title,
      content: created.content,
      mood: created.mood,
      date: created.entry_date,
      tags: created.tags ?? [],
      energy: created.energy ?? undefined,
      focus: created.focus ?? undefined,
      emotions: created.emotions ?? undefined,
      summary: created.summary ?? undefined,
      keyEvent: created.key_event ?? undefined,
    };
    setEntries([normalized, ...entries]);
    setNewEntry({ title: '', content: '', mood: 'neutral', tags: '', energy: 5, focus: 5, emotions: '', summary: '', keyType: 'win', keyText: '', keyTimeOfDay: '', keyTrigger: '' });
    setShowCreateForm(false);
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags.join(', '),
      energy: entry.energy ?? 5,
      focus: entry.focus ?? 5,
      emotions: (entry.emotions ?? []).join(', '),
      summary: entry.summary ?? '',
      keyType: entry.keyEvent?.type ?? 'win',
      keyText: entry.keyEvent?.text ?? '',
      keyTimeOfDay: entry.keyEvent?.timeOfDay ?? '',
      keyTrigger: entry.keyEvent?.trigger ?? '',
    });
    setShowCreateForm(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const payload: any = {
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      energy: newEntry.energy,
      focus: newEntry.focus,
      emotions: newEntry.emotions.split(',').map(e => e.trim()).filter(Boolean),
      summary: newEntry.summary,
      key_event: {
        type: newEntry.keyType,
        text: newEntry.keyText,
        timeOfDay: newEntry.keyTimeOfDay || undefined,
        trigger: newEntry.keyTrigger || undefined,
      },
    };
    const inputTags = newEntry.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (inputTags.length > 0) payload.tags = inputTags;

    const updated = await updateJournalEntry(editingId, payload);
    setEntries(entries.map(e => e.id === editingId ? {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      mood: updated.mood,
      date: updated.entry_date,
      tags: updated.tags ?? [],
      energy: updated.energy ?? undefined,
      focus: updated.focus ?? undefined,
      emotions: updated.emotions ?? undefined,
      summary: updated.summary ?? undefined,
      keyEvent: updated.key_event ?? undefined,
    } : e));

    setEditingId(null);
    setShowCreateForm(false);
    setNewEntry({ title: '', content: '', mood: 'neutral', tags: '', energy: 5, focus: 5, emotions: '', summary: '', keyType: 'win', keyText: '', keyTimeOfDay: '', keyTrigger: '' });
  };

  const handleRequestDelete = (id: string) => setConfirmDeleteId(id);
  const handleCancelDelete = () => setConfirmDeleteId(null);
  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteJournalEntry(confirmDeleteId);
    setEntries(entries.filter(e => e.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  React.useEffect(() => {
    (async () => {
      const data = await listJournalEntries().catch(() => []);
      const normalized: JournalEntry[] = data.map(d => ({
        id: d.id,
        title: d.title,
        content: d.content,
        mood: d.mood,
        date: d.entry_date,
        tags: d.tags ?? [],
        energy: d.energy ?? undefined,
        focus: d.focus ?? undefined,
        emotions: d.emotions ?? undefined,
        summary: d.summary ?? undefined,
        keyEvent: d.key_event ?? undefined,
      }));
      setEntries(normalized);
    })();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Journal</h1>
            <p className="text-gray-400 text-sm md:text-base">Capture your thoughts and track your journey</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center space-x-2 px-4 md:px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5 active:scale-95 text-sm md:text-base w-full md:w-auto"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>New Entry</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full md:w-auto px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base"
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
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">{editingId ? 'Edit Journal Entry' : 'New Journal Entry'}</h3>
            <div className="space-y-3 md:space-y-4">
              {/* Quick Check-in */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Energy (1-10)</label>
                  <input type="number" min={1} max={10} value={newEntry.energy}
                    onChange={(e) => setNewEntry({ ...newEntry, energy: Number(e.target.value) })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Focus (1-10)</label>
                  <input type="number" min={1} max={10} value={newEntry.focus}
                    onChange={(e) => setNewEntry({ ...newEntry, focus: Number(e.target.value) })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Emotions (comma separated)</label>
                  <input type="text" placeholder="Motivated, Calm" value={newEntry.emotions}
                    onChange={(e) => setNewEntry({ ...newEntry, emotions: e.target.value })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base" />
                </div>
              </div>
              <input
                type="text"
                placeholder="Entry title..."
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base"
              />
              
              <textarea
                placeholder="What's on your mind?"
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                rows={5}
                className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base"
              />

              {/* Day's Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Day's Summary (1-2 sentences)</label>
                <textarea rows={3} placeholder="Main tasks, a win and a challenge…" value={newEntry.summary}
                  onChange={(e) => setNewEntry({ ...newEntry, summary: e.target.value })}
                  className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base" />
              </div>

              {/* Key Event */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Event Type</label>
                  <select value={newEntry.keyType}
                    onChange={(e) => setNewEntry({ ...newEntry, keyType: e.target.value as 'win' | 'loss' })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base">
                    <option value="win">Win</option>
                    <option value="loss">Obstacle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time of Day (optional)</label>
                  <select value={newEntry.keyTimeOfDay}
                    onChange={(e) => setNewEntry({ ...newEntry, keyTimeOfDay: e.target.value })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base">
                    <option value="">—</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trigger (optional)</label>
                  <input type="text" placeholder="e.g., Opened Twitter, Uncertain next step" value={newEntry.keyTrigger}
                    onChange={(e) => setNewEntry({ ...newEntry, keyTrigger: e.target.value })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Event Description</label>
                  <textarea rows={3} placeholder="Describe the moment in detail…" value={newEntry.keyText}
                    onChange={(e) => setNewEntry({ ...newEntry, keyText: e.target.value })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base" />
                </div>
              </div>

              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setNewEntry({ ...newEntry, summary: 'Today I focused on … The biggest win/obstacle was …', keyText: 'I noticed that … Right before it, I … It helped/hurt because …' })}
                  className="px-2 md:px-3 py-1 text-xs rounded bg-gray-800/60 border border-gray-700/40 text-gray-300 hover:bg-gray-700/60">Insert prompt</button>
                <button type="button" onClick={() => setNewEntry({ ...newEntry, keyType: 'win', keyText: 'A micro-win: … What conditions made it easy: … (time, music, task size)', keyTimeOfDay: 'morning' })}
                  className="px-2 md:px-3 py-1 text-xs rounded bg-gray-800/60 border border-gray-700/40 text-gray-300 hover:bg-gray-700/60">Win prompt</button>
                <button type="button" onClick={() => setNewEntry({ ...newEntry, keyType: 'loss', keyText: 'A stuck moment: … Just before it I … Trigger: … Next time I will …' })}
                  className="px-2 md:px-3 py-1 text-xs rounded bg-gray-800/60 border border-gray-700/40 text-gray-300 hover:bg-gray-700/60">Obstacle prompt</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
                  <select
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value as JournalEntry['mood'] })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="great">Great</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="low">Low</option>
                    <option value="stressed">Stressed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="work, personal, ideas..."
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                    className="w-full px-3 md:px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {editingId ? (
                  <button
                    onClick={handleSaveEdit}
                    disabled={!newEntry.title || !newEntry.content}
                    className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={handleCreateEntry}
                    disabled={!newEntry.title || !newEntry.content}
                    className="px-4 md:px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    Save Entry
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingId(null);
                    setNewEntry({ title: '', content: '', mood: 'neutral', tags: '', energy: 5, focus: 5, emotions: '', summary: '', keyType: 'win', keyText: '', keyTimeOfDay: '', keyTrigger: '' });
                  }}
                  className="px-4 md:px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-all duration-200 text-sm md:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-3 md:space-y-4">
          {filteredEntries.map((entry) => {
            const MoodIcon = moodIcons[entry.mood].icon;
            
            return (
              <div
                key={entry.id}
                className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4 md:p-6 hover:bg-gray-800/40 hover:border-gray-600/40 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 md:mb-4 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${moodIcons[entry.mood].bg}`}>
                      <MoodIcon className={`w-4 h-4 md:w-5 md:h-5 ${moodIcons[entry.mood].color}`} />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-white">{entry.title}</h3>
                      <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-400">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(entry)}
                      className="px-2 md:px-3 py-1 text-xs rounded bg-gray-800/60 border border-gray-700/40 text-gray-300 hover:bg-gray-700/60"
                      aria-label="Edit entry"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRequestDelete(entry.id)}
                      className="px-2 md:px-3 py-1 text-xs rounded bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30"
                      aria-label="Delete entry"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Quick metrics */}
                {(entry.energy || entry.focus || (entry.emotions && entry.emotions.length)) && (
                  <div className="flex flex-wrap gap-2 md:gap-3 text-xs text-gray-300 mb-3">
                    {typeof entry.energy === 'number' && (
                      <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700/40">Energy {entry.energy}/10</span>
                    )}
                    {typeof entry.focus === 'number' && (
                      <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700/40">Focus {entry.focus}/10</span>
                    )}
                    {entry.emotions && entry.emotions.length > 0 && (
                      <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700/40">{entry.emotions.join(', ')}</span>
                    )}
                  </div>
                )}

                {entry.summary && (
                  <p className="text-gray-300 mb-2 leading-relaxed text-sm md:text-base"><span className="text-gray-400">Summary:</span> {entry.summary}</p>
                )}
                <p className="text-gray-300 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">{entry.content}</p>

                {entry.keyEvent && (
                  <div className="mb-3 md:mb-4 text-gray-300">
                    <p className="text-xs md:text-sm text-gray-400 mb-1">Key Event ({entry.keyEvent.type === 'win' ? 'Win' : 'Obstacle'})</p>
                    <p className="leading-relaxed text-sm md:text-base">{entry.keyEvent.text}</p>
                  </div>
                )}
                
                {entry.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Tag className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
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
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-400 text-base md:text-lg">No journal entries found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or create a new entry</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-4 md:p-6 w-full max-w-md">
            <h4 className="text-white font-semibold mb-2">Delete entry?</h4>
            <p className="text-gray-300 mb-4 text-sm md:text-base">This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-3 md:px-4 py-2 rounded bg-gray-700/60 text-gray-200 hover:bg-gray-600/60 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 md:px-4 py-2 rounded bg-red-600/80 text-white hover:bg-red-600 text-sm md:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;