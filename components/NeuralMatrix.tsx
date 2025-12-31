
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
    <div className="flex flex-col gap-8 animate-fade-in h-full overflow-hidden">
      <header>
        <h1 className="text-4xl md:text-5xl font-black mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>NEURAL MATRIX</h1>
        <p className="opacity-80 text-sm font-bold uppercase tracking-widest">Operation Hierarchy & Execution</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1 overflow-hidden">
        <aside className="md:col-span-1 border-r-2 pr-6 flex flex-col gap-3 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-black tracking-[0.2em] opacity-80 mb-4 uppercase">ACTIVE OPERATIONS</h3>
          {data.projects.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`p-4 text-left text-sm border-2 transition-all truncate leading-tight flex flex-col gap-1 ${selectedProjectId === p.id ? 'opacity-100 scale-105 shadow-md bg-surface border-accent' : 'opacity-60 border-transparent hover:opacity-100'}`}
              style={{ borderColor: selectedProjectId === p.id ? 'var(--accent)' : 'transparent' }}
            >
              <span className="font-black truncate">{p.name.toUpperCase()}</span>
              {/* Corrected p.state to p.functionalState and updated comparison logic */}
              <span className={`text-[8px] font-black uppercase tracking-widest ${p.functionalState === 'Idea' ? 'opacity-40' : p.functionalState === 'Planning' ? 'text-blue-500' : 'text-yellow-500'}`}>{p.functionalState}</span>
            </button>
          ))}
        </aside>

        <div className="md:col-span-3 overflow-y-auto p-2">
          {selectedProject ? (
            <div className="flex flex-col gap-8 pb-10">
              <div className="border-b-4 pb-6" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-black uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{selectedProject.name}</h2>
                  <div className="flex gap-4 items-center">
                    {/* Corrected urgency/state properties to match Project interface */}
                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-accent text-bg">{selectedProject.urgencyThreshold}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-1 border-2 border-accent" style={{ color: 'var(--accent)' }}>{selectedProject.functionalState}</span>
                  </div>
                </div>
                {/* Corrected description property to strategicVision */}
                <p className="text-lg font-medium opacity-90 italic">"{selectedProject.strategicVision}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                <div className="p-4 border-2" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-black uppercase tracking-widest mb-3 block opacity-80">Emotional Resistance: {selectedProject.resistance}/10</span>
                  <div className="h-4 w-full bg-black/10 overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
                    <div className="h-full bg-accent" style={{ width: `${selectedProject.resistance * 10}%`, backgroundColor: 'var(--accent)' }} />
                  </div>
                </div>
                <div className="p-4 border-2" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-black uppercase tracking-widest mb-3 block opacity-80">Complexity Depth: {selectedProject.complexity}/10</span>
                  <div className="h-4 w-full bg-black/10 overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
                    <div className="h-full bg-accent" style={{ width: `${selectedProject.complexity * 10}%`, backgroundColor: 'var(--accent)' }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-black tracking-[0.2em] opacity-80 uppercase">Stakeholders</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.linkedContactIds.map(cid => (
                    <div key={cid} className="px-3 py-1 bg-surface border-2 text-[10px] font-black uppercase" style={{ borderColor: 'var(--border)' }}>
                      {data.contacts.find(c => c.id === cid)?.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-black tracking-[0.2em] opacity-80 uppercase">Execution Sequence</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedProject.tasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => toggleTask(selectedProject.id, task.id)}
                      className="group flex items-center gap-5 p-5 border-2 cursor-pointer hover:bg-surface transition-all"
                      style={{ borderColor: task.completed ? 'var(--border)' : 'var(--accent)', opacity: task.completed ? 0.5 : 1 }}
                    >
                      <div className={`w-8 h-8 border-2 flex items-center justify-center ${task.completed ? 'bg-accent' : ''}`} style={{ borderColor: 'var(--accent)' }}>
                        {task.completed && <span className="text-xl text-white font-black">✓</span>}
                      </div>
                      <span className={`text-lg font-bold ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border-4 border-dashed opacity-40">
              <span className="text-2xl font-black uppercase">Operation Pending Target Selection</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeuralMatrix;
