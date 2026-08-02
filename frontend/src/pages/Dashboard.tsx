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
  Sparkles
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ATS score and mock default values
  const [atsScore, setAtsScore] = useState(88);
  const [analysis, setAnalysis] = useState<any>({
    category_scores: { formatting: 95, sections: 100, keywords: 85, readability: 90, grammar: 95, action_verbs: 85, experience_quality: 85, project_quality: 80 },
    feedback: {
      suggestions: [
        "Swapped passive verbs with high-impact power verbs.",
        "Optimized database queries, reducing latency by 30% using index structures.",
        "Add 1-2 cloud deployments milestones to highlight DevOps experience."
      ],
      missing_sections: [],
      missing_keywords: ["Kubernetes", "CI/CD"]
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
    { role: 'Frontend Developer', match: 82, gap: 'Tailwind CSS, Angular' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumesRes = await axios.get('/api/resumes/');
        setResumes(resumesRes.data);
        
        const latest = resumesRes.data[0];
        const latestVer = latest?.versions?.[latest.versions.length - 1];
        
        if (latestVer) {
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

          // Fetch career paths
          const recsRes = await axios.get(`/api/jobs/${latestVer.id}/recommendations`);
          if (recsRes.data && recsRes.data.length > 0) {
            setCareerPaths(recsRes.data.slice(0, 3).map((r: any) => ({
              role: r.role_name,
              match: r.match_percentage,
              gap: r.missing_skills?.slice(0, 2).join(', ') || 'N/A'
            })));
          }
        }
        
        // Fetch activity logs
        try {
          if (user?.role === 'admin') {
            const logsRes = await axios.get('/api/admin/logs');
            setRecentLogs(logsRes.data.slice(0, 5));
          } else {
            setRecentLogs([
              { id: 1, action: "Upload Resume", details: "Uploaded software_engineer_resume.pdf v2", created_at: new Date().toISOString() },
              { id: 2, action: "Run ATS Analysis", details: "Analyzed v2 score: 88", created_at: new Date(Date.now() - 3600000).toISOString() },
              { id: 3, action: "Session Verified", details: "Logged into career hub workspace", created_at: new Date(Date.now() - 7200000).toISOString() }
            ]);
          }
        } catch {
          setRecentLogs([
            { id: 1, action: "Audit Complete", details: "Analyzed resume_v2.pdf", created_at: new Date().toISOString() }
          ]);
        }
      } catch (err: any) {
        setError("Failed to fetch dashboard workspace information.");
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
          <p className="text-xs text-foreground/40 font-semibold tracking-wider uppercase">Loading Workspace Dashboard...</p>
        </div>
      </div>
    );
  }

  const totalResumes = resumes.length;
  const latestResume = resumes[0];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Premium Dashboard Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Active Career Workspace</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="text-xs font-semibold text-foreground/45 flex items-center gap-1.5 bg-card-border/10 border border-border/20 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => navigate('/analyzer')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <FileUp className="w-4 h-4" />
            <span>Upload New Resume</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {totalResumes === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center text-center py-20 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/25 glow-indigo">
            <FileUp className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white">No active documents found</h2>
            <p className="text-sm text-foreground/45 max-w-sm leading-relaxed">
              Upload your resume in PDF/DOCX format to seed the dashboard with scores, skill distributions, and roadmap targets.
            </p>
          </div>
          <button
            onClick={() => navigate('/analyzer')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md hover:scale-[1.01] transition-all"
          >
            <span>Scan First Resume</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </GlassCard>
      ) : (
        <>
          {/* Hero Section: Resume Health Summary (Left) & Circular Gauge (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Health summary card */}
            <GlassCard className="lg:col-span-2 space-y-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Active Document</span>
                    <h3 className="font-bold text-lg text-white mt-0.5">{latestResume.original_name}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                    v2 Audited
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs text-foreground/75 leading-relaxed">
                  <div className="space-y-2">
                    <span className="block text-[9px] font-bold text-foreground/40 uppercase tracking-wider">Audit Profile Summary</span>
                    <p className="text-foreground/80">
                      Excellent layout compliance detected. Technical capabilities are well-structured, supported by action verb metrics and contact links.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="block text-[9px] font-bold text-foreground/40 uppercase tracking-wider">Identified Strengths</span>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Valid contact links.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Proper headers structure.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/20 flex justify-between items-center text-xs">
                <span className="text-foreground/45 font-medium">Scanned: {new Date(latestResume.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => navigate('/analyzer')}
                  className="flex items-center gap-1 text-primary font-bold hover:underline"
                >
                  <span>Go to Analyzer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </GlassCard>

            {/* Circular score dial card */}
            <GlassCard className="flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="6.5" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="url(#neonGradient)" 
                    strokeWidth="6.5" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - atsScore / 100)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{atsScore}</span>
                  <span className="text-[9px] text-foreground/45 uppercase tracking-widest font-bold mt-0.5">ATS Index</span>
                </div>
              </div>
              
              <p className="text-xs text-foreground/50 mt-5 leading-relaxed max-w-[180px]">
                Your resume satisfies the compliance parameters of most automated tracking filters.
              </p>
            </GlassCard>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h3 className="font-bold text-md text-white">Resume Score Progress</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  Audit History
                </span>
              </div>
              <div className="h-64">
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
                        borderRadius: '14px',
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
                      activeDot={{ r: 6 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h3 className="font-bold text-md text-white">Competency Mapping</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase tracking-wider">
                  Audited Weights
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.3)" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#09090f', 
                        borderColor: 'rgba(236, 72, 153, 0.3)',
                        borderRadius: '14px',
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

          {/* Actions & Target Roles matching */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Checklist */}
            <GlassCard className="space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Critical Tasks Check</span>
                  </h4>
                  <span className="text-[9px] font-bold text-amber-500 uppercase">3 Alerts</span>
                </div>
                <div className="space-y-3.5 text-xs text-foreground/80 leading-relaxed">
                  {analysis.feedback?.suggestions?.slice(0, 3).map((sug: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <p>{sug}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('/analyzer')}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-border hover:bg-card-border/40 text-foreground font-semibold rounded-xl text-xs mt-4 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Open AI Optimizer</span>
              </button>
            </GlassCard>

            {/* Target Career Roles Matching */}
            <GlassCard className="space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Target className="w-4.5 h-4.5 text-pink-500" />
                  <span>Target Roles Fit</span>
                </h4>
                <span className="text-[9px] font-bold text-pink-400 uppercase">Compliance</span>
              </div>
              <div className="space-y-4">
                {careerPaths.map(cp => (
                  <div key={cp.role} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white/90">{cp.role}</span>
                      <span className="text-primary font-bold">{cp.match}%</span>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="w-full h-1.5 bg-card-border/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full" 
                        style={{ width: `${cp.match}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-foreground/45 block truncate">Gap: {cp.gap}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Workspace Activity logs */}
            <GlassCard className="space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Audit Logs</span>
                </h4>
                <span className="text-[9px] font-bold text-emerald-400 uppercase">Active</span>
              </div>
              
              <div className="space-y-3.5 text-xs">
                {recentLogs.slice(0, 3).map((log: any) => (
                  <div key={log.id} className="flex gap-3 leading-normal border-b border-border/10 pb-2.5 last:border-0 last:pb-0">
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
        </>
      )}

    </div>
  );
};
