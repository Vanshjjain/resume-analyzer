import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { ShieldAlert, Users, FileText, Activity, Layers, AlertCircle, RefreshCw } from 'lucide-react';

export const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/logs')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch (err: any) {
      setError("Failed to fetch administrative data. Ensure you have admin rights.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.post(`/api/admin/users/${userId}/role`, {
        role: targetRole
      });
      fetchAdminData(); // Refresh logs and tables
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update role");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            <span>Admin Portal</span>
          </h1>
          <p className="text-foreground/50 text-sm mt-1">Audit active system users, transaction logs, and hardware parameters</p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl border border-border hover:bg-card-border/50 text-foreground transition-all"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">Total User Count</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">{stats.users}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">Total Resumes</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">{stats.resumes}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">Scans Run</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">{stats.analyses}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/10 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">Average Score</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">{stats.average_ats_score}%</p>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Management List */}
        <GlassCard className="space-y-6">
          <h3 className="font-bold text-md text-foreground pb-4 border-b border-border/40">User Accounts Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-foreground/50 font-bold uppercase tracking-wider">
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {users.map(u => (
                  <tr key={u.id} className="text-foreground/80">
                    <td className="py-3.5 font-semibold text-foreground">{u.full_name || 'N/A'}</td>
                    <td className="py-3.5">{u.email}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-widest text-[9px] ${
                        u.role === 'admin' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className="px-2.5 py-1 rounded border border-border hover:bg-card-border/60 font-semibold text-[10px] transition-all"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* System Activity Logs */}
        <GlassCard className="space-y-6">
          <h3 className="font-bold text-md text-foreground pb-4 border-b border-border/40">Active System Log Entries</h3>
          <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex gap-3 text-xs leading-relaxed border-b border-border/10 pb-3 last:border-0 last:pb-0">
                <div className="w-1.5 h-1.5 rounded-full bg-accent/50 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-foreground truncate">{log.user_email}</span>
                    <span className="text-[10px] text-foreground/40 shrink-0">
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-semibold text-primary mt-0.5 text-[11px]">{log.action}</p>
                  <p className="text-foreground/50 text-[10px] mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
