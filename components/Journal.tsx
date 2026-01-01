
import React, { useState } from 'react';
import { AppData, VictoryNote } from '../types';

interface Props {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}

const Journal: React.FC<Props> = ({ data, setData }) => {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const saveEntry = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const newNote: VictoryNote = {
      id: Math.random().toString(36).substr(2, 9),
      userId: data.currentUser?.id || '',
      content: content,
      date: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
    setContent('');
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in h-full overflow-hidden">
      <header className="border-b-4 pb-6" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-6xl font-black tracking-tighter uppercase italic" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)' }}>THE JOURNAL</h1>
        <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.5em]">Operational Breakthroughs & Insights Archive</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 flex-1 min-h-0">
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex-1 flex flex-col border-4 bg-surface p-8 gap-6 shadow-inner" style={{ borderColor: 'var(--border)' }}>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Document the latest synchronization results, operational friction, or strategic breakthroughs..."
              className="flex-1 bg-transparent text-2xl font-bold italic outline-none resize-none leading-relaxed placeholder:opacity-20"
            />
            <button 
              onClick={saveEntry}
              disabled={saving || !content.trim()}
              className="py-5 bg-accent text-bg font-black text-sm uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {saving ? 'ENCRYPTING RECORD...' : 'SECURE ENTRY'}
            </button>
          </div>
        </section>

        <aside className="flex flex-col gap-6 overflow-hidden">
          <h3 className="text-[12px] font-black uppercase tracking-[0.6em] opacity-40 border-b-2 pb-2" style={{ borderColor: 'var(--border)' }}>Past Logs</h3>
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
            {data.notes.map(note => (
              <div key={note.id} className="p-6 border-2 bg-surface/40 hover:bg-surface transition-all group" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between items-center mb-3 text-[9px] font-black opacity-30 uppercase tracking-widest">
                  <span>{new Date(note.date).toLocaleDateString()} // {new Date(note.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-base font-bold italic leading-relaxed">"{note.content}"</p>
                {note.performancePattern && (
                  <div className="mt-4 pt-4 border-t border-border/10 text-[9px] font-black uppercase tracking-widest opacity-40">
                    PATTERN: {note.performancePattern}
                  </div>
                )}
              </div>
            ))}
            {data.notes.length === 0 && (
              <div className="h-40 flex items-center justify-center italic opacity-20 font-bold uppercase text-xs border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                Archive Empty
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Journal;
