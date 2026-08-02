import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { 
  FileUp, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Trash2, 
  Plus, 
  Clipboard, 
  Check, 
  AlertCircle
} from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const location = useLocation();
  
  // Resumes list
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [currentVersion, setCurrentVersion] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState('v1');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Rewrite state
  const [rewriteType, setRewriteType] = useState('experience');
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteResult, setRewriteResult] = useState<any>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Page level loadings
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async (selectId?: number) => {
    try {
      const res = await axios.get('/api/resumes/');
      setResumes(res.data);
      
      // Auto select first or state-passed resume
      const targetId = selectId || location.state?.selectedResumeId || res.data[0]?.id;
      if (targetId) {
        setSelectedResumeId(targetId);
      }
    } catch (err) {
      console.error("Failed to load resumes", err);
    } finally {
      setIsLoading(false);
    }
  };

  // When selected resume changes, auto-select latest version
  useEffect(() => {
    if (selectedResumeId) {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);
      if (selectedResume && selectedResume.versions?.length > 0) {
        const latest = selectedResume.versions[selectedResume.versions.length - 1];
        setSelectedVersionId(latest.id);
      } else {
        setSelectedVersionId(null);
        setCurrentVersion(null);
        setAnalysis(null);
      }
    }
  }, [selectedResumeId, resumes]);

  // When selected version changes, fetch details & analysis
  useEffect(() => {
    if (selectedVersionId) {
      fetchVersionDetails(selectedVersionId);
    }
  }, [selectedVersionId]);

  const fetchVersionDetails = async (versionId: number) => {
    try {
      const verRes = await axios.get(`/api/resumes/versions/${versionId}`);
      setCurrentVersion(verRes.data);
      
      const analysisRes = await axios.get(`/api/analysis/${versionId}/analysis`);
      setAnalysis(analysisRes.data);
    } catch (err) {
      console.error("Failed to fetch version details", err);
    }
  };

  // Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('version_name', versionName);

    try {
      let response;
      if (selectedResumeId && versionName !== 'v1') {
        // Upload version to existing resume
        response = await axios.post(`/api/resumes/${selectedResumeId}/new-version`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new resume
        response = await axios.post('/api/resumes/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // Reset upload fields
      setFile(null);
      setVersionName('v1');
      
      // Reload resumes and select this one
      const uploadedVersion = response.data;
      await fetchResumes(uploadedVersion.resume_id);
      setSelectedVersionId(uploadedVersion.id);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to upload and analyze document.');
    } finally {
      setIsUploading(false);
    }
  };

  // AI Rewrite handler
  const handleRewrite = async () => {
    if (!rewriteInput.trim()) return;
    setIsRewriting(true);
    setRewriteResult(null);
    try {
      const res = await axios.post('/api/analysis/rewrite', {
        section_type: rewriteType,
        text: rewriteInput
      });
      setRewriteResult(res.data);
    } catch (err) {
      console.error("Rewrite failed", err);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopy = () => {
    if (rewriteResult?.rewritten_text) {
      navigator.clipboard.writeText(rewriteResult.rewritten_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteResume = async (id: number) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await axios.delete(`/api/resumes/${id}`);
        fetchResumes();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Resume Analyzer</h1>
          <p className="text-foreground/50 text-sm mt-1">Grade and structure your resume with full AI checkpoints</p>
        </div>
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {resumes.length > 0 && (
            <>
              <select
                value={selectedResumeId || ''}
                onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none text-foreground"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.original_name}</option>
                ))}
              </select>

              {selectedResume?.versions?.length > 0 && (
                <select
                  value={selectedVersionId || ''}
                  onChange={(e) => setSelectedVersionId(Number(e.target.value))}
                  className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none text-foreground"
                >
                  {selectedResume.versions.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.version_name}</option>
                  ))}
                </select>
              )}

              {selectedResumeId && (
                <button
                  onClick={() => handleDeleteResume(selectedResumeId)}
                  className="p-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors"
                  title="Delete Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Upload & Core Analysis */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upload widget */}
          <GlassCard className="space-y-6">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <FileUp className="w-5 h-5 text-primary" />
              <span>Analyze New Document</span>
            </h3>
            
            {uploadError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer relative bg-card-border/5">
                <input 
                  type="file" 
                  accept=".pdf,.docx" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileUp className="w-8 h-8 text-foreground/40 mb-3" />
                <p className="text-sm font-semibold text-foreground">
                  {file ? file.name : "Drag & Drop or Click to browse"}
                </p>
                <p className="text-xs text-foreground/50 mt-1">PDF or DOCX files up to 5MB</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Version Name</label>
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="v1, v2, v3..."
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none text-foreground"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isUploading || !file}
                    className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Run Audit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>

          {/* ATS Grading Results */}
          {analysis && (
            <GlassCard className="space-y-8">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">ATS Grading Analysis</h3>
                  <p className="text-xs text-foreground/50 mt-0.5">Based on formatting and section audits</p>
                </div>
                {selectedVersionId && (
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/analysis/${selectedVersionId}/report`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-card-border/50 text-xs font-bold text-foreground transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Gauge Score */}
                <div className="flex flex-col items-center justify-center p-4 bg-card-border/10 rounded-2xl border border-border/20 text-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(var(--border), 0.3)" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        stroke="rgb(var(--primary))" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - analysis.ats_score / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-foreground">{analysis.ats_score}</span>
                      <span className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">Grade</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground/80 mt-4">Compliance Rating</span>
                </div>

                {/* Subcategory Bars */}
                <div className="md:col-span-2 space-y-4">
                  {Object.entries(analysis.category_scores).map(([cat, score]: any) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>{cat.replace("_", " ").toUpperCase()}</span>
                        <span>{score}%</span>
                      </div>
                      <div className="w-full h-2 bg-card-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${score}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Suggestions */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Improvement Checkpoints</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card-border/10 rounded-2xl p-4 border border-border/20 space-y-3">
                    <p className="font-bold text-xs text-amber-500 uppercase tracking-wider">Audit Recommendations</p>
                    <ul className="space-y-2">
                      {analysis.feedback.suggestions?.map((sug: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 text-xs text-foreground/80 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-card-border/10 rounded-2xl p-4 border border-border/20 space-y-4">
                    <div>
                      <p className="font-bold text-xs text-red-400 uppercase tracking-wider mb-2">Missing Content Sections</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.feedback.missing_sections?.length > 0 ? (
                          analysis.feedback.missing_sections.map((sec: string) => (
                            <span key={sec} className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                              {sec}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> All sections detected
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-xs text-pink-400 uppercase tracking-wider mb-2">Missing Industry Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.feedback.missing_keywords?.length > 0 ? (
                          analysis.feedback.missing_keywords.map((kw: string) => (
                            <span key={kw} className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Good keyword diversity
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Side: Parsed Fields & AI Rewrite Widget */}
        <div className="space-y-8">
          
          {/* AI Rewrite Widget */}
          <GlassCard className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-md text-foreground">AI Bullet-Point Optimizer</h3>
                <p className="text-[10px] text-foreground/50">Rewrite passive items with power verbs</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Section Context</label>
                <select
                  value={rewriteType}
                  onChange={(e) => setRewriteType(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none text-foreground"
                >
                  <option value="experience">Professional Experience</option>
                  <option value="project">Project Description</option>
                  <option value="summary">Summary & Profile</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Original Bullet</label>
                <textarea
                  value={rewriteInput}
                  onChange={(e) => setRewriteInput(e.target.value)}
                  placeholder="e.g. Worked on building user dashboard features using React."
                  rows={4}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none text-foreground resize-none"
                />
              </div>

              <button
                onClick={handleRewrite}
                disabled={isRewriting || !rewriteInput.trim()}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isRewriting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Optimize with AI</span>
                  </>
                )}
              </button>

              {rewriteResult && (
                <div className="space-y-4 border-t border-border/40 pt-4 mt-2">
                  <div className="relative bg-card-border/10 border border-border/20 rounded-xl p-4">
                    <p className="text-xs text-foreground/90 leading-relaxed pr-6">
                      {rewriteResult.rewritten_text}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="absolute top-3 right-3 text-foreground/45 hover:text-primary transition-colors"
                      title="Copy to Clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
                    </button>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1.5">Action Verbs Placed</span>
                    <div className="flex flex-wrap gap-1.5">
                      {rewriteResult.action_verbs_added?.map((v: string) => (
                        <span key={v} className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Parsed Resume metadata info card */}
          {currentVersion && (
            <GlassCard className="space-y-6">
              <h3 className="font-bold text-md text-foreground flex items-center gap-2 border-b border-border/40 pb-4">
                <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                <span>Extracted Credentials</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-foreground/40 block font-bold uppercase tracking-wider">Candidate Name</span>
                  <span className="text-foreground font-semibold text-sm mt-0.5 block">{currentVersion.parsed_data?.name || 'Not detected'}</span>
                </div>
                <div>
                  <span className="text-foreground/40 block font-bold uppercase tracking-wider">Email Address</span>
                  <span className="text-foreground font-semibold mt-0.5 block truncate">{currentVersion.parsed_data?.email || 'Not detected'}</span>
                </div>
                <div>
                  <span className="text-foreground/40 block font-bold uppercase tracking-wider">Phone Contact</span>
                  <span className="text-foreground font-semibold mt-0.5 block">{currentVersion.parsed_data?.phone || 'Not detected'}</span>
                </div>
                <div>
                  <span className="text-foreground/40 block font-bold uppercase tracking-wider">LinkedIn Profiles</span>
                  <span className="text-primary truncate font-semibold mt-0.5 block">
                    {currentVersion.parsed_data?.linkedin ? (
                      <a href={currentVersion.parsed_data.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                        {currentVersion.parsed_data.linkedin.replace("https://", "")}
                      </a>
                    ) : 'Not detected'}
                  </span>
                </div>
                <div>
                  <span className="text-foreground/40 block font-bold uppercase tracking-wider">GitHub Profiles</span>
                  <span className="text-primary truncate font-semibold mt-0.5 block">
                    {currentVersion.parsed_data?.github ? (
                      <a href={currentVersion.parsed_data.github} target="_blank" rel="noreferrer" className="hover:underline">
                        {currentVersion.parsed_data.github.replace("https://", "")}
                      </a>
                    ) : 'Not detected'}
                  </span>
                </div>
                <div>
                  <span className="text-foreground/40 block font-bold uppercase tracking-wider">Core Technology Stack</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {currentVersion.parsed_data?.skills?.slice(0, 10).map((skill: string) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-card-border border border-border text-[10px] text-foreground font-medium">
                        {skill}
                      </span>
                    ))}
                    {currentVersion.parsed_data?.skills?.length > 10 && (
                      <span className="text-[10px] font-bold text-foreground/40 self-center pl-1">+{currentVersion.parsed_data.skills.length - 10} more</span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
