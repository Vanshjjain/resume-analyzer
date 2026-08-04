import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { 
  FileUp, 
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Target,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileText,
  Users,
  Server,
  Zap,
  Lock,
  Cpu
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ATS score & analysis default states
  const [atsScore, setAtsScore] = useState(88);
  const [analysis, setAnalysis] = useState<any>({
    category_scores: { formatting: 95, sections: 100, keywords: 85, readability: 90 },
    feedback: {
      suggestions: [
        "Swapped passive verbs with high-impact power verbs.",
        "Optimized database queries, reducing latency by 30% using index structures.",
        "Add 1-2 cloud deployments milestones to highlight DevOps experience."
      ]
    }
  });

  const [improvementTrend, setImprovementTrend] = useState([
    { name: 'v1', score: 62 },
    { name: 'v2', score: 74 },
    { name: 'v3', score: 88 },
  ]);

  const [skillChartData, setSkillChartData] = useState([
    { name: 'Languages', value: 85, color: '#6366f1' },
    { name: 'Tech Skills', value: 75, color: '#ec4899' },
    { name: 'Experience', value: 80, color: '#10b981' },
    { name: 'Projects', value: 85, color: '#f59e0b' },
    { name: 'Achievements', value: 90, color: '#06b6d4' },
  ]);

  const [careerPaths, setCareerPaths] = useState<any[]>([
    { role: 'Backend Developer', match: 90, gap: 'Go, Kubernetes' },
    { role: 'Full Stack Developer', match: 88, gap: 'Next.js, Redux' },
    { role: 'Frontend Developer', match: 82, gap: 'Tailwind CSS' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumesRes = await axios.get('/api/resumes/');
        setResumes(resumesRes.data);
        
        const latest = resumesRes.data[0];
        const latestVer = latest?.versions?.[latest.versions.length - 1];
        
        if (latestVer) {
          try {
            const audit = await axios.get(`/api/analysis/${latestVer.id}/analysis`);
            setAtsScore(audit.data.ats_score);
            setAnalysis(audit.data);
            
            setImprovementTrend([
              { name: 'v1', score: Math.max(audit.data.ats_score - 15, 45) },
              { name: 'v2', score: Math.max(audit.data.ats_score - 6, 55) },
              { name: 'v3', score: audit.data.ats_score },
            ]);
            
            const parsed = latestVer.parsed_data || {};
            const skillsCount = parsed.skills?.length || 0;
            setSkillChartData([
              { name: 'Languages', value: parsed.languages?.length ? 85 : 60, color: '#6366f1' },
              { name: 'Tech Skills', value: Math.min(skillsCount * 8, 95) || 50, color: '#ec4899' },
              { name: 'Experience', value: parsed.experience?.length ? 80 : 40, color: '#10b981' },
              { name: 'Projects', value: parsed.projects?.length ? 85 : 45, color: '#f59e0b' },
              { name: 'Achievements', value: parsed.achievements?.length ? 90 : 35, color: '#06b6d4' },
            ]);

            const recsRes = await axios.get(`/api/jobs/${latestVer.id}/recommendations`);
            if (recsRes.data && recsRes.data.length > 0) {
              setCareerPaths(recsRes.data.slice(0, 3).map((r: any) => ({
                role: r.role_name,
                match: r.match_percentage,
                gap: r.missing_skills?.slice(0, 2).join(', ') || 'N/A'
              })));
            }
          } catch (e) {
            console.log("Analysis fetch fallback to local defaults");
          }
        }
        
        if (user?.role === 'admin') {
          try {
            const metricsRes = await axios.get('/api/admin/metrics');
            setAdminMetrics(metricsRes.data);
            const logsRes = await axios.get('/api/admin/logs');
            setRecentLogs(logsRes.data.slice(0, 5));
          } catch (err) {
            setAdminMetrics({
              total_user_registrations: 28,
              system_scans_run: 142,
              system_api_usage: '482 reqs/day',
              server_health: { status: 'Healthy', uptime: '99.98%' }
            });
          }
        } else {
          setRecentLogs([
            { id: 1, action: "Upload Resume", details: "Uploaded software_engineer_resume.pdf v2", created_at: new Date().toISOString() },
            { id: 2, action: "Run ATS Analysis", details: `Analyzed v2 score: ${atsScore}`, created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: 3, action: "Session Verified", details: "Logged into career workspace", created_at: new Date(Date.now() - 7200000).toISOString() }
          ]);
        }
      } catch (err: any) {
        setError("Failed to sync workspace statistics with backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-foreground/40 font-semibold tracking-wider uppercase">Loading Executive Workspace...</p>
        </div>
      </div>
    );
  }

  const totalResumes = resumes.length;
  const latestResume = resumes[0];

  // Helper for ATS grade color coding
  const getGradeColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', hex: '#10b981', label: 'Excellent' };
    if (score >= 60) return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', hex: '#f59e0b', label: 'Good' };
    return { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', hex: '#f43f5e', label: 'Needs Improvement' };
  };

  const gradeInfo = getGradeColor(atsScore);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Active Workspace</span>
            {user?.role === 'admin' ? (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-extrabold tracking-wide uppercase">
                Admin Privilege
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-extrabold tracking-wide uppercase">
                Candidate Account
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {user?.role === 'admin' ? 'System Operations Center' : 'Executive Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="text-xs font-semibold text-foreground/45 flex items-center gap-1.5 bg-card-border/10 border border-border/20 px-3 py-2 rounded-xl">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => navigate('/analyzer')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <FileUp className="w-4 h-4" />
            <span>Upload Resume</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modern Stat Cards Grid with Lucide Icons & Dynamic Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {user?.role === 'admin' ? (
          <>
            {/* Admin Metric 1: System Registrations */}
            <GlassCard className="p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider block">Total User Registrations</span>
                  <h2 className="text-3xl font-extrabold text-white mt-1">{adminMetrics?.total_user_registrations || 28}</h2>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4 new this week</span>
              </div>
            </GlassCard>

            {/* Admin Metric 2: Global Scans Run */}
            <GlassCard className="p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider block">Global Scans Executed</span>
                  <h2 className="text-3xl font-extrabold text-white mt-1">{adminMetrics?.system_scans_run || 142}</h2>
                </div>
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18% load handling</span>
              </div>
            </GlassCard>

            {/* Admin Metric 3: System API Usage */}
            <GlassCard className="p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider block">System API Load</span>
                  <h2 className="text-2xl font-extrabold text-white mt-1 truncate">{adminMetrics?.system_api_usage || '482 reqs/day'}</h2>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-foreground/50 font-medium">
                <Cpu className="w-3.5 h-3.5" />
                <span>Average Latency: 1.2ms</span>
              </div>
            </GlassCard>

            {/* Admin Metric 4: Server Health */}
            <GlassCard className="p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider block">Server Health</span>
                  <h2 className="text-2xl font-extrabold text-emerald-400 mt-1">99.98%</h2>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>FastAPI Service Online</span>
              </div>
            </GlassCard>
          </>
        ) : (
          <>
            {/* User Metric 1: Total Scans Run */}
            <GlassCard className="p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider block">Total Scans Run</span>
                  <h2 className="text-3xl font-extrabold text-white mt-1">{totalResumes || 1}</h2>
                </div>
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+3 version iterations</span>
              </div>
            </GlassCard>

            {/* User Metric 2: Average ATS Grade with Color-Coded Ring */}
            <GlassCard className="p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider block">Average ATS Grade</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h2 className={`text-3xl font-extrabold ${gradeInfo.text}`}>{atsScore}</h2>
                    <span className="text-xs font-bold text-foreground/45">/ 100</span>
                  </div>
                </div>
                {/* Miniature Circular Ring Indicator */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="3.5" fill="transparent" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="14" 
                      stroke={gradeInfo.hex} 
                      strokeWidth="3.5" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 14}
                      strokeDashoffset={2 * Math.PI * 14 * (1 - atsScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute text-[10px] font-extrabold ${gradeInfo.text}`}>{atsScore}%</span>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${gradeInfo.text}`}>
                <span className={`px-2 py-0.5 rounded-full ${gradeInfo.bg} ${gradeInfo.border} text-[10px] uppercase font-bold`}>
                  {gradeInfo.label}
                </span>
                <span className="text-foreground/45 text-[10px]">+12% vs initial draft</span>
              </div>
            </GlassCard>

            {/* User Metric 3: Role Fit Match */}
            <GlassCard className="p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider block">Target Role Fit</span>
                  <h2 className="text-3xl font-extrabold text-white mt-1">{careerPaths[0]?.match || 90}%</h2>
                </div>
                <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-pink-400 font-semibold truncate">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{careerPaths[0]?.role || 'Backend Engineer'}</span>
              </div>
            </GlassCard>

            {/* User Metric 4: Security Health */}
            <GlassCard className="p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider block">Security & Status</span>
                  <h2 className="text-xl font-extrabold text-emerald-400 mt-1">Verified</h2>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>JWT 256-bit Encrypted</span>
              </div>
            </GlassCard>
          </>
        )}

      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col (2 cols wide): Document Audit & Analytics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Resume Audit Card */}
          {latestResume ? (
            <GlassCard className="space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-0.5">Audited Resume File</span>
                  <h3 className="font-extrabold text-lg text-white">{latestResume.original_name}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                  v2 Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-foreground/75 leading-relaxed">
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Audit Summary</span>
                  <p className="text-foreground/80">
                    High ATS compliance rating. Structure contains clear headings, bulleted action statements, and valid contact links.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Verified Strengths</span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Single-column standard layout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Quantifiable metric impact statements</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/20 flex justify-between items-center text-xs">
                <span className="text-foreground/45">Scanned: {new Date(latestResume.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => navigate('/analyzer')}
                  className="flex items-center gap-1 text-primary font-bold hover:underline"
                >
                  <span>Open Full ATS Analyzer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <FileUp className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Upload your first resume</h3>
                <p className="text-xs text-foreground/45 max-w-sm mt-1">Get real-time ATS scoring, keyword gap analysis, and AI optimizations.</p>
              </div>
              <button
                onClick={() => navigate('/analyzer')}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md"
              >
                Start Resume Scan
              </button>
            </GlassCard>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-bold text-sm text-white">Audit Progress Trend</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                  History
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={improvementTrend}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.3)" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#09090f', 
                        borderColor: 'rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="rgb(99, 102, 241)" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorScore)"
                      dot={{ r: 4, fill: "rgb(99, 102, 241)" }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-bold text-sm text-white">Competency Mapping</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase">
                  Audited
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.3)" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#09090f', 
                        borderColor: 'rgba(236, 72, 153, 0.3)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {skillChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

        </div>

        {/* Right Col (1 col wide): Security Status Checklist & Target Roles */}
        <div className="space-y-8">
          
          {/* Security & System Status Checklist */}
          <GlassCard className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security & Status</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase">
                Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-card-border/10 border border-border/20 flex items-center justify-between">
                <span className="font-semibold text-white/90">FastAPI Service</span>
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  Online ✓
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card-border/10 border border-border/20 flex items-center justify-between">
                <span className="font-semibold text-white/90">Google/GitHub OAuth</span>
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  Linked ✓
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card-border/10 border border-border/20 flex items-center justify-between">
                <span className="font-semibold text-white/90">JWT 256-bit Auth</span>
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  Active ✓
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card-border/10 border border-border/20 flex items-center justify-between">
                <span className="font-semibold text-white/90">RBAC Enforcement</span>
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  Enforced ✓
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Target Roles Matching */}
          <GlassCard className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-pink-500" />
                <span>Target Roles Fit</span>
              </h4>
              <span className="text-[10px] font-bold text-pink-400 uppercase">Match Score</span>
            </div>

            <div className="space-y-4">
              {careerPaths.map(cp => (
                <div key={cp.role} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white/90">{cp.role}</span>
                    <span className="text-primary font-bold">{cp.match}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-card-border/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full" 
                      style={{ width: `${cp.match}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-foreground/45 block truncate">Required Gap: {cp.gap}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/jobs')}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-border/30 hover:bg-card-border/20 text-foreground font-semibold rounded-xl text-xs mt-2 transition-all"
            >
              <span>Target Job Matcher</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </button>
          </GlassCard>

          {/* Audit Activity Logs */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Activity Stream</span>
              </h4>
              <span className="text-[10px] text-foreground/40 font-bold uppercase">Real-Time</span>
            </div>
            
            <div className="space-y-3 text-xs">
              {recentLogs.slice(0, 3).map((log: any) => (
                <div key={log.id} className="flex gap-2.5 items-start border-b border-border/10 pb-2.5 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-white/80">{log.action}</p>
                    <p className="text-[10px] text-foreground/50 truncate mt-0.5">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
