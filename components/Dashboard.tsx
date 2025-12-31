
import React, { useState, useEffect } from 'react';
import { AppData, Project, ProjectState, UrgencyLevel, Contact, FocusSession, Atmosphere, Task, VictoryNote } from '../types';
import { decomposeProject } from '../services/gemini';
import FocusSessionModule from './FocusSession';

interface Props {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setFocusMode: (projectId: string | null) => void;
  focusMode: string | null;
  onFocusComplete: (session: FocusSession, note?: VictoryNote) => void;
}

const Dashboard: React.FC<Props> = ({ data, setData, setFocusMode, focusMode, onFocusComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showInitiationModal, setShowInitiationModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    vision: '',
    urgency: 'Medium' as UrgencyLevel,
    state: 'Idea' as ProjectState,
    selectedStakeholders: [] as string[]
  });

  const handleDecompose = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const stakeholderNames = form.selectedStakeholders.map(id => 
        data.contacts.find(c => c.id === id)?.name || ''
      );
      
      const result = await decomposeProject(
        form.name, 
        form.vision, 
        form.urgency, 
        form.state, 
        stakeholderNames
      );
      
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        userId: data.currentUser?.id || '',
        name: form.name,
        strategicVision: form.vision,
        resistance: result.resistance || 5,
        complexity: result.complexity || 5,
        urgencyThreshold: form.urgency,
        functionalState: form.state,
        tasks: result.tasks || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        linkedContactIds: form.selectedStakeholders
      };

      setData(prev => ({
        ...prev,
        projects: [newProject, ...prev.projects]
      }));

      setShowInitiationModal(false);
      setForm({ name: '', vision: '', urgency: 'Medium', state: 'Idea', selectedStakeholders: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (focusMode) {
    const project = data.projects.find(p => p.id === focusMode);
    return (
      <FocusSessionModule 
        project={project!} 
        onComplete={onFocusComplete} 
        onCancel={() => setFocusMode(null)} 
        theme={data.currentUser?.theme || Atmosphere.SOVEREIGN}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in h-full overflow-hidden">
      {/* HEADER: COMMAND CENTER */}
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)' }}>THE GATEWAY</h1>
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-accent"></span>
            <p className="opacity-70 text-[11px] font-black uppercase tracking-[0.4em]">Contextual Command Center // Tier: {data.stats.rank}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setShowInitiationModal(true)}
            className="px-8 py-4 border-2 border-accent text-accent font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-bg transition-all"
          >
            New Initiation Protocol
          </button>
        </div>
      </header>

      {/* INITIATION MODAL */}
      {showInitiationModal && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface border-4 p-10 flex flex-col gap-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
            <header className="border-b-2 pb-4 flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Brain Dump Protocol</h2>
              <button onClick={() => setShowInitiationModal(false)} className="text-xs font-black opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest">CLOSE [ESC]</button>
            </header>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase opacity-60 tracking-widest">Objective Name</label>
                <input 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="bg-transparent border-2 p-4 text-xl font-bold focus:border-accent outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="e.g., OPERATION PHOENIX"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase opacity-60 tracking-widest">Strategic Vision</label>
                <textarea 
                  value={form.vision}
                  onChange={e => setForm({...form, vision: e.target.value})}
                  className="bg-transparent border-2 p-4 h-32 text-base font-medium focus:border-accent outline-none resize-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="Define the long-term impact and core objectives..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase opacity-60 tracking-widest">Urgency Threshold</label>
                  <select 
                    value={form.urgency}
                    onChange={e => setForm({...form, urgency: e.target.value as UrgencyLevel})}
                    className="bg-transparent border-2 p-3 font-bold uppercase text-sm outline-none cursor-pointer"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map(u => <option key={u} value={u} className="bg-surface text-text">{u.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase opacity-60 tracking-widest">Functional State</label>
                  <select 
                    value={form.state}
                    onChange={e => setForm({...form, state: e.target.value as ProjectState})}
                    className="bg-transparent border-2 p-3 font-bold uppercase text-sm outline-none cursor-pointer"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {['Idea', 'Planning', 'Execution', 'Ongoing'].map(s => <option key={s} value={s} className="bg-surface text-text">{s.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase opacity-60 tracking-widest">Stakeholder Mapping</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-4 border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                  {data.contacts.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setForm(f => ({
                        ...f, 
                        selectedStakeholders: f.selectedStakeholders.includes(c.id) 
                          ? f.selectedStakeholders.filter(s => s !== c.id) 
                          : [...f.selectedStakeholders, c.id]
                      }))}
                      className={`px-4 py-2 text-[10px] font-black uppercase border-2 transition-all ${form.selectedStakeholders.includes(c.id) ? 'bg-accent text-bg border-accent' : 'border-border opacity-40 hover:opacity-100'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                  {data.contacts.length === 0 && <span className="text-[10px] opacity-40 italic uppercase">No contacts available.</span>}
                </div>
              </div>
            </div>

            <button 
              onClick={handleDecompose}
              disabled={loading || !form.name}
              className="py-5 bg-accent text-bg font-black text-sm uppercase tracking-[0.4em] shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? 'ANALYZING MATRIX...' : 'DECOMPOSE OBJECTIVE'}
            </button>
          </div>
        </div>
      )}

      {/* SUMMARY DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0 overflow-hidden">
        {/* STATS */}
        <div className="flex flex-col gap-8">
          <div className="p-10 border-4 bg-surface flex flex-col items-center justify-center gap-2" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
            <span className="text-[11px] font-black tracking-[0.5em] opacity-50 uppercase">Operative Tier</span>
            <span className="text-5xl font-black uppercase tracking-tighter text-accent">{data.stats.rank}</span>
            <div className="w-full h-1.5 bg-black/10 mt-6 overflow-hidden rounded-full">
              <div className="h-full bg-accent transition-all duration-700" style={{ width: `${(data.stats.xp % 1000) / 10}%` }}></div>
            </div>
            <span className="text-[10px] font-black opacity-70 mt-3 uppercase tracking-widest">XP ARCHIVE: {data.stats.xp}</span>
          </div>

          <div className="flex-1 p-8 border-4 bg-surface flex flex-col gap-6 overflow-hidden" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] border-b-2 pb-3" style={{ borderColor: 'var(--border)' }}>Operational Queue</h3>
            <div className="flex flex-col gap-5 overflow-y-auto pr-2">
              {data.projects.filter(p => p.status === 'active').map(p => (
                <div key={p.id} className="flex flex-col gap-1 border-l-4 pl-4 border-accent/20 hover:border-accent transition-all group">
                  <span className="text-sm font-black uppercase tracking-wide group-hover:text-accent transition-colors">{p.name}</span>
                  <div className="flex justify-between items-center text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                    <span>{p.urgencyThreshold} Priority</span>
                    <span className="opacity-40">{p.functionalState}</span>
                  </div>
                </div>
              ))}
              {data.projects.length === 0 && <span className="text-[11px] opacity-40 italic uppercase tracking-widest">No targets identified.</span>}
            </div>
          </div>
        </div>

        {/* RECENT RECORDS */}
        <div className="md:col-span-2 flex flex-col gap-8 overflow-hidden">
          <div className="flex-1 p-8 border-4 bg-surface flex flex-col gap-6 overflow-hidden" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] border-b-2 pb-3" style={{ borderColor: 'var(--border)' }}>Intelligence Stream</h3>
            <div className="flex flex-col gap-8 overflow-y-auto pr-2">
              {data.notes.slice(0, 5).map(note => (
                <div key={note.id} className="flex flex-col gap-3 p-5 bg-black/5 border-l-4 hover:bg-black/[0.08] transition-colors" style={{ borderColor: 'var(--accent)' }}>
                  <div className="flex justify-between text-[10px] font-black opacity-50 uppercase tracking-widest">
                    <span>{new Date(note.date).toLocaleDateString()}</span>
                    <span>LOG_{note.id.substr(0, 6)}</span>
                  </div>
                  <p className="text-base italic font-bold leading-relaxed">"{note.content}"</p>
                  {note.aiInsights && <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mt-2 border-t border-accent/10 pt-2">{note.aiInsights.split('.')[0]}...</div>}
                </div>
              ))}
              {data.notes.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                <span className="text-sm font-black uppercase tracking-[0.3em]">Waiting for Victory Logs</span>
                <div className="h-[2px] w-12 bg-accent opacity-20"></div>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
