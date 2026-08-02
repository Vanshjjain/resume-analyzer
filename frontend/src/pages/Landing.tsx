import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Activity, MessageSquare, ShieldCheck } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleAction = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#030306] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Premium Dark Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:45px_45px]" />
      
      {/* Central Teal Radial Glow */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Top Header Navigation */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          {/* Logo Icon */}
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-[#030306]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white font-sans">ResumeIQ</span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Sign in
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#030306] font-bold text-xs transition-colors cursor-pointer"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 text-center my-auto py-16 space-y-8">
        
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI resume intelligence</span>
        </div>

        {/* Large Header */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans max-w-3xl mx-auto">
          Stop guessing why your resume gets <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">filtered out</span>
        </h1>

        {/* Subtitle Description */}
        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          ResumeIQ scores your resume the way applicant tracking systems do, matches it to the jobs you actually want, and coaches you through the interview.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleAction}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#030306] font-extrabold text-sm shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Analyze my resume</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigate(token ? '/interview' : '/login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold text-sm transition-all cursor-pointer"
          >
            <span>Talk to the assistant</span>
          </button>
        </div>

      </main>

      {/* Footer Info / Floating Toolbar mockup */}
      <footer className="relative z-10 pb-12 flex justify-center">
        <div className="flex items-center gap-6 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>ATS Compliance Audit</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Skill Gap roadmaps</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
            <span>Interview flashcards</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
