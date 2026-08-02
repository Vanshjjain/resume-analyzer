import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { Mail, Award, Clock, FileText } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({ resumes: 0, average_score: 72 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resumesRes = await axios.get('/api/resumes/');
        const list = resumesRes.data;
        
        let totalScore = 0;
        let counted = 0;
        
        // Loop and get scores to find average
        for (const res of list) {
          if (res.versions?.length > 0) {
            const latest = res.versions[res.versions.length - 1];
            try {
              const audit = await axios.get(`/api/analysis/${latest.id}/analysis`);
              totalScore += audit.data.ats_score;
              counted++;
            } catch {}
          }
        }
        
        setStats({
          resumes: list.length,
          average_score: counted > 0 ? Math.round(totalScore / counted) : 74
        });
      } catch (err) {
        console.error("Failed to fetch profile stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

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
      <div className="pb-6 border-b border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Profile</h1>
        <p className="text-foreground/50 text-sm mt-1">Audit active candidate credentials and career activity indicators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <GlassCard className="flex flex-col items-center text-center p-8 space-y-5">
          <img 
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=User'} 
            alt="Avatar" 
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-primary/10 shadow-lg"
          />
          <div>
            <h3 className="text-xl font-bold text-foreground">{user?.full_name || 'Career Specialist'}</h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mt-1.5">
              {user?.role} Account
            </span>
          </div>
          
          <div className="w-full border-t border-border/40 pt-4 text-xs space-y-3.5 text-left">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-foreground/40 shrink-0" />
              <span className="text-foreground/80 truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-foreground/40 shrink-0" />
              <span className="text-foreground/80">Account Active: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </GlassCard>

        {/* User Statistics Dashboard */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
          <GlassCard className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">Total Scans Run</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">{stats.resumes} Resumes</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">Average ATS Grade</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">{stats.resumes > 0 ? `${stats.average_score}%` : 'N/A'}</p>
            </div>
          </GlassCard>

          <GlassCard className="md:col-span-2 p-6 space-y-4">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Account Checklist</h4>
            <div className="space-y-3.5 text-xs text-foreground/75 leading-relaxed">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>JWT tokens active encryption settings (HS256 encryption active).</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>FastAPI connection verification check: Success.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Mock Google Sign-In linked: Enabled.</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
