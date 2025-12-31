
import React, { useState, useEffect } from 'react';
import { User, Atmosphere } from '../types';
import { db } from '../services/db';

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        await db.init();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const allUsers = await db.getAll<User>('users');

      if (isRegistering) {
        if (!formData.email || !formData.password || !formData.username) {
          throw new Error("PLEASE FILL ALL REQUIRED FIELDS");
        }
        if (allUsers.find(u => u.email === formData.email)) {
          throw new Error("THIS EMAIL IS ALREADY REGISTERED");
        }

        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: formData.email,
          password: formData.password,
          username: formData.username,
          theme: Atmosphere.SOVEREIGN,
          createdAt: new Date().toISOString(),
          stats: { 
            xp: 0, 
            level: 1, 
            rank: 'NOVICE', 
            bio: 'Strategic Operative. System initialized.' 
          }
        };

        await db.save('users', newUser);
        onLogin(newUser);
      } else {
        const user = allUsers.find(u => u.email === formData.email && u.password === formData.password);
        if (!user) {
          throw new Error("INVALID EMAIL OR PASSWORD");
        }
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
      <div className="text-sm font-black tracking-[0.4em] mb-6 animate-pulse">BOOTING SYSTEM...</div>
      <div className="w-64 h-1 bg-white/5 relative overflow-hidden rounded-full">
        <div className="absolute inset-0 bg-white/40 animate-[loading_1.5s_infinite]"></div>
      </div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }`}</style>
    </div>
  );

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-display overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Structural Visuals */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

      <header className="mb-10 text-center z-10 animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-2 text-white italic">
          DEPROCAST<span className="text-white/20 not-italic">OS</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-8 bg-white/20"></div>
          <p className="text-[11px] font-black tracking-[0.4em] opacity-40 uppercase">Performance Management System</p>
          <div className="h-[1px] w-8 bg-white/20"></div>
        </div>
      </header>

      <div className="w-full max-w-md z-10">
        <div className="bg-[#0a0a0a] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Form Tabs */}
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-5 text-xs font-black tracking-widest uppercase transition-all ${!isRegistering ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-5 text-xs font-black tracking-widest uppercase transition-all ${isRegistering ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Email Address</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="bg-white/5 border border-white/10 p-3 text-sm focus:border-white focus:bg-white/10 outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>

              {isRegistering && (
                <div className="flex flex-col gap-2 animate-fade-in">
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">User Identification (Username)</label>
                  <input 
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="bg-white/5 border border-white/10 p-3 text-sm focus:border-white focus:bg-white/10 outline-none transition-all uppercase"
                    placeholder="OPERATIVE_01"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Secure Password</label>
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="bg-white/5 border border-white/10 p-3 text-sm focus:border-white focus:bg-white/10 outline-none transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="py-3 px-4 bg-red-500/10 border border-red-500/50 text-[10px] font-black text-red-500 tracking-widest text-center uppercase animate-pulse">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="py-4 bg-white text-black font-black text-sm uppercase tracking-widest hover:invert transition-all active:scale-[0.98] shadow-lg shadow-white/5"
            >
              {isRegistering ? 'Create New Account' : 'Access System'}
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 opacity-20 hover:opacity-100 transition-opacity">
          <p className="text-[9px] font-black tracking-widest text-center uppercase">
            Data is stored locally in your browser cache.
          </p>
          <div className="flex gap-4">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 text-[8px] font-black tracking-[0.5em] opacity-10 uppercase">
        DEPROCAST v1.6.0 // AUTHENTICATION GATE
      </footer>
    </div>
  );
};

export default Login;
