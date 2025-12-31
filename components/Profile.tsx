
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

  // SVG Graph Matrix Generation: Mapping connections between projects, people, and tasks
  const graphContent = useMemo(() => {
    const width = 1000;
    const height = 700;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const projects = data.projects.filter(p => p.status === 'active');
    const contacts = data.contacts;
    
    const nodes: any[] = [];
    const links: any[] = [];

    // Core Node: User
    nodes.push({ id: 'user', x: centerX, y: centerY, label: 'CORE_OPERATIVE', type: 'user', size: 45 });

    // Project Nodes (Ring 1)
    projects.forEach((p, i) => {
      const angle = (i / projects.length) * Math.PI * 2;
      const radius = 180;
      const px = centerX + Math.cos(angle) * radius;
      const py = centerY + Math.sin(angle) * radius;
      nodes.push({ id: p.id, x: px, y: py, label: p.name.toUpperCase(), type: 'project', size: 30 });
      links.push({ x1: centerX, y1: centerY, x2: px, y2: py, type: 'user-project' });

      // Task Nodes (Ring 2 - orbiting their respective projects)
      const pendingTasks = p.tasks.filter(t => !t.completed).slice(0, 3);
      pendingTasks.forEach((t, j) => {
        const tAngle = angle + ((j - 1) * 0.4); // Offset from project angle
        const tRadius = 280;
        const tx = centerX + Math.cos(tAngle) * tRadius;
        const ty = centerY + Math.sin(tAngle) * tRadius;
        nodes.push({ id: t.id, x: tx, y: ty, label: t.title.toUpperCase(), type: 'task', size: 12 });
        links.push({ x1: px, y1: py, x2: tx, y2: ty, type: 'project-task' });
      });
    });

    // Contact Nodes (Ring 3 - Outer ring, connected to projects they participate in)
    contacts.forEach((c, i) => {
      const angle = (i / contacts.length) * Math.PI * 2 + 0.2;
      const radius = 420;
      const cx = centerX + Math.cos(angle) * radius;
      const cy = centerY + Math.sin(angle) * radius;
      nodes.push({ id: c.id, x: cx, y: cy, label: c.name.toUpperCase(), type: 'contact', size: 25 });
      
      // Explicit links from contact to projects
      c.linkedProjectIds.forEach(pid => {
        const pNode = nodes.find(n => n.id === pid);
        if (pNode) {
          links.push({ x1: cx, y1: cy, x2: pNode.x, y2: pNode.y, type: 'contact-project' });
        }
      });

      // Visual connection back to user if isolated
      if (c.linkedProjectIds.length === 0) {
        links.push({ x1: cx, y1: cy, x2: centerX, y2: centerY, type: 'contact-user-isolated' });
      }
    });

    return { nodes, links, width, height };
  }, [data.projects, data.contacts]);

  return (
    <div className="flex flex-col gap-10 animate-fade-in pb-20">
      <header className="border-b-4 pb-6" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-5xl font-black mb-3 tracking-tighter uppercase italic" style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)' }}>IDENTITY ARCHITECTURE</h1>
        <p className="opacity-80 text-lg font-bold uppercase tracking-[0.2em] leading-relaxed">Operative Status: <span className="text-accent">{data.stats.rank}</span> // Synchronization complete.</p>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 p-8 border-4 bg-surface flex flex-col items-center justify-center gap-4 text-center" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
          <div className="w-24 h-24 border-4 flex items-center justify-center rounded-full bg-accent/5" style={{ borderColor: 'var(--accent)' }}>
            <span className="text-5xl font-black" style={{ color: 'var(--accent)' }}>{data.stats.rank[0]}</span>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-widest uppercase leading-none">{data.stats.rank}</h2>
            <span className="text-[10px] opacity-60 font-black uppercase tracking-widest mt-2 block">TIER RATING</span>
          </div>
        </div>
        
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Cumulative XP', val: data.stats.xp, color: 'var(--accent)' },
            { label: 'Active Matrix Operations', val: data.projects.filter(p => p.status === 'active').length, color: 'var(--text)' },
            { label: 'Network Reach', val: data.contacts.length, color: 'var(--text)' }
          ].map((stat, i) => (
            <div key={i} className="p-6 border-2 bg-surface flex flex-col justify-center" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
              <span className="text-[10px] font-black opacity-60 uppercase block mb-1 tracking-widest">{stat.label}</span>
              <span className="text-4xl font-black" style={{ color: stat.color }}>{stat.val}</span>
            </div>
          ))}
          <div className="md:col-span-3 p-6 border-2 italic text-base leading-relaxed" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
            <span className="text-[10px] font-black opacity-60 uppercase block mb-2 not-italic tracking-widest">Cognitive Blueprint</span>
            "{data.stats.bio || 'Initial profile calibration in progress... System waiting for performance baseline.'}"
          </div>
        </div>
      </section>

      {/* Strategic Intelligence Matrix (Graph Visualization) */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-black tracking-[0.4em] uppercase opacity-80">STRATEGIC INTELLIGENCE MATRIX</h3>
            <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Relational Mapping: Projects, Tasks, & Human Assets</p>
          </div>
        </div>
        
        <div className="w-full h-[700px] border-4 bg-black/95 relative overflow-hidden shadow-inner group" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
           {/* Static Scanline Overlay for effect */}
           <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
           
           <svg 
            viewBox={`0 0 ${graphContent.width} ${graphContent.height}`} 
            className="w-full h-full transition-transform duration-700 cursor-crosshair"
           >
             <defs>
               <filter id="glow">
                 <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                 <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
                 </feMerge>
               </filter>
             </defs>

             {/* Links Layer */}
             {graphContent.links.map((link, i) => (
               <line 
                key={i} 
                x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} 
                stroke={
                  link.type === 'user-project' ? 'var(--accent)' : 
                  link.type === 'project-task' ? 'rgba(255,255,255,0.15)' : 
                  'rgba(0, 242, 255, 0.2)'
                } 
                strokeWidth={link.type === 'user-project' ? 2 : 1}
                strokeDasharray={link.type === 'contact-user-isolated' ? "4,4" : "0"}
                className="transition-opacity duration-300 opacity-60"
               />
             ))}
             
             {/* Nodes Layer */}
             {graphContent.nodes.map((node, i) => (
               <g key={i} className="hover:opacity-100 transition-opacity">
                 <circle 
                  cx={node.x} cy={node.y} r={node.size} 
                  fill={
                    node.type === 'user' ? 'var(--accent)' : 
                    node.type === 'project' ? 'rgba(255,255,255,0.05)' : 
                    node.type === 'task' ? 'var(--text)' :
                    'transparent'
                  } 
                  stroke={
                    node.type === 'contact' ? 'var(--accent)' : 
                    node.type === 'task' ? 'var(--border)' :
                    'var(--border)'
                  }
                  strokeWidth={node.type === 'user' ? 4 : 2}
                  filter="url(#glow)"
                 />
                 <text 
                  x={node.x} y={node.y + node.size + 15} 
                  textAnchor="middle" 
                  fill="white" 
                  fontSize={node.type === 'user' ? '12' : '9'} 
                  fontWeight="black" 
                  className="uppercase tracking-widest pointer-events-none opacity-70"
                  style={{ textShadow: '0 2px 8px black', fontFamily: 'var(--font-main)' }}
                 >
                   {node.label}
                 </text>
               </g>
             ))}
           </svg>
           
           {/* Visual Legend */}
           <div className="absolute top-6 left-6 flex flex-col gap-3 p-5 bg-black/80 border-2 border-white/10 text-[9px] font-black tracking-[0.3em] uppercase text-white/70">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div> CORE_IDENTITY</div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full border-2 border-white/40"></div> STRATEGIC_OBJECTIVE</div>
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'white' }}></div> MICRO_TASK</div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full border-2 border-accent"></div> HUMAN_ASSET</div>
           </div>

           <div className="absolute bottom-6 right-6 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse">
             System Real-time Monitoring Active
           </div>
        </div>
      </section>

      {/* Strategic AI Analysis */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-center border-b-2 pb-2" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-black tracking-[0.4em] uppercase opacity-80">EXECUTIVE STRATEGIC SUMMARY</h3>
          <button 
            onClick={performStrategicAnalysis}
            disabled={analyzing}
            className={`px-8 py-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-2 ${analyzing ? 'opacity-50' : 'hover:bg-accent hover:text-bg'}`}
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            {analyzing ? 'SYNTHESIZING...' : 'INITIATE ANALYSIS'}
          </button>
        </div>
        
        <div className="p-10 border-4 bg-accent/5 leading-relaxed min-h-[200px] shadow-sm flex flex-col justify-center" style={{ borderColor: 'var(--accent)', borderRadius: 'var(--radius)' }}>
          {data.stats.lastAnalysis ? (
            <div className="text-xl font-bold italic opacity-95 whitespace-pre-wrap tracking-wide">
               "{data.stats.lastAnalysis}"
            </div>
          ) : (
            <div className="h-full flex items-center justify-center opacity-40 italic font-black uppercase tracking-widest text-sm text-center">
              Awaiting Strategic Intelligence Link Synchronization...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
