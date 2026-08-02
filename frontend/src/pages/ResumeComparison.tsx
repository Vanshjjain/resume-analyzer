import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { GitCompare, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ResumeComparison: React.FC = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [v1, setV1] = useState<number | null>(null);
  const [v2, setV2] = useState<number | null>(null);
  
  const [comparison, setComparison] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    axios.get('/api/resumes/')
      .then(res => {
        setResumes(res.data);
        
        // Auto select versions if possible
        const allVersions: any[] = [];
        res.data.forEach((r: any) => {
          if (r.versions) {
            r.versions.forEach((v: any) => {
              allVersions.push({ ...v, originalName: r.original_name });
            });
          }
        });
        
        if (allVersions.length >= 2) {
          setV1(allVersions[allVersions.length - 2].id);
          setV2(allVersions[allVersions.length - 1].id);
        }
      })
      .catch(err => console.error("Failed to load resumes", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCompare = async () => {
    if (!v1 || !v2) return;
    setIsComparing(true);
    try {
      const res = await axios.get(`/api/analysis/compare?version_1_id=${v1}&version_2_id=${v2}`);
      setComparison(res.data.comparison_details);
    } catch (err) {
      console.error("Comparison failed", err);
    } finally {
      setIsComparing(false);
    }
  };

  // Trigger compare automatically once v1 and v2 are selected
  useEffect(() => {
    if (v1 && v2) {
      handleCompare();
    }
  }, [v1, v2]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Flatten versions to show in dropdowns
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
          <GitCompare className="w-8 h-8 text-primary" />
          <span>Resume Comparison</span>
        </h1>
        <p className="text-foreground/50 text-sm mt-1">Audit score variations, formatting deltas, and keyword adjustments side-by-side</p>
      </div>

      {flatVersions.length < 2 ? (
        <GlassCard className="flex flex-col items-center justify-center text-center py-16 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <GitCompare className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Upload multiple versions</h3>
            <p className="text-sm text-foreground/50 max-w-sm">
              You must upload at least two different resume documents or document versions to trigger comparisons audits.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          {/* Selectors */}
          <GlassCard className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Base Resume Version</label>
              <select
                value={v1 || ''}
                onChange={(e) => setV1(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none text-foreground font-semibold"
              >
                {flatVersions.map(fv => (
                  <option key={fv.id} value={fv.id} disabled={fv.id === v2}>{fv.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Target Resume Version</label>
              <select
                value={v2 || ''}
                onChange={(e) => setV2(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none text-foreground font-semibold"
              >
                {flatVersions.map(fv => (
                  <option key={fv.id} value={fv.id} disabled={fv.id === v1}>{fv.name}</option>
                ))}
              </select>
            </div>
          </GlassCard>

          {isComparing ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            comparison && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Comparison Details List */}
                <div className="lg:col-span-2 space-y-6">
                  {/* side by side stats */}
                  <div className="grid grid-cols-2 gap-6">
                    <GlassCard className="text-center space-y-2">
                      <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Base Score</p>
                      <p className="text-4xl font-extrabold text-foreground">{comparison.score_1}</p>
                    </GlassCard>
                    <GlassCard className="text-center space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl pointer-events-none" />
                      <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Target Score</p>
                      <p className="text-4xl font-extrabold text-foreground">{comparison.score_2}</p>
                    </GlassCard>
                  </div>

                  {/* Skills delta list */}
                  <GlassCard className="space-y-6">
                    <h3 className="font-bold text-md text-foreground pb-4 border-b border-border/40">Skills Delta Mapping</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <span className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">Added Skills (+{comparison.added_skills?.length})</span>
                        <div className="flex flex-wrap gap-1.5">
                          {comparison.added_skills?.length > 0 ? (
                            comparison.added_skills.map((skill: string) => (
                              <span key={skill} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                                + {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-foreground/40">No new skills added</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="block text-xs font-bold text-red-400 uppercase tracking-wider">Removed Skills (-{comparison.removed_skills?.length})</span>
                        <div className="flex flex-wrap gap-1.5">
                          {comparison.removed_skills?.length > 0 ? (
                            comparison.removed_skills.map((skill: string) => (
                              <span key={skill} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                                - {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-foreground/40">No skills removed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/40">
                      <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider">Common Core Competencies ({comparison.common_skills?.length})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {comparison.common_skills?.map((skill: string) => (
                          <span key={skill} className="px-2.5 py-1 rounded-lg bg-card-border border border-border text-foreground/80 text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Right Side: Winner & AI Recommendations */}
                <div className="space-y-6">
                  {/* Better Resume Indicator */}
                  <GlassCard className="bg-primary/5 border border-primary/20 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-md text-foreground">ATS Audit Winner</h4>
                        <p className="text-[10px] text-foreground/50">Higher compliance match found</p>
                      </div>
                    </div>

                    <div className="border-t border-border/40 pt-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        Winner: <span className="text-primary font-bold">{comparison.better_resume === "Resume 1" ? "Base Version" : "Target Version"}</span>
                      </p>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        This version exhibits enhanced keywords structure, broader section distribution, and strong action verb phrasing matching common recruiter systems.
                      </p>
                    </div>
                  </GlassCard>

                  {/* Recommendations */}
                  <GlassCard className="space-y-4">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2 pb-3 border-b border-border/40">
                      <AlertTriangle className="w-4 h-4 text-accent" />
                      <span>Suggested Tweaks</span>
                    </h4>
                    <ul className="space-y-3">
                      {comparison.suggested_improvements?.map((imp: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 text-xs text-foreground/80 leading-relaxed">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-1" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
