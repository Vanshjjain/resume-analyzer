import React, { useState } from 'react';
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
  GraduationCap,
  AlertTriangle
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
    <div className="flex flex-col h-full">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">Antigravity</span>
          <span className="block text-[10px] text-amber-500/60 font-semibold tracking-wider uppercase">Career Hub</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/20 border border-amber-500/35 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'text-foreground/75 hover:bg-card-border hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer info */}
      <div className="p-4 border-t border-border bg-card-border/20">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <img 
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=User'} 
            alt="Avatar" 
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/20"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-foreground">{user?.full_name || 'Career Specialist'}</p>
            <p className="text-xs truncate text-foreground/50">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold border border-border hover:bg-card transition-colors text-foreground"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Logout button triggers modal popup */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 rounded-lg border border-red-500/20 hover:bg-red-500/15 text-red-500 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-transparent relative">
      {/* Dark Amber Background & Grids */}
      <div className="premium-bg-container">
        <div className="premium-grid-overlay" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border glass-card shrink-0 fixed h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
        {/* Top Navbar */}
        <header className="lg:hidden h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">Antigravity</span>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg border border-border hover:bg-card-border text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Content Body */}
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
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-border hover:bg-card-border text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal Popup */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Glassmorphic Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm bg-[#12100a]/95 border border-amber-500/25 rounded-3xl p-6 shadow-2xl relative z-10 backdrop-blur-xl text-center space-y-5"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
                <LogOut className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">Confirm Log Out</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Are you sure you want to end your active session and sign out of your workspace?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-3 px-4 rounded-xl border border-border/40 hover:bg-card-border/30 text-white font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
