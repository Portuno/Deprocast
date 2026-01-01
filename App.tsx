
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Atmosphere, AppData, Project, Contact, VictoryNote, CalendarEvent, FocusSession, User, Task } from './types';
import { THEMES, RANKS } from './constants';
import { db } from './services/db';
import { isCloudEnabled } from './services/supabase';
import { suggestNextTask } from './services/gemini';
import Dashboard from './components/Dashboard';
import NeuralMatrix from './components/NeuralMatrix';
import Chronos from './components/Chronos';
import TheVault from './components/TheVault';
import Profile from './components/Profile';
import Journal from './components/Journal';

const SESSION_KEY = 'deprocast_active_session';
const DEFAULT_USER_ID = 'local-operative-id';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'matrix' | 'journal' | 'chronos' | 'vault' | 'profile'>('dashboard');
  const [focusMode, setFocusMode] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'LOCAL' | 'CLOUD' | 'SYNCING'>('LOCAL');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<VictoryNote[]>([]);
  const [focusHistory, setFocusHistory] = useState<FocusSession[]>([]);

  const [protocolSuggestion, setProtocolSuggestion] = useState<{projectId: string, task: Task} | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleLogin = useCallback(async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, user.id);
    const cloudAvailable = isCloudEnabled();
    setSyncStatus(cloudAvailable ? 'SYNCING' : 'LOCAL');
    
    const [allProjects, allContacts, allEvents, allNotes, allFocus] = await Promise.all([
      db.getAll<Project>('projects', user.id),
      db.getAll<Contact>('contacts', user.id),
      db.getAll<CalendarEvent>('events', user.id),
      db.getAll<VictoryNote>('notes', user.id),
      db.getAll<FocusSession>('focusSessions', user.id)
    ]);

    setProjects(allProjects);
    setContacts(allContacts);
    setEvents(allEvents);
    setNotes(allNotes);
    setFocusHistory(allFocus);
    
    if (cloudAvailable) setSyncStatus('CLOUD');
  }, []);

  useEffect(() => {
    const boot = async () => {
      await db.init();
      const users = await db.getAll<User>('users');
      let user = users.find(u => u.id === DEFAULT_USER_ID);
      
      if (!user) {
        user = {
          id: DEFAULT_USER_ID,
          email: 'local@deprocast.os',
          username: 'LOCAL_OPERATIVE',
          theme: Atmosphere.SOVEREIGN,
          createdAt: new Date().toISOString(),
          stats: { xp: 0, level: 1, rank: 'OPERATIVE', bio: 'Direct hardware access.' }
        };
        await db.save('users', user);
      }
      handleLogin(user);
    };
    boot();
  }, [handleLogin]);

  const handleActivateProtocol = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    const suggestion = await suggestNextTask(projects);
    setProtocolSuggestion(suggestion);
    setIsSuggesting(false);
  };

  const currentTheme = useMemo(() => {
    if (!currentUser) return THEMES[Atmosphere.SOVEREIGN];
    return THEMES[currentUser.theme];
  }, [currentUser]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', currentTheme.bg);
    root.style.setProperty('--surface', currentTheme.surface);
    root.style.setProperty('--accent', currentTheme.accent);
    root.style.setProperty('--text', currentTheme.text);
    root.style.setProperty('--border', currentTheme.border);
    root.style.setProperty('--font-main', currentTheme.fontMain);
    root.style.setProperty('--font-display', currentTheme.fontDisplay);
    root.style.setProperty('--radius', currentTheme.radius);
    root.style.setProperty('--text-glow', currentTheme.textGlow || 'none');
  }, [currentTheme]);

  const addXP = useCallback(async (amount: number) => {
    if (!currentUser) return;
    const newXP = currentUser.stats.xp + amount;
    let newRank = currentUser.stats.rank;
    for (const r of [...RANKS].reverse()) {
      if (newXP >= r.minXp) { newRank = r.title; break; }
    }
    const updatedUser = { ...currentUser, stats: { ...currentUser.stats, xp: newXP, rank: newRank } };
    setCurrentUser(updatedUser);
    await db.save('users', updatedUser);
  }, [currentUser]);

  const appDataState: AppData = {
    currentUser, projects, contacts, events, focusHistory, notes,
    stats: currentUser?.stats || { xp: 0, level: 1, rank: 'OPERATIVE' }
  };

  if (!currentUser) return <div className="h-screen bg-black" />;

  const NavItems = () => (
    <>
      {['dashboard', 'matrix', 'journal', 'chronos', 'vault', 'profile'].map(tab => (
        <button 
          key={tab}
          onClick={() => setActiveTab(tab as any)}
          className={`px-3 md:px-5 py-3 md:py-4 text-[10px] md:text-sm text-center md:text-left border-2 transition-all truncate tracking-widest ${activeTab === tab ? 'opacity-100 md:scale-[1.05] shadow-xl' : 'opacity-40 hover:opacity-100'}`}
          style={{ 
            borderColor: activeTab === tab ? 'var(--accent)' : 'transparent',
            backgroundColor: activeTab === tab ? 'var(--surface)' : 'transparent',
            color: activeTab === tab ? 'var(--accent)' : 'var(--text)',
            textShadow: activeTab === tab ? 'var(--text-glow)' : 'none'
          }}
        >
          <span className="md:hidden">
            {tab === 'dashboard' ? '🏠' : tab === 'matrix' ? '🧠' : tab === 'journal' ? '📓' : tab === 'chronos' ? '⏳' : tab === 'vault' ? '🔒' : '👤'}
          </span>
          <span className="hidden md:inline">
            {tab === 'matrix' ? 'NEURAL MATRIX' : tab === 'vault' ? 'THE VAULT' : tab.toUpperCase()}
          </span>
        </button>
      ))}
    </>
  );

  return (
    <div className={`h-screen flex flex-col md:flex-row relative overflow-hidden ${currentTheme.flicker ? 'crt-flicker' : ''}`}>
      {currentTheme.showScanlines && <div className="scanline" />}
      
      {protocolSuggestion && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface border-4 p-8 md:p-12 flex flex-col gap-8 shadow-[0_0_100px_rgba(212,175,55,0.2)]" style={{ borderColor: 'var(--accent)' }}>
            <div className="flex flex-col gap-3 text-center">
              <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase">Strategic Recommendation</span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{protocolSuggestion.task.title}</h2>
              <p className="opacity-70 text-xs md:text-sm font-bold uppercase tracking-wider">Target Objective: {projects.find(p => p.id === protocolSuggestion.projectId)?.name}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <button onClick={() => setProtocolSuggestion(null)} className="flex-1 py-4 border-2 border-accent text-accent font-black text-xs uppercase tracking-widest hover:bg-accent/5">Dismiss</button>
              <button onClick={() => { setFocusMode(protocolSuggestion.projectId); setProtocolSuggestion(null); }} className="flex-1 py-4 bg-accent text-bg font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Initiate Execution</button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      {!focusMode && (
        <nav className="hidden md:flex w-80 border-r p-6 flex-col gap-6 sticky top-0 bg-opacity-95 backdrop-blur-md z-50 shrink-0 shadow-2xl" 
             style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
          <div className="flex flex-col gap-2 items-center mb-4">
            <div className="text-3xl font-black tracking-[0.2em] text-center" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)', color: 'var(--accent)' }}>
              DEPROCAST
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm font-bold flex-1">
            <NavItems />
            <div className="mt-8 px-2">
              <button 
                onClick={handleActivateProtocol}
                disabled={isSuggesting}
                className="w-full group relative py-8 bg-[#2A0202] border-4 border-[#D4AF37] text-[#D4AF37] font-black text-[14px] uppercase tracking-[0.5em] shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:shadow-[0_0_60px_rgba(212,175,55,0.4)] hover:scale-[1.03] active:scale-95 transition-all animate-protocol-pulse disabled:opacity-50 flex flex-col items-center justify-center gap-2 overflow-hidden"
              >
                {isSuggesting ? <span className="animate-pulse">SYNCHRONIZING...</span> : <span>ACTIVATE PROTOCOL</span>}
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#D4AF37]"></div>
                <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#D4AF37]"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#D4AF37]"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#D4AF37]"></div>
              </button>
            </div>
          </div>
          <div className="mt-auto pt-6 border-t border-border/10">
            <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] text-center">SYSTEM_ACTIVE // {syncStatus}</div>
          </div>
        </nav>
      )}

      {/* MOBILE TOP HEADER */}
      {!focusMode && (
        <header className="md:hidden flex items-center justify-between p-4 border-b z-50 bg-bg/95 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xl font-black tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>DEPROCAST</div>
          <div className="text-[8px] font-black opacity-40 tracking-widest">{syncStatus}</div>
        </header>
      )}

      <main className="flex-1 relative h-full overflow-hidden bg-transparent">
        <div className="absolute inset-0 scroll-container p-4 md:p-12 pb-32 md:pb-12 flex flex-col gap-6 md:gap-10">
          {activeTab === 'dashboard' && (
            <Dashboard 
              data={appDataState} 
              setData={async (updater: any) => {
                const newData = typeof updater === 'function' ? updater(appDataState) : updater;
                if (newData.projects.length > projects.length) await db.save('projects', newData.projects[newData.projects.length-1]);
                handleLogin(currentUser);
              }} 
              setFocusMode={setFocusMode} 
              focusMode={focusMode} 
              onFocusComplete={async (session, note) => {
                await db.save('focusSessions', session);
                if (note) await db.save('notes', note);
                await addXP(session.xpEarned);
                setFocusMode(null);
                handleLogin(currentUser);
              }} 
            />
          )}
          {activeTab === 'journal' && <Journal data={appDataState} setData={async (updater: any) => {
            const newData = typeof updater === 'function' ? updater(appDataState) : updater;
            if (newData.notes.length > notes.length) await db.save('notes', newData.notes[0]);
            handleLogin(currentUser);
          }} />}
          {activeTab === 'matrix' && <NeuralMatrix data={appDataState} addXP={addXP} setData={async (updater: any) => {
            const newData = typeof updater === 'function' ? updater(appDataState) : updater;
            for (const p of newData.projects) await db.save('projects', p);
            handleLogin(currentUser);
          }} />}
          {activeTab === 'chronos' && <Chronos data={appDataState} setData={async (updater: any) => {
            const newData = typeof updater === 'function' ? updater(appDataState) : updater;
            handleLogin(currentUser);
          }} />}
          {activeTab === 'vault' && <TheVault data={appDataState} setData={async (updater: any) => {
            const newData = typeof updater === 'function' ? updater(appDataState) : updater;
            handleLogin(currentUser);
          }} />}
          {activeTab === 'profile' && <Profile data={appDataState} setData={async (updater: any) => {
            const newData = typeof updater === 'function' ? updater(appDataState) : updater;
            await db.save('users', newData.currentUser);
            handleLogin(newData.currentUser);
          }} />}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      {!focusMode && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-[100] border-t bg-bg/95 backdrop-blur-xl flex flex-col" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-2 pt-1">
             <div className="flex-1 grid grid-cols-3 gap-1">
               <button onClick={() => setActiveTab('dashboard')} className={`py-3 flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-accent' : 'opacity-40'}`}>
                 <span className="text-xl">🏠</span>
                 <span className="text-[8px] font-black uppercase tracking-tighter">Gateway</span>
               </button>
               <button onClick={() => setActiveTab('matrix')} className={`py-3 flex flex-col items-center gap-1 ${activeTab === 'matrix' ? 'text-accent' : 'opacity-40'}`}>
                 <span className="text-xl">🧠</span>
                 <span className="text-[8px] font-black uppercase tracking-tighter">Matrix</span>
               </button>
               <button onClick={() => setActiveTab('journal')} className={`py-3 flex flex-col items-center gap-1 ${activeTab === 'journal' ? 'text-accent' : 'opacity-40'}`}>
                 <span className="text-xl">📓</span>
                 <span className="text-[8px] font-black uppercase tracking-tighter">Journal</span>
               </button>
             </div>
             
             {/* Mobile Protocol Button - Centered/Primary */}
             <div className="px-2 -mt-6">
                <button 
                  onClick={handleActivateProtocol}
                  disabled={isSuggesting}
                  className="w-16 h-16 rounded-full bg-[#2A0202] border-4 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center animate-protocol-pulse active:scale-90 transition-transform disabled:opacity-50"
                >
                  {isSuggesting ? <span className="animate-spin text-xl text-[#D4AF37]">🌀</span> : <span className="text-2xl">⚡</span>}
                </button>
             </div>

             <div className="flex-1 grid grid-cols-3 gap-1">
               <button onClick={() => setActiveTab('chronos')} className={`py-3 flex flex-col items-center gap-1 ${activeTab === 'chronos' ? 'text-accent' : 'opacity-40'}`}>
                 <span className="text-xl">⏳</span>
                 <span className="text-[8px] font-black uppercase tracking-tighter">Chronos</span>
               </button>
               <button onClick={() => setActiveTab('vault')} className={`py-3 flex flex-col items-center gap-1 ${activeTab === 'vault' ? 'text-accent' : 'opacity-40'}`}>
                 <span className="text-xl">🔒</span>
                 <span className="text-[8px] font-black uppercase tracking-tighter">Vault</span>
               </button>
               <button onClick={() => setActiveTab('profile')} className={`py-3 flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-accent' : 'opacity-40'}`}>
                 <span className="text-xl">👤</span>
                 <span className="text-[8px] font-black uppercase tracking-tighter">ID</span>
               </button>
             </div>
          </div>
          <div className="h-safe-bottom pb-2"></div>
        </nav>
      )}

      <style>{`
        @keyframes protocol-pulse { 0%, 100% { box-shadow: 0 0 10px rgba(74,4,4,0.4); } 50% { box-shadow: 0 0 30px rgba(212,175,55,0.6); } }
        .animate-protocol-pulse { animation: protocol-pulse 2.5s ease-in-out infinite; }
        .h-safe-bottom { height: env(safe-area-inset-bottom, 0px); }
      `}</style>
    </div>
  );
};

export default App;
