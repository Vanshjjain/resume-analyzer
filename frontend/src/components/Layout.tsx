import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  GitCompare, 
  Briefcase, 
  Compass, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShieldAlert,
  Terminal,
  Cpu
} from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Matrix Canvas background effect
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const chars = '010101010101XYZATSRESUMEAI';
    const fontSize = 13;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(11, 15, 25, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00f0ff';
      ctx.font = `${fontSize}px Share Tech Mono, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = i % 7 === 0 ? '#ff007f' : i % 5 === 0 ? '#00ff66' : 'rgba(0, 240, 255, 0.4)';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', href: '/analyzer', icon: FileText },
    { name: 'Comparison', href: '/compare', icon: GitCompare },
    { name: 'Job Match', href: '/job-match', icon: Briefcase },
    { name: 'Job Roles', href: '/job-roles', icon: Compass },
    { name: 'Interview Prep', href: '/interview', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'Admin Panel', href: '/admin', icon: ShieldAlert });
  }

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#070a12]/90 font-mono-hud border-r border-[#00f0ff]/20">
      {/* Brand Logo HUD */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#00f0ff]/20 bg-[#0b0f19]/80">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#ff007f] text-black font-extrabold shadow-lg shadow-[#00f0ff]/20 glow-cyan">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-[#00f0ff] via-[#ffffff] to-[#ff007f] bg-clip-text text-transparent uppercase">
            Resume AI
          </span>
          <span className="block text-[10px] text-[#00ff66] font-bold tracking-widest uppercase">
            [SYS_ONLINE_HUD]
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <span className="text-[10px] text-[#00f0ff]/50 font-bold uppercase tracking-widest px-3 block mb-2">
          // NAVIGATION_NODES
        </span>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`cyber-button-tactical flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] shadow-lg shadow-[#00f0ff]/15'
                  : 'text-foreground/70 hover:bg-[#00f0ff]/10 hover:text-[#00f0ff] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00f0ff]' : 'text-foreground/50'}`} />
              <span className="tracking-wider uppercase">{item.name}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer info */}
      <div className="p-4 border-t border-[#00f0ff]/20 bg-[#05070e]">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="relative">
            <img 
              src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=User'} 
              alt="Avatar" 
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#00f0ff]/40"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00ff66] rounded-full ring-2 ring-[#070a12]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-white uppercase">{user?.full_name || 'HACKER_OPERATIVE'}</p>
            <p className="text-[10px] truncate text-[#00f0ff]/60 font-mono">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border border-[#00f0ff]/25 hover:bg-[#00f0ff]/10 transition-colors text-[#00f0ff]"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{theme === 'dark' ? 'CYBER_DARK' : 'LIGHT_HUD'}</span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 rounded-xl border border-[#ff007f]/30 hover:bg-[#ff007f]/15 text-[#ff007f] transition-colors"
            title="Disconnect Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-[#00f0ff] relative font-mono-hud overflow-hidden">
      {/* Dynamic Cyber Matrix Data Rain Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-1 pointer-events-none opacity-25" />
      <div className="premium-grid-overlay" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-[#00f0ff]/20 shrink-0 fixed h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
        {/* Top Mobile Navbar */}
        <header className="lg:hidden h-16 border-b border-[#00f0ff]/20 flex items-center justify-between px-6 bg-[#070a12]/90 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00f0ff] text-black">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase text-white">RESUME_AI_HUD</span>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg border border-[#00f0ff]/30 text-[#00f0ff]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto pb-20">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#070a12] border-r border-[#00f0ff]/30 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-[#00f0ff]/30 text-[#00f0ff]"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Cyberpunk Logout Confirmation Modal Popup */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#070a12]/95 border-2 border-[#ff007f] rounded-2xl p-7 shadow-2xl relative z-10 backdrop-blur-xl text-center space-y-5 cyber-chamfer-card glow-magenta"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#ff007f]/10 border border-[#ff007f]/40 flex items-center justify-center text-[#ff007f] glow-magenta">
                <LogOut className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#ff007f] uppercase tracking-widest block">[DISCONNECT_SESSION_PROMPT]</span>
                <h3 className="text-xl font-extrabold text-white tracking-wider">TERMINATE SESSION?</h3>
                <p className="text-xs text-[#00f0ff]/70 leading-relaxed font-mono">
                  Are you sure you want to purge local JWT keys and disconnect from the active neural network?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="cyber-button-tactical w-full py-3 px-4 bg-[#0b0f19] border border-[#00f0ff]/40 text-[#00f0ff] font-bold text-xs hover:bg-[#00f0ff]/10"
                >
                  ABORT
                </button>
                <button
                  onClick={confirmLogout}
                  className="cyber-button-tactical w-full py-3 px-4 bg-[#ff007f] text-white font-bold text-xs hover:bg-[#ff007f]/80 shadow-lg shadow-[#ff007f]/30 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>DISCONNECT</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
