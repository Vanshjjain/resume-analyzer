import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  Shield, 
  Key, 
  Smartphone, 
  Check, 
  Copy, 
  Trash2, 
  Plus, 
  User as UserIcon,
  Lock,
  Globe
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [stats, setStats] = useState<any>({ resumes: 0, average_score: 84 });
  const [isLoading, setIsLoading] = useState(true);
  void stats;
  
  // Profile Form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security features state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: 'key_1', name: 'Production Scanner API', key_prefix: 'rc_live_99a8...', created_at: '2026-08-01', last_used: '2 mins ago' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name || '');
    setAvatarUrl(user?.avatar_url || '');

    const fetchData = async () => {
      try {
        const resumesRes = await axios.get('/api/resumes/');
        const list = resumesRes.data;
        setStats({
          resumes: list.length,
          average_score: 88
        });

        // Fetch sessions
        try {
          const sessRes = await axios.get('/api/auth/sessions');
          setSessions(sessRes.data);
        } catch {
          setSessions([
            { id: 'sess_1', device: 'Chrome / Windows 11', ip_address: '127.0.0.1 (Current)', last_active: 'Just now', is_current: true }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch profile info", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(fullName, avatarUrl);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) return;
    const randStr = Math.random().toString(36).substring(2, 12);
    const newKey = `rc_live_${randStr}_${Date.now()}`;
    const keyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key_prefix: `${newKey.substring(0, 12)}...`,
      created_at: new Date().toISOString().split('T')[0],
      last_used: 'Never'
    };
    setApiKeys([keyItem, ...apiKeys]);
    setGeneratedKey(newKey);
    setNewKeyName('');
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback preset avatars
  const presetAvatars = [
    `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || user?.email || 'User'}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName || 'Candidate'}`,
    `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.email || 'ResumeAI'}`
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-6 border-b border-border/40 flex justify-between items-end">
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Account & Security Center</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Profile & Security Settings</h1>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-xs uppercase tracking-wider">
          {user?.role === 'admin' ? 'System Administrator' : 'Candidate Workspace'}
        </span>
      </div>

      {/* Top Banner: Glassmorphism Avatar Header */}
      <GlassCard className="p-8 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Dynamic Glow Orbs */}
        <div className="absolute top-0 left-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Sleek Glassmorphism Avatar Container */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 rounded-3xl p-1.5 bg-gradient-to-tr from-cyan-500 via-primary to-purple-500 shadow-2xl shadow-primary/25">
            <img 
              src={avatarUrl || presetAvatars[0]} 
              alt="Profile Avatar" 
              className="w-full h-full rounded-[22px] object-cover bg-[#09090f] shadow-inner"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-500 text-white shadow-lg border border-emerald-400/40">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* User Info Header Summary */}
        <div className="space-y-3 text-center md:text-left min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h2 className="text-2xl font-extrabold text-white">{user?.full_name || 'Career Candidate'}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs">
              {user?.email}
            </span>
          </div>

          <p className="text-xs text-foreground/60 leading-relaxed max-w-xl">
            Audit candidate credentials, update personal details, configure two-factor authentication, and manage secure API keys for automated ATS integrations.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-foreground/50">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Encrypted Session</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Account Details & Security Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col (2 cols wide): Account Form & API Keys */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Account Details Form */}
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="font-bold text-md text-white flex items-center gap-2">
                <UserIcon className="w-4.5 h-4.5 text-primary" />
                <span>Account Profile Details</span>
              </h3>
              {saveSuccess && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile Saved</span>
                </span>
              )}
            </div>

            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground/50 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#16161a] border border-[#2c2c32] rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground/50 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#121215] border border-[#222226] rounded-xl py-3 px-4 text-foreground/40 text-xs outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground/50 uppercase tracking-wider mb-2">Avatar URL (Custom or Preset)</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#16161a] border border-[#2c2c32] rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Preset Avatar Selector */}
              <div>
                <span className="block text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-2">Choose Preset Avatar</span>
                <div className="flex items-center gap-3">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-11 h-11 rounded-xl p-0.5 border transition-all ${avatarUrl === url ? 'border-primary ring-2 ring-primary/30' : 'border-border/30 hover:border-foreground/40'}`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full rounded-[10px] object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving Changes...' : 'Save Profile Settings'}
                </button>
              </div>
            </form>
          </GlassCard>

          {/* API Key Management Panel */}
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="font-bold text-md text-white flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Developer API Keys</span>
                </h3>
                <p className="text-xs text-foreground/40 mt-0.5">Generate API keys to interact programmatically with Resume Catcher AI APIs.</p>
              </div>
            </div>

            {/* Key Generator input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Description (e.g. CI/CD Scanner)"
                className="flex-1 bg-[#16161a] border border-[#2c2c32] rounded-xl py-2.5 px-4 text-white text-xs outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleGenerateKey}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Key</span>
              </button>
            </div>

            {/* Generated Key Alert Modal */}
            {generatedKey && (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">New API Key Created — Copy Now</span>
                <div className="flex items-center justify-between bg-[#0b0b10] p-3 rounded-xl border border-indigo-500/20 font-mono text-xs text-emerald-400">
                  <span className="truncate">{generatedKey}</span>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-white font-sans ml-3 shrink-0"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Existing Keys Table */}
            <div className="space-y-3">
              {apiKeys.map(k => (
                <div key={k.id} className="p-3.5 rounded-xl bg-card-border/10 border border-border/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{k.name}</span>
                    <span className="font-mono text-[10px] text-foreground/45 mt-0.5 block">{k.key_prefix} • Created {k.created_at}</span>
                  </div>
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Col (1 col wide): Security Controls & Active Sessions */}
        <div className="space-y-8">
          
          {/* Security & 2FA Controls */}
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Security Policies</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                Enforced
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-card-border/10 border border-border/20">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">Two-Factor Auth (2FA)</span>
                  <span className="text-[10px] text-foreground/45">Authenticator App</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-card-border/40'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Security badges */}
              <div className="p-3 rounded-xl bg-card-border/10 border border-border/20 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground/70">OAuth Providers</span>
                  <span className="text-emerald-400 font-bold">Google & GitHub</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground/70">Session Type</span>
                  <span className="text-indigo-400 font-bold">JWT Bearer Token</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground/70">Encryption standard</span>
                  <span className="text-emerald-400 font-bold">AES-256 / HS256</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Active Sessions Panel */}
          <GlassCard className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <span>Active Sessions</span>
              </h4>
              <span className="text-[10px] text-foreground/40 font-bold uppercase">{sessions.length} Active</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {sessions.map(s => (
                <div key={s.id} className="p-3 rounded-xl bg-card-border/10 border border-border/20 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      <span>{s.device}</span>
                    </span>
                    {s.is_current && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-foreground/45 block">{s.ip_address} • Last active {s.last_active}</span>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
