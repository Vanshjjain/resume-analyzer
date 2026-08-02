import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { Briefcase, CheckCircle, Lightbulb, Check } from 'lucide-react';

export const JobMatch: React.FC = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/resumes/')
      .then(res => {
        setResumes(res.data);
        if (res.data.length > 0 && res.data[0].versions?.length > 0) {
          setSelectedVersionId(res.data[0].versions[res.data[0].versions.length - 1].id);
        }
      })
      .catch(err => console.error("Failed to load resumes", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleMatch = async () => {
    if (!selectedVersionId || !jobDescription.trim()) return;
    setIsMatching(true);
    setMatchResult(null);
    try {
      const res = await axios.post(`/api/jobs/${selectedVersionId}/match`, {
        job_description: jobDescription
      });
      setMatchResult(res.data);
    } catch (err) {
      console.error("Match calculation failed", err);
    } finally {
      setIsMatching(false);
    }
  };

  // Helper function to render JD with highlighted keywords
  const renderHighlightedJD = () => {
    if (!matchResult) return jobDescription;

    let text = jobDescription;
    const missing = matchResult.missing_keywords || [];
    const matched: string[] = [];
    
    // We can extract matched keywords by scanning a general tech list (or we just mock some matches)
    const mockTechKeywords = ["React", "TypeScript", "Python", "SQL", "FastAPI", "Docker", "Git", "AWS", "CSS", "HTML"];
    mockTechKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text) && !missing.includes(kw)) {
        matched.push(kw);
      }
    });

    // Escape HTML helpers
    const escapeRegex = (string: string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Replace matched keywords with green marks
    matched.forEach(kw => {
      const regex = new RegExp(`\\b(${escapeRegex(kw)})\\b`, 'gi');
      text = text.replace(regex, '___MATCH___$1___END___');
    });

    // Replace missing keywords with red marks
    missing.forEach((kw: string) => {
      const regex = new RegExp(`\\b(${escapeRegex(kw)})\\b`, 'gi');
      text = text.replace(regex, '___MISS___$1___END___');
    });

    // Now convert placeholder markup to HTML safely
    const segments = text.split(/(___MATCH___.*?___END___|___MISS___.*?___END___)/g);

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-xs text-foreground/80 font-mono bg-card border border-border p-4 rounded-xl max-h-[400px] overflow-y-auto">
        {segments.map((seg, idx) => {
          if (seg.startsWith('___MATCH___')) {
            const val = seg.replace('___MATCH___', '').replace('___END___', '');
            return (
              <mark key={idx} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 px-1 py-0.5 rounded font-semibold mx-0.5">
                {val}
              </mark>
            );
          } else if (seg.startsWith('___MISS___')) {
            const val = seg.replace('___MISS___', '').replace('___END___', '');
            return (
              <mark key={idx} className="bg-red-500/20 text-red-400 border border-red-500/35 px-1 py-0.5 rounded font-semibold mx-0.5">
                {val}
              </mark>
            );
          }
          return seg;
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Flatten versions
  const flatVersions: any[] = [];
  resumes.forEach(r => {
    if (r.versions) {
      r.versions.forEach((v: any) => {
        flatVersions.push({
          id: v.id,
          name: `${r.original_name} (${v.version_name})`
        });
      });
    }
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary" />
          <span>Job Description Matching</span>
        </h1>
        <p className="text-foreground/50 text-sm mt-1">Audit resume alignment weights against targeted career listings requirements</p>
      </div>

      {flatVersions.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center text-center py-16 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Upload a resume</h3>
            <p className="text-sm text-foreground/50 max-w-sm">
              Please upload a resume first under the Resume Analyzer tab before running job matches audits.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Select Active Resume Version</label>
                <select
                  value={selectedVersionId || ''}
                  onChange={(e) => setSelectedVersionId(Number(e.target.value))}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none text-foreground font-semibold"
                >
                  {flatVersions.map(fv => (
                    <option key={fv.id} value={fv.id}>{fv.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Paste Job Description Requirements</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="e.g. We are seeking a senior React Engineer with hands-on experience in TypeScript, Tailwind CSS, and FastAPI..."
                  rows={10}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm outline-none text-foreground resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleMatch}
                disabled={isMatching || !jobDescription.trim()}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3.5 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isMatching ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>Run Match Analysis</span>
                  </>
                )}
              </button>
            </GlassCard>

            {matchResult && (
              <GlassCard className="space-y-4">
                <h3 className="font-bold text-md text-foreground">Interactive Highlight Dashboard</h3>
                <p className="text-xs text-foreground/50">Green highlights indicate match. Red highlights show keyword gaps.</p>
                {renderHighlightedJD()}
              </GlassCard>
            )}
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {matchResult ? (
              <>
                {/* Scores Card */}
                <GlassCard className="space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-xl pointer-events-none" />
                  <h3 className="font-bold text-md text-foreground pb-3 border-b border-border/40">Compatibility Summary</h3>
                  
                  <div className="flex justify-between items-center gap-4">
                    <div className="text-center flex-1 bg-card-border/10 rounded-xl p-3 border border-border/20">
                      <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Match Index</span>
                      <p className="text-3xl font-extrabold text-primary mt-1">{matchResult.match_percentage}%</p>
                    </div>

                    <div className="text-center flex-1 bg-card-border/10 rounded-xl p-3 border border-border/20">
                      <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">ATS Score</span>
                      <p className="text-3xl font-extrabold text-accent mt-1">{matchResult.ats_compatibility}%</p>
                    </div>
                  </div>
                </GlassCard>

                {/* Gaps List */}
                <GlassCard className="space-y-4">
                  <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-widest pb-2 border-b border-border/40">Keyword Gaps</h4>
                  
                  <div>
                    <span className="block text-[10px] font-bold text-pink-400 uppercase tracking-wider mb-2">Technical Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missing_technical_skills?.length > 0 ? (
                        matchResult.missing_technical_skills.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-semibold">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> No major technical skill gaps
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Industry Terminology</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missing_keywords?.length > 0 ? (
                        matchResult.missing_keywords.map((kw: string) => (
                          <span key={kw} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-semibold">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> None
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>

                {/* Optimization Tips */}
                <GlassCard className="space-y-4">
                  <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-widest flex items-center gap-2 pb-2 border-b border-border/40">
                    <Lightbulb className="w-4 h-4 text-accent" />
                    <span>Recruiter Tips</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {matchResult.suggestions?.map((sug: string, idx: number) => (
                      <li key={idx} className="flex gap-2.5 text-xs text-foreground/75 leading-relaxed">
                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </>
            ) : (
              <GlassCard className="text-center py-12 text-foreground/45 border border-dashed border-border/60">
                <p className="text-xs font-semibold">Paste a Job Description on the left and run analysis to populate metrics.</p>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
