
import React, { useState } from 'react';
import { AppData, Project, Task, CalendarEvent } from '../types';

interface Props {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}

const Chronos: React.FC<Props> = ({ data, setData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<{projectId: string, task: Task} | null>(null);

  const daysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return [
      ...data.events.filter(e => e.date.startsWith(dateStr)),
      ...data.projects.flatMap(p => 
        p.tasks.filter(t => t.scheduledDate?.startsWith(dateStr)).map(t => ({
          id: t.id,
          title: t.title,
          type: 'task',
          projectName: p.name
        }))
      )
    ];
  };

  const handleDragStart = (projectId: string, task: Task) => {
    setDraggedTask({ projectId, task });
  };

  const handleDrop = (date: Date) => {
    if (!draggedTask) return;
    const dateStr = date.toISOString().split('T')[0];
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === draggedTask.projectId) {
          return {
            ...p,
            tasks: p.tasks.map(t => t.id === draggedTask.task.id ? { ...t, scheduledDate: dateStr } : t)
          };
        }
        return p;
      })
    }));
    setDraggedTask(null);
  };

  const monthDays = daysInMonth(currentDate);

  return (
    <div className="flex flex-col gap-8 animate-fade-in h-full overflow-hidden">
      <header className="flex justify-between items-end shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)' }}>CHRONOS</h1>
          <p className="opacity-40 text-[9px] font-black uppercase tracking-[0.5em]">Temporal Architecture & Routines</p>
        </div>
        <div className="flex gap-4 items-center bg-surface border-4 p-2 px-6" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="font-black">←</button>
          <span className="text-xs font-black uppercase tracking-[0.2em]">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="font-black">→</button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 border-4 bg-surface flex flex-col overflow-hidden" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
          <div className="grid grid-cols-7 bg-accent text-bg border-b-2" style={{ borderColor: 'var(--accent)' }}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className="p-3 text-[9px] font-black text-center tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 overflow-y-auto">
            {monthDays.map((day, idx) => (
              <div 
                key={idx} 
                onDragOver={e => e.preventDefault()}
                onDrop={() => day && handleDrop(day)}
                className={`min-h-[120px] p-2 border-r border-b border-border/20 transition-all ${day ? 'hover:bg-accent/5' : 'bg-black/5'}`}
              >
                {day && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className={`text-[10px] font-black p-1 px-2 ${day.toDateString() === new Date().toDateString() ? 'bg-accent text-bg' : 'opacity-30'}`}>
                        {day.getDate()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getEventsForDate(day).map((e: any, i) => (
                        <div key={i} className={`text-[7px] p-1 px-2 border-l-2 font-black uppercase truncate shadow-sm bg-bg`} style={{ borderColor: e.type === 'task' ? 'var(--accent)' : 'var(--text)' }}>
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Pending Tasks for Time-Blocking */}
        <aside className="flex flex-col gap-6 overflow-hidden">
          <h3 className="text-xs font-black uppercase tracking-widest border-b-2 pb-2" style={{ borderColor: 'var(--border)' }}>Unscheduled Deployment</h3>
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
            {data.projects.filter(p => p.status === 'active').map(p => (
              <React.Fragment key={p.id}>
                {p.tasks.filter(t => !t.completed && !t.scheduledDate).map(t => (
                  <div 
                    key={t.id}
                    draggable
                    onDragStart={() => handleDragStart(p.id, t)}
                    className="p-3 border-2 border-border/30 bg-surface text-[10px] font-bold uppercase cursor-grab active:cursor-grabbing hover:border-accent transition-all"
                  >
                    <div className="opacity-40 text-[7px] font-black mb-1">{p.name}</div>
                    {t.title}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="p-4 bg-black/5 text-[8px] font-black uppercase text-center opacity-40">
            Drag tasks onto the grid to block time.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Chronos;
