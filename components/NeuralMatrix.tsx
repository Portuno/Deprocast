
import React, { useState } from 'react';
import { AppData, Project, Task } from '../types';

interface Props {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  addXP: (amount: number) => void;
}

const NeuralMatrix: React.FC<Props> = ({ data, setData, addXP }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(data.projects[0]?.id || null);

  const selectedProject = data.projects.find(p => p.id === selectedProjectId);

  const toggleTask = (projectId: string, taskId: string) => {
    setData(prev => {
      const projects = prev.projects.map(p => {
        if (p.id === projectId) {
          const tasks = p.tasks.map(t => {
            if (t.id === taskId) {
              const isChecking = !t.completed;
              if (isChecking) {
                const xpGain = Math.round(10 * (p.resistance / 5) * (p.complexity / 5));
                addXP(xpGain);
              }
              return { ...t, completed: !t.completed };
            }
            return t;
          });
          return { ...p, tasks };
        }
        return p;
      });
      return { ...prev, projects };
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fade-in h-full overflow-hidden">
      <header>
        <h1 className="text-3xl md:text-5xl font-black mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>NEURAL MATRIX</h1>
        <p className="opacity-80 text-[10px] md:text-sm font-bold uppercase tracking-widest">Operation Hierarchy</p>
      </header>

      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:gap-8 flex-1 overflow-hidden">
        {/* Project Selector - Horizontal on Mobile, Vertical on Desktop */}
        <aside className="flex md:flex-col md:col-span-1 border-b-2 md:border-b-0 md:border-r-2 pb-4 md:pb-0 md:pr-6 gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar" style={{ borderColor: 'var(--border)' }}>
          {data.projects.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`min-w-[140px] md:min-w-0 p-3 md:p-4 text-left border-2 transition-all flex flex-col gap-1 shrink-0 ${selectedProjectId === p.id ? 'opacity-100 bg-surface border-accent' : 'opacity-40 border-transparent hover:opacity-100'}`}
              style={{ borderColor: selectedProjectId === p.id ? 'var(--accent)' : 'transparent' }}
            >
              <span className="text-[10px] md:text-xs font-black truncate uppercase">{p.name}</span>
              <span className="text-[7px] md:text-[8px] font-black uppercase opacity-60 tracking-tighter">{p.functionalState}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1 md:col-span-3 overflow-y-auto pr-2">
          {selectedProject ? (
            <div className="flex flex-col gap-6 md:gap-8 pb-10">
              <div className="border-b-2 md:border-b-4 pb-4 md:pb-6" style={{ borderColor: 'var(--border)' }}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{selectedProject.name}</h2>
                  <div className="flex gap-2 items-center">
                    <span className="text-[8px] md:text-[10px] font-black uppercase px-2 py-1 bg-accent text-bg">{selectedProject.urgencyThreshold}</span>
                    <span className="text-[8px] md:text-[10px] font-black uppercase px-2 py-1 border-2 border-accent" style={{ color: 'var(--accent)' }}>{selectedProject.functionalState}</span>
                  </div>
                </div>
                <p className="text-sm md:text-lg font-medium opacity-90 italic">"{selectedProject.strategicVision}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="p-4 border-2" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-[9px] font-black uppercase tracking-widest mb-2 block opacity-80">Resistance: {selectedProject.resistance}/10</span>
                  <div className="h-2 md:h-4 w-full bg-black/10 overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${selectedProject.resistance * 10}%` }} />
                  </div>
                </div>
                <div className="p-4 border-2" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-[9px] font-black uppercase tracking-widest mb-2 block opacity-80">Complexity: {selectedProject.complexity}/10</span>
                  <div className="h-2 md:h-4 w-full bg-black/10 overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${selectedProject.complexity * 10}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black tracking-[0.2em] opacity-80 uppercase">Execution Sequence</h3>
                <div className="flex flex-col gap-2">
                  {selectedProject.tasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => toggleTask(selectedProject.id, task.id)}
                      className="flex items-center gap-4 p-4 border-2 cursor-pointer hover:bg-surface transition-all active:scale-[0.98]"
                      style={{ borderColor: task.completed ? 'var(--border)' : 'var(--accent)', opacity: task.completed ? 0.5 : 1 }}
                    >
                      <div className={`w-6 h-6 border-2 flex items-center justify-center shrink-0 ${task.completed ? 'bg-accent' : ''}`} style={{ borderColor: 'var(--accent)' }}>
                        {task.completed && <span className="text-sm text-white font-black">✓</span>}
                      </div>
                      <span className={`text-sm md:text-lg font-bold uppercase ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed opacity-30 text-center p-6">
              <span className="text-lg md:text-2xl font-black uppercase">Operation Pending</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeuralMatrix;
