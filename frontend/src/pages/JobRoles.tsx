import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { Compass, Clock, Play, GraduationCap, ChevronRight } from 'lucide-react';

export const JobRoles: React.FC = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [skillGap, setSkillGap] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRecsLoading, setIsRecsLoading] = useState(false);
  const [isGapLoading, setIsGapLoading] = useState(false);

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

  const fetchRecommendations = async (versionId: number) => {
    setIsRecsLoading(true);
    try {
      const res = await axios.get(`/api/jobs/${versionId}/recommendations`);
      setRecommendations(res.data);
      if (res.data.length > 0) {
        setSelectedRole(res.data[0].role_name);
      }
    } catch (err) {
      console.error("Failed to load recommendations", err);
    } finally {
      setIsRecsLoading(false);
    }
  };

  const fetchSkillGap = async (versionId: number, role: string) => {
    setIsGapLoading(true);
    try {
      const res = await axios.get(`/api/jobs/${versionId}/skill-gap?target_role=${role}`);
      setSkillGap(res.data);
    } catch (err) {
      console.error("Failed to load skill gap", err);
    } finally {
      setIsGapLoading(false);
    }
  };

  // Fetch recommendations once version changes
  useEffect(() => {
    if (selectedVersionId) {
      fetchRecommendations(selectedVersionId);
    }
  }, [selectedVersionId]);

  // Fetch skill gap details once selected role changes
  useEffect(() => {
    if (selectedVersionId && selectedRole) {
      fetchSkillGap(selectedVersionId, selectedRole);
    }
  }, [selectedVersionId, selectedRole]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary" />
            <span>Job Roles & Career Gaps</span>
          </h1>
          <p className="text-foreground/50 text-sm mt-1">Audit suitable career directions, roadmaps, and training prioritizations</p>
        </div>

        {flatVersions.length > 0 && (
          <select
            value={selectedVersionId || ''}
            onChange={(e) => setSelectedVersionId(Number(e.target.value))}
            className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none text-foreground"
          >
            {flatVersions.map(fv => (
              <option key={fv.id} value={fv.id}>{fv.name}</option>
            ))}
          </select>
        )}
      </div>

      {flatVersions.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center text-center py-16 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Upload a resume</h3>
            <p className="text-sm text-foreground/50 max-w-sm">
              Please upload a resume first under the Resume Analyzer tab before running role recommendations audits.
            </p>
          </div>
        </GlassCard>
      ) : isRecsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Roles Recommendations List */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Top Role Recommendations</h3>
            <div className="space-y-3">
              {recommendations.map(r => {
                const isSelected = selectedRole === r.role_name;
                return (
                  <GlassCard
                    key={r.role_name}
                    onClick={() => setSelectedRole(r.role_name)}
                    className={`p-4 border transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                        : 'border-border/30 hover:border-border/60 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{r.role_name}</p>
                        <p className="text-xs text-foreground/45 mt-1 font-semibold">{r.match_percentage}% Compliance</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-primary' : ''}`} />
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Role Details and Roadmaps (Center & Right Column combined) */}
          <div className="lg:col-span-2 space-y-8">
            {selectedRole && (
              <>
                {/* Fit Reason */}
                {recommendations.map(r => {
                  if (r.role_name !== selectedRole) return null;
                  return (
                    <GlassCard key={r.role_name} className="space-y-4 relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <h3 className="font-bold text-md text-foreground">{r.role_name} Analysis</h3>
                        <span className="text-xs font-bold text-primary">{r.match_percentage}% compliance index</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{r.fit_reason}</p>
                    </GlassCard>
                  );
                })}

                {/* Skill Gap Analysis & Resources */}
                {isGapLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  skillGap && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Gap lists */}
                      <GlassCard className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Gap Analysis</span>
                          </h4>
                          <span className="text-[10px] font-bold text-foreground/50 flex items-center gap-1">
                            Est: {skillGap.estimated_time}
                          </span>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Acquired Skills</span>
                            <div className="flex flex-wrap gap-1">
                              {skillGap.current_skills?.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1.5">Skills to Develop</span>
                            <div className="flex flex-wrap gap-1">
                              {skillGap.missing_skills?.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-semibold">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </GlassCard>

                      {/* Learning roadmap & priority resources */}
                      <GlassCard className="space-y-6">
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                          <GraduationCap className="w-4.5 h-4.5 text-accent" />
                          <span>Training Roadmap</span>
                        </h4>

                        <div className="space-y-4">
                          {recommendations.find(r => r.role_name === selectedRole)?.learning_roadmap && (
                            Object.entries(recommendations.find(r => r.role_name === selectedRole).learning_roadmap).map(([phase, val]: any) => (
                              <div key={phase} className="flex gap-3 text-xs">
                                <div className="w-5 h-5 rounded-md bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-[10px] uppercase border border-accent/20">
                                  {phase.replace("phase_", "")}
                                </div>
                                <p className="text-foreground/80 self-center leading-relaxed">{val}</p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="pt-4 border-t border-border/40 space-y-3">
                          <span className="block text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Recommended Course Resources</span>
                          <div className="space-y-2">
                            {skillGap.learning_resources?.map((res: any, idx: number) => (
                              <a
                                key={idx}
                                href={res.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex justify-between items-center p-2 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground truncate">{res.skill}</p>
                                  <p className="text-[10px] text-foreground/45 truncate mt-0.5">{res.course}</p>
                                </div>
                                <Play className="w-3 h-3 text-primary shrink-0 ml-2" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </GlassCard>

                    </div>
                  )
                )}
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
