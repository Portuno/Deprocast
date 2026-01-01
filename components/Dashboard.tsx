
import React, { useState } from 'react';
import { AppData, Project, ProjectState, UrgencyLevel, Task, VictoryNote, Atmosphere } from '../types';
import { decomposeProject } from '../services/gemini';
import FocusSessionModule from './FocusSession';

interface Props {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setFocusMode: (projectId: string | null) => void;
  focusMode: string | null;
  onFocusComplete: (session: any, note?: any) => void;
}

const Dashboard: React.FC<Props> = ({ data, setData, setFocusMode, focusMode, onFocusComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', vision: '', urgency: 'Medium' as UrgencyLevel, state: 'Idea' as ProjectState });

  const handleDecompose = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const result = await decomposeProject(form.name, form.vision, form.urgency, form.state, []);
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
        linkedContactIds: []
      };
      setData(prev => ({ ...prev, projects: [newProject, ...prev.projects] }));
      setShowModal(false);
      setForm({ name: '', vision: '', urgency: 'Medium', state: 'Idea' });
    } finally {
      setLoading(false);
    }
  };

  if (focusMode) {
    const project = data.projects.find(p => p.id === focusMode);
    return <FocusSessionModule project={project!} onComplete={onFocusComplete} onCancel={() => setFocusMode(null)} theme={data.currentUser?.theme || Atmosphere.SOVEREIGN} />;
  }

  const activeProjects = data.projects.filter(p => p.status === 'active');
  const allPendingTasks = activeProjects.flatMap(p => p.tasks.filter(t => !t.completed).map(t => ({ ...t, projectName: p.name, projectId: p.id })));

  return (
    <div className="flex flex-col gap-6 md:gap-10 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 pb-4 md:pb-8" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)' }}>THE GATEWAY</h1>
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] opacity-50">Operational Hub // Status: Ready</p>
        </div>
        <div className="hidden md:flex gap-4 mt-6 md:mt-0">
          <button 
            onClick={() => setShowModal(true)} 
            className="px-8 py-4 bg-accent text-bg font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all"
          >
            Initiate Objective
          </button>
        </div>
      </header>

      {activeProjects.length === 0 ? (
        <div className="h-[40vh] md:h-[50vh] flex flex-col items-center justify-center border-4 border-dashed opacity-50 text-center gap-6 md:gap-8 bg-surface/30" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-2 px-4">
            <span className="text-2xl md:text-4xl font-black uppercase tracking-widest italic">Matrix Void</span>
            <p className="max-w-md text-[10px] md:text-xs font-bold opacity-60 uppercase tracking-widest">No active operations detected.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="px-8 md:px-12 py-4 md:py-5 bg-accent text-bg font-black uppercase tracking-[0.4em] hover:shadow-[0_0_30px_var(--accent)] transition-all text-xs"
          >
            Deploy Objective
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Active Objectives */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] opacity-40">Active Objectives</h3>
              <button onClick={() => setShowModal(true)} className="text-[10px] font-black uppercase tracking-widest text-accent hover:opacity-100 opacity-60">+ New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {activeProjects.map(p => (
                <div key={p.id} className="relative p-6 md:p-8 border-4 bg-surface flex flex-col gap-4 group hover:border-accent transition-all overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between items-start z-10">
                    <span className="text-xl md:text-2xl font-black uppercase tracking-tight group-hover:text-accent transition-colors truncate pr-2">{p.name}</span>
                    <span className="text-[8px] font-black px-1.5 py-0.5 bg-black/5 uppercase border border-border/20 whitespace-nowrap">{p.urgencyThreshold}</span>
                  </div>
                  <p className="text-xs md:text-sm font-bold italic opacity-60 z-10 leading-relaxed">"{p.strategicVision.length > 80 ? p.strategicVision.substr(0, 80) + '...' : p.strategicVision}"</p>
                  
                  <div className="mt-2 md:mt-4 flex items-center justify-between z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] md:text-[8px] font-black opacity-30 uppercase tracking-widest">Progress</span>
                      <div className="w-24 md:w-32 h-1 bg-black/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent" 
                          style={{ width: `${(p.tasks.filter(t => t.completed).length / (p.tasks.length || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <button onClick={() => setFocusMode(p.id)} className="px-3 md:px-4 py-1.5 md:py-2 bg-accent/5 hover:bg-accent hover:text-bg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-accent/20 transition-all">Focus</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar Area: Tasks & Journal */}
          <aside className="lg:col-span-4 flex flex-col gap-8 md:gap-10">
            <section className="flex flex-col gap-6">
              <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] opacity-40">Tactical Queue</h3>
              <div className="flex flex-col gap-2 md:gap-3">
                {allPendingTasks.slice(0, 5).map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setFocusMode(t.projectId)}
                    className="p-4 md:p-5 border-2 bg-surface/40 flex items-center justify-between group hover:bg-surface hover:border-accent cursor-pointer transition-all shadow-sm" 
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex flex-col">
                      <span className="text-[7px] md:text-[8px] font-black uppercase opacity-30 tracking-widest mb-1">{t.projectName}</span>
                      <span className="text-xs md:text-sm font-bold uppercase tracking-wide group-hover:text-accent">{t.title}</span>
                    </div>
                    <span className="text-accent text-xs">▶</span>
                  </div>
                ))}
                {allPendingTasks.length === 0 && (
                  <div className="p-6 border-2 border-dashed text-center italic opacity-30 font-bold uppercase text-[9px] tracking-widest" style={{ borderColor: 'var(--border)' }}>
                    Queue Clear.
                  </div>
                )}
              </div>
            </section>

            <section className="p-6 md:p-8 border-4 bg-[#1a1a1a] text-white flex flex-col gap-4 shadow-xl" style={{ borderColor: '#D4AF37' }}>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black tracking-[0.4em] text-[#D4AF37] uppercase">Tactical Log</span>
                <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">THE JOURNAL</h4>
              </div>
              <p className="text-[9px] opacity-60 font-bold uppercase leading-relaxed tracking-wider">Document breakthrough data.</p>
              <button 
                onClick={() => { /* Transferred to mobile nav or sidebar */ }} 
                className="mt-2 py-3 border border-[#D4AF37] text-[#D4AF37] font-black text-[9px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                Open Archive
              </button>
            </section>
          </aside>
        </div>
      )}

      {/* Initiation Modal - MOBILE FRIENDLY */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border-t-8 md:border-[6px] p-6 md:p-12 flex flex-col gap-6 md:gap-10 shadow-[0_-20px_50px_rgba(0,0,0,1)] md:shadow-[0_0_100px_rgba(0,0,0,1)] relative max-h-[90vh] overflow-y-auto" style={{ borderColor: '#D4AF37' }}>
            
            <header className="text-center pt-4 md:pt-0">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[#D4AF37] italic" style={{ fontFamily: 'var(--font-display)' }}>Decompose Vision</h2>
              <p className="text-[9px] font-black tracking-[0.4em] text-white/40 mt-1 uppercase">Neural Matrix Sync</p>
            </header>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#D4AF37] tracking-[0.3em] uppercase">Objective Name</label>
                <input 
                  autoFocus
                  placeholder="e.g., OPERATION PHOENIX" 
                  className="w-full bg-white/5 border-2 border-[#D4AF37]/30 p-4 text-xl md:text-2xl font-black text-white outline-none focus:border-[#D4AF37] focus:bg-white/10 transition-all placeholder:opacity-20 uppercase" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#D4AF37] tracking-[0.3em] uppercase">Strategic Vision</label>
                <textarea 
                  placeholder="Define intent..." 
                  className="w-full bg-white/5 border-2 border-[#D4AF37]/30 p-4 h-32 md:h-44 text-sm md:text-lg font-bold text-white outline-none focus:border-[#D4AF37] focus:bg-white/10 resize-none transition-all placeholder:opacity-20 italic" 
                  value={form.vision} 
                  onChange={e => setForm({...form, vision: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-[#D4AF37] tracking-[0.3em] uppercase">Priority</label>
                  <select 
                    className="w-full bg-white/5 border-2 border-[#D4AF37]/30 p-3 font-black uppercase text-white outline-none focus:border-[#D4AF37]" 
                    value={form.urgency} 
                    onChange={e => setForm({...form, urgency: e.target.value as any})}
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map(u => <option key={u} value={u} className="bg-[#111]">{u}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-[#D4AF37] tracking-[0.3em] uppercase">Stage</label>
                  <select 
                    className="w-full bg-white/5 border-2 border-[#D4AF37]/30 p-3 font-black uppercase text-white outline-none focus:border-[#D4AF37]" 
                    value={form.state} 
                    onChange={e => setForm({...form, state: e.target.value as any})}
                  >
                    {['Idea', 'Planning', 'Execution', 'Ongoing'].map(s => <option key={s} value={s} className="bg-[#111]">{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-2 pb-6 md:pb-0">
              <button 
                onClick={() => setShowModal(false)} 
                className="w-full md:flex-1 py-4 border-2 border-white/20 text-white/40 font-black uppercase tracking-[0.2em] transition-all text-[10px]"
              >
                Abort
              </button>
              <button 
                onClick={handleDecompose} 
                disabled={loading || !form.name} 
                className="w-full md:flex-[2] py-4 bg-[#D4AF37] text-black font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-30 text-[10px]"
              >
                {loading ? 'ANALYZING...' : 'Initialize Matrix'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
