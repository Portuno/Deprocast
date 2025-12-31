
import React, { useState, useEffect, useRef } from 'react';
import { Project, FocusSession, Atmosphere, VictoryNote } from '../types';

interface Props {
  project: Project;
  onComplete: (session: FocusSession, note?: VictoryNote) => void;
  onCancel: () => void;
  theme: Atmosphere;
}

const FocusSessionModule: React.FC<Props> = ({ project, onComplete, onCancel, theme }) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const saved = localStorage.getItem('focus_duration');
    return (parseInt(saved || '25')) * 60;
  });
  const [isActive, setIsActive] = useState(true);
  const [showVictoryHarvest, setShowVictoryHarvest] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [audioMode, setAudioMode] = useState<'Silence' | 'Neural Beats' | 'Ambience'>('Silence');
  
  const initialDuration = useRef(secondsLeft);
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (audioMode === 'Neural Beats' && isActive && !showVictoryHarvest) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.current.createOscillator();
      const gain = audioContext.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(40, audioContext.current.currentTime);
      gain.gain.setValueAtTime(0.015, audioContext.current.currentTime);
      osc.connect(gain);
      gain.connect(audioContext.current.destination);
      osc.start();
      oscillator.current = osc;
    } else {
      oscillator.current?.stop();
      audioContext.current?.close();
      oscillator.current = null;
      audioContext.current = null;
    }
    return () => {
      oscillator.current?.stop();
      audioContext.current?.close();
    };
  }, [isActive, audioMode, showVictoryHarvest]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0 && !showVictoryHarvest) {
      interval = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    } else if (secondsLeft === 0) {
      setShowVictoryHarvest(true);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, showVictoryHarvest]);

  const handleHarvest = async () => {
    setIsHarvesting(true);
    const duration = initialDuration.current / 60;
    const xpBase = duration * 10;
    const multiplier = (project.resistance / 5) * (project.complexity / 5);
    const xpEarned = Math.round(xpBase * multiplier);

    const session: FocusSession = {
      id: Math.random().toString(36).substr(2, 9),
      userId: project.userId,
      projectId: project.id,
      durationMinutes: duration,
      date: new Date().toISOString(),
      xpEarned
    };

    const note: VictoryNote = {
      id: Math.random().toString(36).substr(2, 9),
      userId: project.userId,
      content: noteContent,
      date: new Date().toISOString(),
      performancePattern: `Duration: ${duration}min | Mult: ${multiplier.toFixed(2)}`
    };

    onComplete(session, note);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showVictoryHarvest) {
    return (
      <div className="fixed inset-0 z-[1000] bg-bg flex items-center justify-center p-8 animate-fade-in">
        <div className="w-full max-w-2xl flex flex-col gap-8 text-center">
          <header className="flex flex-col gap-2">
            <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase">Protocol Termination</span>
            <h1 className="text-6xl font-black uppercase tracking-widest italic" style={{ fontFamily: 'var(--font-display)' }}>THE HARVEST</h1>
            <p className="opacity-70 text-base font-bold uppercase tracking-[0.2em]">Convert spent time into permanent matrix intelligence.</p>
          </header>
          
          <textarea 
            autoFocus
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            className="w-full h-48 bg-surface border-4 p-8 text-2xl font-bold focus:border-accent outline-none resize-none text-center italic placeholder:opacity-20"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            placeholder="Document the breakthroughs and operational insights..."
          />

          <button 
            onClick={handleHarvest}
            disabled={isHarvesting || !noteContent.trim()}
            className="py-6 bg-accent text-bg font-black text-sm uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
          >
            {isHarvesting ? 'ENCRYPTING DATA...' : 'SECURE VICTORY & XP'}
          </button>
        </div>
      </div>
    );
  }

  const progress = (1 - secondsLeft / initialDuration.current) * 100;

  return (
    <div className="fixed inset-0 z-[500] bg-bg flex flex-col items-center justify-center p-12 overflow-hidden select-none animate-fade-in">
      <div className="absolute inset-0 border-[20px] opacity-5 pointer-events-none" style={{ borderColor: 'var(--accent)' }}></div>
      
      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-3xl">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[12px] font-black tracking-[0.8em] opacity-40 uppercase">Cognitive Shield Active</span>
          <div className="text-[16rem] font-black leading-none tracking-tighter" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', textShadow: 'var(--text-glow)' }}>
            {formatTime(secondsLeft)}
          </div>
        </div>

        <div className="w-full flex flex-col gap-6">
          <div className="h-2 w-full bg-black/10 overflow-hidden rounded-full">
            <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between items-center text-sm font-black uppercase tracking-[0.2em] opacity-80">
            <span>TARGET: {project.name}</span>
            <span className="text-accent">{progress.toFixed(0)}% SYNCED</span>
          </div>
        </div>

        <div className="flex gap-6 p-3 bg-surface border-2 shadow-lg" style={{ borderColor: 'var(--border)' }}>
          {['Silence', 'Neural Beats', 'Ambience'].map(mode => (
            <button 
              key={mode}
              onClick={() => setAudioMode(mode as any)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${audioMode === mode ? 'bg-accent text-bg' : 'opacity-40 hover:opacity-100'}`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex gap-16 mt-12">
          <button onClick={() => setIsActive(!isActive)} className="text-[12px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all">
            {isActive ? 'SUSPEND SESSION [P]' : 'RESUME SESSION [R]'}
          </button>
          <button onClick={onCancel} className="text-[12px] font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-all underline underline-offset-8">
            ABORT MISSION [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusSessionModule;
