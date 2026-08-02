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
  GraduationCap
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

  // Add Admin Route if user is admin
  if (user?.role === 'admin') {
    navigation.push({ name: 'Admin Panel', href: '/admin', icon: ShieldAlert });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent text-white shadow-lg shadow-primary/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Antigravity</span>
          <span className="block text-[10px] text-foreground/50 font-semibold tracking-wider uppercase">Career Hub</span>
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
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
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
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20"
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
                <Sun className="w-3.5 h-3.5 text-yellow-500" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors"
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
      {/* Premium Obsidian Dark Background & Grids */}
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
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent text-white">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Antigravity</span>
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
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            {/* Drawer */}
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
    </div>
  );
};
