
import React, { useMemo, useState } from 'react';
import { AppData, Project, Contact, Task } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}

const Profile: React.FC<Props> = ({ data, setData }) => {
  const [analyzing, setAnalyzing] = useState(false);

  const performStrategicAnalysis = async () => {
    setAnalyzing(true);
    
    const context = `
      Current Projects: ${data.projects.map(p => `${p.name} (Resist: ${p.resistance}, Complex: ${p.complexity})`).join(', ')}
      Network: ${data.contacts.map(c => `${c.name} - ${c.role}`).join(', ')}
      XP: ${data.stats.xp}
      Rank: ${data.stats.rank}
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze my current state in Deprocast OS. Who am I based on my projects and network? Where do I stand strategically? Provide a short, authoritative executive summary. Current context: ${context}`,
      });
      
      setData(prev => ({
        ...prev,
        stats: { ...prev.stats, lastAnalysis: response.text }
      }));
    } catch (e) {
      console.error("Gemini strategic analysis error:", e);
      setData(prev => ({
        ...prev,
        stats: { ...prev.stats, lastAnalysis: "Error: Strategic intelligence link severed." }
      }));
    } finally {
      setAnalyzing(false);
    }
  };

  const graphContent = useMemo(() => {
    const width = 1000;
    const height = 700;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const projects = data.projects.filter(p => p.status === 'active');
    const contacts = data.contacts;
    
    const nodes: any[] = [];
    const links: any[] = [];

    nodes.push({ id: 'user', x: centerX, y: centerY, label: 'CORE', type: 'user', size: 45 });

    projects.forEach((p, i) => {
      const angle = (i / projects.length) * Math.PI * 2;
      const radius = 180;
      const px = centerX + Math.cos(angle) * radius;
      const py = centerY + Math.sin(angle) * radius;
      nodes.push({ id: p.id, x: px, y: py, label: p.name.toUpperCase(), type: 'project', size: 30 });
      links.push({ x1: centerX, y1: centerY, x2: px, y2: py, type: 'user-project' });

      const pendingTasks = p.tasks.filter(t => !t.completed).slice(0, 3);
      pendingTasks.forEach((t, j) => {
        const tAngle = angle + ((j - 1) * 0.4);
        const tRadius = 280;
        const tx = centerX + Math.cos(tAngle) * tRadius;
        const ty = centerY + Math.sin(tAngle) * tRadius;
        nodes.push({ id: t.id, x: tx, y: ty, label: t.title.toUpperCase(), type: 'task', size: 12 });
        links.push({ x1: px, y1: py, x2: tx, y2: ty, type: 'project-task' });
      });
    });

    contacts.forEach((c, i) => {
      const angle = (i / (contacts.length || 1)) * Math.PI * 2 + 0.2;
      const radius = 420;
      const cx = centerX + Math.cos(angle) * radius;
      const cy = centerY + Math.sin(angle) * radius;
      nodes.push({ id: c.id, x: cx, y: cy, label: c.name.toUpperCase(), type: 'contact', size: 25 });
      c.linkedProjectIds.forEach(pid => {
        const pNode = nodes.find(n => n.id === pid);
        if (pNode) links.push({ x1: cx, y1: cy, x2: pNode.x, y2: pNode.y, type: 'contact-project' });
      });
      if (c.linkedProjectIds.length === 0) links.push({ x1: cx, y1: cy, x2: centerX, y2: centerY, type: 'contact-user-isolated' });
    });

    return { nodes, links, width, height };
  }, [data.projects, data.contacts]);

  return (
    <div className="flex flex-col gap-8 md:gap-10 animate-fade-in pb-32">
      <header className="border-b-4 pb-6" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tighter uppercase italic" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)' }}>ID ARCHITECTURE</h1>
        <p className="opacity-80 text-xs md:text-lg font-bold uppercase tracking-[0.1em] md:tracking-[0.2em]">OPERATIVE: <span className="text-accent">{data.stats.rank}</span></p>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
        <div className="md:col-span-1 p-6 md:p-8 border-4 bg-surface flex flex-row md:flex-col items-center justify-center gap-4 text-center" style={{ borderColor: 'var(--border)' }}>
          <div className="w-16 h-16 md:w-24 md:h-24 border-4 flex items-center justify-center rounded-full bg-accent/5 shrink-0" style={{ borderColor: 'var(--accent)' }}>
            <span className="text-3xl md:text-5xl font-black" style={{ color: 'var(--accent)' }}>{data.stats.rank[0]}</span>
          </div>
          <div className="text-left md:text-center">
            <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase leading-none">{data.stats.rank}</h2>
            <span className="text-[8px] md:text-[10px] opacity-60 font-black uppercase tracking-widest mt-2 block">TIER RATING</span>
          </div>
        </div>
        
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { label: 'Cumulative XP', val: data.stats.xp, color: 'var(--accent)' },
            { label: 'Active Ops', val: data.projects.filter(p => p.status === 'active').length, color: 'var(--text)' },
            { label: 'Network', val: data.contacts.length, color: 'var(--text)', mobileHidden: true }
          ].map((stat, i) => (
            <div key={i} className={`p-4 md:p-6 border-2 bg-surface flex flex-col justify-center ${stat.mobileHidden ? 'hidden md:flex' : ''}`} style={{ borderColor: 'var(--border)' }}>
              <span className="text-[8px] md:text-[10px] font-black opacity-60 uppercase block mb-1 tracking-widest truncate">{stat.label}</span>
              <span className="text-2xl md:text-4xl font-black truncate" style={{ color: stat.color }}>{stat.val}</span>
            </div>
          ))}
          <div className="col-span-2 md:col-span-3 p-4 md:p-6 border-2 italic text-xs md:text-base leading-relaxed" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[8px] md:text-[10px] font-black opacity-60 uppercase block mb-2 not-italic tracking-widest">Cognitive Blueprint</span>
            "{data.stats.bio || 'Calibration required.'}"
          </div>
        </div>
      </section>

      {/* Strategic Intelligence Matrix */}
      <section className="flex flex-col gap-6">
        <h3 className="text-[10px] md:text-sm font-black tracking-[0.4em] uppercase opacity-80">INTELLIGENCE MATRIX</h3>
        <div className="w-full h-[300px] md:h-[600px] border-4 bg-black/95 relative overflow-hidden shadow-inner" style={{ borderColor: 'var(--border)' }}>
           <svg viewBox={`0 0 ${graphContent.width} ${graphContent.height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
             {graphContent.links.map((link, i) => (
               <line key={i} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} stroke={link.type === 'user-project' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'} strokeWidth={link.type === 'user-project' ? 2 : 1} className="opacity-60" />
             ))}
             {graphContent.nodes.map((node, i) => (
               <g key={i}>
                 <circle cx={node.x} cy={node.y} r={node.size} fill={node.type === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)'} stroke="var(--border)" strokeWidth="2" />
                 <text x={node.x} y={node.y + node.size + 15} textAnchor="middle" fill="white" fontSize="12" fontWeight="black" className="uppercase pointer-events-none opacity-40">{node.label.substr(0, 10)}</text>
               </g>
             ))}
           </svg>
        </div>
      </section>

      {/* Strategic AI Analysis */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 pb-2 gap-4" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-[10px] md:text-sm font-black tracking-[0.4em] uppercase opacity-80">STRATEGIC SUMMARY</h3>
          <button 
            onClick={performStrategicAnalysis}
            className="w-full md:w-auto px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-accent text-accent hover:bg-accent hover:text-bg transition-all"
          >
            {analyzing ? 'SYNTHESIZING...' : 'ANALYZE'}
          </button>
        </div>
        <div className="p-6 md:p-10 border-4 bg-accent/5 leading-relaxed min-h-[150px] flex items-center justify-center text-center" style={{ borderColor: 'var(--accent)' }}>
          {data.stats.lastAnalysis ? <div className="text-sm md:text-xl font-bold italic">"{data.stats.lastAnalysis}"</div> : <div className="opacity-30 uppercase font-black text-[10px]">Awaiting Link...</div>}
        </div>
      </section>
    </div>
  );
};

export default Profile;
