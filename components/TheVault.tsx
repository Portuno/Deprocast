
import React, { useState, useEffect } from 'react';
import { AppData, Contact, VictoryNote, Relation } from '../types';
import { analyzeVictoryArchive } from '../services/gemini';

interface Props {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}

const TheVault: React.FC<Props> = ({ data, setData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'contacts' | 'notes' | 'mapping'>('contacts');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [archiveAnalysis, setArchiveAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [form, setForm] = useState<Partial<Contact>>({
    name: '', role: '', company: '', email: '', phone: '', website: ''
  });

  const selectedContact = data.contacts.find(c => c.id === selectedContactId);

  const runArchiveAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeVictoryArchive(data.notes);
    setArchiveAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const saveContact = () => {
    if (!form.name) return;
    const isNew = !selectedContactId;
    const newContact: Contact = {
      id: selectedContactId || Math.random().toString(36).substr(2, 9),
      userId: data.currentUser?.id || '',
      name: form.name || 'Unknown',
      role: form.role || 'Unassigned',
      company: form.company,
      email: form.email,
      phone: form.phone,
      website: form.website,
      linkedProjectIds: selectedContact?.linkedProjectIds || [],
      relations: selectedContact?.relations || []
    };

    setData(prev => ({
      ...prev,
      contacts: isNew ? [...prev.contacts, newContact] : prev.contacts.map(c => c.id === selectedContactId ? newContact : c)
    }));
    
    setForm({ name: '', role: '', company: '', email: '', phone: '', website: '' });
    setSelectedContactId(null);
  };

  const startEdit = (c: Contact) => {
    setSelectedContactId(c.id);
    setForm(c);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in h-full overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b-2 pb-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)' }}>THE VAULT</h1>
          <p className="opacity-40 text-[9px] font-black uppercase tracking-[0.5em]">Relational Intelligence & Victory Archives</p>
        </div>
        <div className="flex gap-6">
          {['contacts', 'notes', 'mapping'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveSubTab(tab as any)} 
              className={`text-[11px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'text-accent opacity-100' : 'opacity-30 hover:opacity-100'}`}
            >
              {tab === 'notes' ? 'RECORDS' : tab.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {activeSubTab === 'contacts' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden min-h-0">
          <aside className="lg:col-span-1 border-r-2 pr-6 flex flex-col gap-4 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
            <button 
              onClick={() => { setSelectedContactId(null); setForm({name:'', role:'', company:'', email:'', phone:'', website:''}); }}
              className="w-full py-4 bg-accent text-bg font-black text-[10px] tracking-[0.2em] uppercase transition-all"
            >
              DEPLOY NEW ASSET
            </button>
            <div className="flex flex-col gap-3">
              {data.contacts.map(c => (
                <div key={c.id} onClick={() => startEdit(c)} className={`p-4 border-2 transition-all cursor-pointer ${selectedContactId === c.id ? 'border-accent bg-accent/5' : 'border-border/30 opacity-60 hover:opacity-100'}`}>
                  <div className="text-xs font-black uppercase truncate">{c.name}</div>
                  <div className="text-[9px] font-bold opacity-40 uppercase truncate">{c.role} @ {c.company || 'Unknown Entity'}</div>
                </div>
              ))}
            </div>
          </aside>

          <section className="lg:col-span-3 flex flex-col gap-8 overflow-y-auto p-8 border-4 bg-surface" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
            <h2 className="text-2xl font-black uppercase tracking-widest border-b-2 pb-2" style={{ borderColor: 'var(--border)' }}>Advanced Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Asset Name', key: 'name' },
                { label: 'Strategic Role', key: 'role' },
                { label: 'Affiliated Company', key: 'company' },
                { label: 'Intelligence Email', key: 'email' },
                { label: 'Comms Phone', key: 'phone' },
                { label: 'Primary Domain', key: 'website' }
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase opacity-40">{f.label}</label>
                  <input 
                    value={(form as any)[f.key] || ''} 
                    onChange={e => setForm({...form, [f.key]: e.target.value})} 
                    className="bg-transparent border-2 p-3 text-xs font-bold focus:border-accent outline-none" 
                    style={{ borderColor: 'var(--border)' }} 
                  />
                </div>
              ))}
            </div>

            {selectedContact && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-black/5 border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest border-b pb-1" style={{ borderColor: 'var(--border)' }}>Relational Network</h3>
                  <div className="flex flex-col gap-2">
                    {selectedContact.relations.map((rel, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase">
                        <span>{data.contacts.find(c => c.id === rel.targetContactId)?.name}</span>
                        <span className="opacity-40">[{rel.nature}]</span>
                      </div>
                    ))}
                    {selectedContact.relations.length === 0 && <span className="text-[9px] opacity-40 italic">Isolated Asset.</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest border-b pb-1" style={{ borderColor: 'var(--border)' }}>Operational Mapping</h3>
                  <div className="flex flex-col gap-2">
                    {data.projects.filter(p => p.linkedContactIds.includes(selectedContact.id)).map(p => (
                      <div key={p.id} className="text-[10px] font-black uppercase">{p.name}</div>
                    ))}
                    {data.projects.filter(p => p.linkedContactIds.includes(selectedContact.id)).length === 0 && <span className="text-[9px] opacity-40 italic">No project links.</span>}
                  </div>
                </div>
              </div>
            )}

            <button onClick={saveContact} className="py-4 bg-accent text-bg font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.01] transition-all">
              {selectedContactId ? 'Synchronize Asset Parameters' : 'Deploy Asset to Archive'}
            </button>
          </section>
        </div>
      )}

      {activeSubTab === 'notes' && (
        <div className="flex flex-col gap-8 flex-1 overflow-hidden min-h-0">
          <header className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-widest">Victory Records Archive</h3>
            <button 
              onClick={runArchiveAnalysis} 
              disabled={isAnalyzing}
              className="px-6 py-2 border-2 border-accent text-accent font-black text-[10px] uppercase hover:bg-accent hover:text-bg transition-all"
            >
              {isAnalyzing ? 'SYNTHESIZING...' : 'ANALYZE PERFORMANCE PATTERNS'}
            </button>
          </header>

          {archiveAnalysis && (
            <div className="p-8 bg-accent/5 border-4 border-dashed animate-fade-in" style={{ borderColor: 'var(--accent)' }}>
              <div className="text-sm font-bold italic leading-relaxed whitespace-pre-wrap">"{archiveAnalysis}"</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 pr-2">
            {data.notes.map(note => (
              <div key={note.id} className="p-6 border-2 bg-surface flex flex-col gap-4" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                <div className="flex justify-between text-[9px] font-black opacity-30 uppercase">
                  <span>RECORD_{note.id.substr(0, 6)}</span>
                  <span>{new Date(note.date).toLocaleString()}</span>
                </div>
                <p className="text-lg font-bold italic">"{note.content}"</p>
                {note.aiInsights && (
                  <div className="p-4 border-l-4 border-accent bg-accent/5 text-[10px] font-black leading-relaxed uppercase">
                    Insight: {note.aiInsights.split('.')[0]}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TheVault;
