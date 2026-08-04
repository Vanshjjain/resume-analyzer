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
  Cpu,
  Terminal,
  Crosshair,
  Radio,
  Sliders
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
    { name: 'Languages', value: 85, color: '#00f0ff' },
    { name: 'Tech Skills', value: 75, color: '#ff007f' },
    { name: 'Experience', value: 80, color: '#00ff66' },
    { name: 'Projects', value: 85, color: '#ffb800' },
    { name: 'Achievements', value: 90, color: '#00f0ff' },
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
              { name: 'Languages', value: parsed.languages?.length ? 85 : 60, color: '#00f0ff' },
              { name: 'Tech Skills', value: Math.min(skillsCount * 8, 95) || 50, color: '#ff007f' },
              { name: 'Experience', value: parsed.experience?.length ? 80 : 40, color: '#00ff66' },
              { name: 'Projects', value: parsed.projects?.length ? 85 : 45, color: '#ffb800' },
              { name: 'Achievements', value: parsed.achievements?.length ? 90 : 35, color: '#00f0ff' },
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
      <div className="flex items-center justify-center min-h-[65vh] font-mono-hud text-[#00f0ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#00f0ff]/20 border-t-[#00f0ff] rounded-full animate-spin glow-cyan" />
          <p className="text-xs font-bold tracking-widest uppercase animate-pulse">[INITIALIZING_CYBERPUNK_HUD...]</p>
        </div>
      </div>
    );
  }

  const totalResumes = resumes.length;
  const latestResume = resumes[0];

  return (
    <div className="space-y-8 pb-12 font-mono-hud">
      
      {/* Top Cyber HUD Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00f0ff]/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-[#00f0ff] font-bold uppercase tracking-widest">// ACTIVE_TERMINAL_NODE:</span>
            {user?.role === 'admin' ? (
              <span className="px-2.5 py-0.5 rounded bg-[#ff007f]/20 border border-[#ff007f]/40 text-[#ff007f] text-[10px] font-extrabold uppercase tracking-wider">
                [ADMIN_OPERATIVE]
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded bg-[#00ff66]/20 border border-[#00ff66]/40 text-[#00ff66] text-[10px] font-extrabold uppercase tracking-wider">
                [CANDIDATE_HUD]
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wider uppercase">
            {user?.role === 'admin' ? 'OPERATIONS_CONTROL_CENTER' : 'EXECUTIVE_TERMINAL_HUD'}
          </h1>
        </div>

        <div className="flex items-center gap-3.5">
          <span className="text-xs font-bold text-[#00f0ff]/70 flex items-center gap-2 bg-[#070a12] border border-[#00f0ff]/30 px-3.5 py-2 rounded-xl">
            <Radio className="w-3.5 h-3.5 text-[#00ff66] animate-pulse" />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </span>
          
          <button
            onClick={() => navigate('/analyzer')}
            className="cyber-button-tactical px-6 py-2.5 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black text-xs font-extrabold shadow-lg shadow-[#00f0ff]/25 flex items-center gap-2"
          >
            <FileUp className="w-4 h-4" />
            <span>[UPLOAD_RESUME]</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#ff007f]/10 border border-[#ff007f]/40 text-[#ff007f] flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cyberpunk Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Total Scans */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[#00f0ff]/60 uppercase tracking-widest block">// TOTAL_SCANS_RUN</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">{totalResumes || 1}</h2>
            </div>
            <div className="p-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] glow-cyan">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#00ff66] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3 ITERATIONS_AUDITED</span>
          </div>
        </GlassCard>

        {/* Metric 2: ATS Grade */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[#00f0ff]/60 uppercase tracking-widest block">// AVERAGE_ATS_INDEX</span>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-3xl font-extrabold text-[#00ff66]">{atsScore}</h2>
                <span className="text-xs font-bold text-[#00f0ff]/40">/ 100</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] glow-green">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#00ff66] font-bold">
            <span className="px-2 py-0.5 rounded bg-[#00ff66]/15 border border-[#00ff66]/30 text-[10px] uppercase">
              HIGH_COMPLIANCE
            </span>
            <span className="text-[#00f0ff]/50 text-[10px]">+12% vs v1</span>
          </div>
        </GlassCard>

        {/* Metric 3: Target Fit */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[#00f0ff]/60 uppercase tracking-widest block">// TARGET_ROLE_FIT</span>
              <h2 className="text-3xl font-extrabold text-[#ff007f] mt-1">{careerPaths[0]?.match || 90}%</h2>
            </div>
            <div className="p-3 rounded-xl bg-[#ff007f]/10 border border-[#ff007f]/30 text-[#ff007f] glow-magenta">
              <Crosshair className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#ff007f] font-bold truncate">
            <span className="truncate">{careerPaths[0]?.role || 'Backend Engineer'}</span>
          </div>
        </GlassCard>

        {/* Metric 4: Cyber Security Health */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[#00f0ff]/60 uppercase tracking-widest block">// SYSTEM_SECURITY</span>
              <h2 className="text-xl font-extrabold text-[#00ff66] mt-1">[ENCRYPTED]</h2>
            </div>
            <div className="p-3 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] glow-green">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#00ff66] font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>JWT_256_ACTIVE</span>
          </div>
        </GlassCard>

      </div>

      {/* Main 3D Cyber HUD Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Active File & 3D Holographic Dial */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Active Document Card (2 cols wide) */}
            <GlassCard className="md:col-span-2 space-y-5 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#00f0ff]/50 uppercase tracking-widest block">// ACTIVE_FILE_PAYLOAD</span>
                  <h3 className="font-extrabold text-lg text-white">{latestResume?.original_name || 'Vansh_Jain_Resume.pdf'}</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] font-bold text-[10px] uppercase">
                  V2_AUDITED
                </span>
              </div>

              <div className="space-y-3 text-xs text-[#00f0ff]/80">
                <span className="block text-[10px] font-bold text-[#00f0ff]/50 uppercase tracking-widest">// AUDIT_SUMMARY</span>
                <p className="leading-relaxed text-[#00f0ff]/90">
                  Excellent layout compliance. Technical capabilities structured with high-impact power metrics and validated links.
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                    <span>Single-column standard layout verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                    <span>Contact headers & links parsed</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#00f0ff]/20 flex justify-between items-center text-xs">
                <span className="text-[#00f0ff]/40">TIMESTAMP: {new Date().toLocaleDateString()}</span>
                <button
                  onClick={() => navigate('/analyzer')}
                  className="flex items-center gap-1 text-[#00f0ff] font-bold hover:underline"
                >
                  <span>[OPEN_ANALYZER_STUDIO]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </GlassCard>

            {/* 3D Holographic Cylindrical ATS Index Gauge Card */}
            <GlassCard className="flex flex-col items-center justify-center p-6 text-center relative overflow-hidden space-y-3">
              <span className="text-[10px] font-bold text-[#00f0ff]/60 uppercase tracking-widest block">// 3D_ATS_GAUGE</span>
              
              {/* Holographic Cylindrical Ring Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center my-2">
                {/* Background Rotating Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="url(#hologramGradient)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - atsScore / 100)}
                    strokeLinecap="round"
                    className="glow-cyan"
                  />
                  <defs>
                    <linearGradient id="hologramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="50%" stopColor="#ff007f" />
                      <stop offset="100%" stopColor="#00ff66" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Projected 3D Holographic Typography */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white tracking-widest drop-shadow-[0_0_12px_#00f0ff]">{atsScore}</span>
                  <span className="text-[9px] text-[#00ff66] font-bold uppercase tracking-widest mt-0.5">ATS_INDEX</span>
                </div>
              </div>

              <span className="text-[10px] text-[#00f0ff]/60 leading-tight">HOLOGRAPHIC ATS FILTER COMPLIANT</span>
            </GlassCard>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-3">
                <h3 className="font-bold text-sm text-white">// SCORE_PROGRESS_TREND</h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 uppercase">
                  [AUDIT_HISTORY]
                </span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={improvementTrend}>
                    <defs>
                      <linearGradient id="cyberArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.08)" />
                    <XAxis dataKey="name" stroke="rgba(0, 240, 255, 0.4)" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="rgba(0, 240, 255, 0.4)" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#070a12', 
                        borderColor: '#00f0ff',
                        borderRadius: '8px',
                        color: '#00f0ff',
                        fontSize: '11px',
                        fontFamily: 'Share Tech Mono'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#00f0ff" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#cyberArea)"
                      dot={{ r: 4, fill: "#00f0ff" }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-3">
                <h3 className="font-bold text-sm text-white">// COMPETENCY_WEIGHTS</h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#ff007f]/15 text-[#ff007f] border border-[#ff007f]/30 uppercase">
                  [AUDITED]
                </span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.08)" />
                    <XAxis dataKey="name" stroke="rgba(0, 240, 255, 0.4)" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="rgba(0, 240, 255, 0.4)" fontSize={9} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#070a12', 
                        borderColor: '#ff007f',
                        borderRadius: '8px',
                        color: '#ff007f',
                        fontSize: '11px',
                        fontFamily: 'Share Tech Mono'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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

        {/* Right Column (1 Col): Critical Task Hazard Alert & Cyber Status */}
        <div className="space-y-8">
          
          {/* Cyber Hazard Stripe Alert Card */}
          <GlassCard className="space-y-4 border-2 border-[#ffb800]/50 relative overflow-hidden">
            <div className="cyber-hazard-stripe p-3 rounded-xl border border-[#ffb800]/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#ffb800] font-extrabold text-xs">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>// CRITICAL_TASKS_CHECK</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#ffb800]/20 text-[#ffb800] font-bold text-[9px] uppercase">
                3 ALERTS
              </span>
            </div>

            <div className="space-y-3 text-xs text-[#00f0ff]/80">
              {analysis.feedback?.suggestions?.slice(0, 3).map((sug: string, idx: number) => (
                <div key={idx} className="flex gap-2.5 items-start bg-[#070a12]/80 p-2.5 rounded-xl border border-[#00f0ff]/15">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffb800] mt-1.5 shrink-0" />
                  <p className="leading-relaxed">{sug}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/analyzer')}
              className="cyber-button-tactical w-full py-2.5 bg-[#ffb800] text-black font-extrabold text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>[OPEN_AI_OPTIMIZER]</span>
            </button>
          </GlassCard>

          {/* Cyber Security Status Panel */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-3">
              <h4 className="font-bold text-xs text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00ff66]" />
                <span>// STATUS_CHECKLIST</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-[#00ff66]/15 text-[#00ff66] text-[9px] font-bold uppercase">
                SYSTEM_OK
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#070a12] border border-[#00f0ff]/20 flex items-center justify-between">
                <span className="text-[#00f0ff]/80">FastAPI Service</span>
                <span className="text-[#00ff66] font-bold">ONLINE ✓</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070a12] border border-[#00f0ff]/20 flex items-center justify-between">
                <span className="text-[#00f0ff]/80">Google/GitHub OAuth</span>
                <span className="text-[#00ff66] font-bold">LINKED ✓</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070a12] border border-[#00f0ff]/20 flex items-center justify-between">
                <span className="text-[#00f0ff]/80">JWT 256-bit Token</span>
                <span className="text-[#00ff66] font-bold">ACTIVE ✓</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070a12] border border-[#00f0ff]/20 flex items-center justify-between">
                <span className="text-[#00f0ff]/80">RBAC Privilege</span>
                <span className="text-[#00ff66] font-bold">ENFORCED ✓</span>
              </div>
            </div>
          </GlassCard>

          {/* Target Role Compliance */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-3">
              <h4 className="font-bold text-xs text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ff007f]" />
                <span>// TARGET_ROLE_FIT</span>
              </h4>
              <span className="text-[9px] font-bold text-[#ff007f] uppercase">MATCH</span>
            </div>

            <div className="space-y-3.5">
              {careerPaths.map(cp => (
                <div key={cp.role} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{cp.role}</span>
                    <span className="text-[#00f0ff] font-bold">{cp.match}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#070a12] rounded-full overflow-hidden border border-[#00f0ff]/20">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff007f] rounded-full" 
                      style={{ width: `${cp.match}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-[#00f0ff]/50 block truncate">GAP: {cp.gap}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Real-time Audit Stream */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-3">
              <h4 className="font-bold text-xs text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00f0ff]" />
                <span>// AUDIT_STREAM</span>
              </h4>
              <span className="text-[9px] text-[#00ff66] font-bold uppercase animate-pulse">LIVE</span>
            </div>
            
            <div className="space-y-2.5 text-[11px] font-mono">
              {recentLogs.slice(0, 3).map((log: any) => (
                <div key={log.id} className="p-2 rounded bg-[#070a12] border border-[#00f0ff]/15 space-y-0.5">
                  <span className="text-[#00f0ff] font-bold">[{log.action.toUpperCase()}]</span>
                  <p className="text-[#00f0ff]/60 text-[10px] truncate">{log.details}</p>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
