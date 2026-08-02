import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Sun, Moon, Bell, Shield, Cpu } from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <span>System Settings</span>
        </h1>
        <p className="text-foreground/50 text-sm mt-1">Manage user preferences and local workspace variables</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visual Settings */}
        <GlassCard className="space-y-6">
          <h3 className="font-bold text-md text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
            <Sun className="w-4.5 h-4.5 text-primary" />
            <span>Theme Preferences</span>
          </h3>
          <p className="text-xs text-foreground/60 leading-relaxed">
            Switch between light and dark UI interfaces. The dark mode utilizes a slate-950 tone designed for low-stress reading.
          </p>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-card-border/50 text-xs font-bold text-foreground transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            <span>Toggle Active Theme ({theme === 'dark' ? 'Dark' : 'Light'})</span>
          </button>
        </GlassCard>

        {/* AI & API Configuration */}
        <GlassCard className="space-y-6">
          <h3 className="font-bold text-md text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
            <Cpu className="w-4.5 h-4.5 text-accent" />
            <span>AI Execution Mode</span>
          </h3>
          <div className="space-y-4 text-xs text-foreground/75 leading-relaxed">
            <div className="flex justify-between items-center bg-card-border/10 p-3 rounded-xl border border-border/20">
              <div>
                <p className="font-bold">Active Engine</p>
                <p className="text-[10px] text-foreground/45 mt-0.5">Determined by environmental key</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[9px]">
                Deterministic Local Heuristics
              </span>
            </div>
            <p className="text-foreground/50">
              Note: To enable GPT-4 parsing analysis, configure the `OPENAI_API_KEY` parameter inside the backend `.env` variables list.
            </p>
          </div>
        </GlassCard>

        {/* Notifications & System defaults */}
        <GlassCard className="space-y-6">
          <h3 className="font-bold text-md text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
            <Bell className="w-4.5 h-4.5 text-indigo-400" />
            <span>Alerts & Notifications</span>
          </h3>
          <div className="space-y-3.5 text-xs text-foreground/75">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border text-primary outline-none focus:ring-0 w-4 h-4" />
              <span>Email me copies of compiled PDF audit reports automatically.</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border text-primary outline-none focus:ring-0 w-4 h-4" />
              <span>Provide micro-animation alerts on score changes.</span>
            </label>
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard className="space-y-6">
          <h3 className="font-bold text-md text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
            <Shield className="w-4.5 h-4.5 text-pink-400" />
            <span>Workspace Security</span>
          </h3>
          <p className="text-xs text-foreground/60 leading-relaxed">
            All user sessions are secured using JWT cryptography. Access tokens are kept inside standard browser localStorage caches.
          </p>
          <div className="bg-card-border/10 p-3 rounded-xl border border-border/20 text-xs">
            <span className="font-bold block">Token expiry duration</span>
            <span className="text-[10px] text-foreground/45 mt-0.5 block">1440 Minutes (1 Day validity check)</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
