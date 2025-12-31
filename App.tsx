
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Atmosphere, AppData, Project, Contact, VictoryNote, CalendarEvent, FocusSession, User } from './types';
import { THEMES, RANKS } from './constants';
import { db } from './services/db';
import { isCloudEnabled } from './services/supabase';
import Dashboard from './components/Dashboard';
import NeuralMatrix from './components/NeuralMatrix';
import Chronos from './components/Chronos';
import TheVault from './components/TheVault';
import Profile from './components/Profile';

const SESSION_KEY = 'deprocast_active_session';
const DEFAULT_USER_ID = 'local-operative-id';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'matrix' | 'chronos' | 'vault' | 'profile'>('dashboard');
  const [focusMode, setFocusMode] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'LOCAL' | 'CLOUD' | 'SYNCING'>('LOCAL');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<VictoryNote[]>([]);
  const [focusHistory, setFocusHistory] = useState<FocusSession[]>([]);

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
          stats: { 
            xp: 0, 
            level: 1, 
            rank: 'NOVICE', 
            bio: 'Direct hardware access. System bypass active.' 
          }
        };
        await db.save('users', user);
      }
      
      handleLogin(user);
    };
    boot();
  }, [handleLogin]);

  const handleResetSystem = async () => {
    if (confirm("PROTOCOL WARNING: This will purge all local matrix data. Proceed?")) {
      localStorage.removeItem(SESSION_KEY);
      window.location.reload();
    }
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
      if (newXP >= r.minXp) {
        newRank = r.title;
        break;
      }
    }
    const updatedUser = {
      ...currentUser,
      stats: { ...currentUser.stats, xp: newXP, rank: newRank }
    };
    setCurrentUser(updatedUser);
    await db.save('users', updatedUser);
  }, [currentUser]);

  const appDataState: AppData = {
    currentUser,
    projects,
    contacts,
    events,
    focusHistory,
    notes,
    stats: currentUser?.stats || { xp: 0, level: 1, rank: 'NOVICE' }
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
        <div className="text-sm font-black tracking-[0.4em] mb-6 animate-pulse uppercase">Synchronizing Neural Interface...</div>
        <div className="w-64 h-1 bg-white/5 relative overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-white/40 animate-[loading_1.5s_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }`}</style>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col md:flex-row relative overflow-hidden ${currentTheme.flicker ? 'crt-flicker' : ''}`}>
      {currentTheme.showScanlines && <div className="scanline" />}
      
      {!focusMode && (
        <nav className="w-full md:w-72 border-b md:border-b-0 md:border-r p-6 flex flex-col gap-6 sticky top-0 bg-opacity-95 backdrop-blur-md z-50 shrink-0 shadow-2xl" 
             style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
          <div className="flex flex-col gap-2 items-center">
            <div className="text-3xl font-black tracking-[0.2em] text-center" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)', color: 'var(--accent)' }}>
              DEPROCAST
            </div>
            <div className={`text-[9px] font-black tracking-[0.3em] px-3 py-1 rounded flex items-center gap-2 ${syncStatus === 'CLOUD' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/40'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'CLOUD' ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}></div>
              {syncStatus} STORAGE MODE
            </div>
          </div>
          
          <div className="flex flex-col gap-3 text-sm font-bold flex-1 mt-6">
            {['dashboard', 'matrix', 'chronos', 'vault', 'profile'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-4 text-left border-2 transition-all truncate tracking-widest ${activeTab === tab ? 'opacity-100 scale-[1.05] shadow-xl' : 'opacity-40 hover:opacity-100'}`}
                style={{ 
                  borderColor: activeTab === tab ? 'var(--accent)' : 'transparent',
                  backgroundColor: activeTab === tab ? 'var(--surface)' : 'transparent',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text)',
                  textShadow: activeTab === tab ? 'var(--text-glow)' : 'none'
                }}
              >
                {tab.replace('matrix', 'NEURAL MATRIX').replace('vault', 'THE VAULT').replace('chronos', 'CHRONOS').replace('profile', 'IDENTITY PROFILE').toUpperCase()}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <div className="p-6 border-2 text-center bg-surface/50" style={{ borderColor: 'var(--accent)' }}>
              <div className="text-[12px] font-black opacity-90 uppercase tracking-[0.3em]">{currentUser.username}</div>
              <div className="text-[11px] font-bold opacity-60 mt-2 italic">{currentUser.stats.rank} // XP {currentUser.stats.xp}</div>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1 relative h-full overflow-hidden bg-transparent">
        <div className="absolute inset-0 scroll-container p-8 md:p-12 flex flex-col gap-10">
          {activeTab === 'dashboard' && (
            <Dashboard 
              data={appDataState} 
              setData={async (updater: any) => {
                const newData = updater(appDataState);
                if (newData.projects.length > projects.length) await db.save('projects', newData.projects[0]);
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
          {activeTab === 'matrix' && <NeuralMatrix data={appDataState} addXP={addXP} setData={async (updater: any) => {
            const newData = updater(appDataState);
            for (const p of newData.projects) await db.save('projects', p);
            handleLogin(currentUser);
          }} />}
          {activeTab === 'chronos' && <Chronos data={appDataState} setData={async (updater: any) => {
            const newData = updater(appDataState);
            if (newData.events.length !== events.length) {
              const deleted = events.find(e => !newData.events.find(ne => ne.id === e.id));
              if (deleted) await db.delete('events', deleted.id);
              else await db.save('events', newData.events[newData.events.length-1]);
            }
            handleLogin(currentUser);
          }} />}
          {activeTab === 'vault' && <TheVault data={appDataState} setData={async (updater: any) => {
            const newData = updater(appDataState);
            if (newData.contacts.length !== contacts.length) await db.save('contacts', newData.contacts[newData.contacts.length-1]);
            if (newData.notes.length !== notes.length) await db.save('notes', newData.notes[0]);
            handleLogin(currentUser);
          }} />}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-12">
               <Profile data={appDataState} setData={async (updater: any) => {
                 const newData = updater(appDataState);
                 await db.save('users', newData.currentUser);
                 handleLogin(newData.currentUser);
               }} />
               
               <section className="p-10 border-4 border-dashed opacity-50 bg-white/5 shadow-inner" style={{ borderColor: 'var(--border)' }}>
                 <h3 className="text-sm font-black uppercase tracking-[0.5em] mb-6">Tactical Node Intelligence</h3>
                 <p className="text-xs mb-8 opacity-80 leading-relaxed font-bold tracking-widest">
                   Operando en modo: <span className="text-accent">{syncStatus}</span>. {syncStatus === 'LOCAL' ? 'Hardware bypass activo. Persistencia en IndexedDB local.' : 'Sincronización Cloud habilitada.'}
                 </p>
                 <div className="flex gap-6">
                   <button onClick={handleResetSystem} className="px-8 py-3 bg-red-600/20 text-red-600 border border-red-600/30 text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">De-Initialize Matrix Hardware</button>
                 </div>
               </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
