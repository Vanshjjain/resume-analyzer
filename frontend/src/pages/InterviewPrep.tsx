import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { BookOpen, Eye, EyeOff, Award, Bookmark } from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Track revealed state of answers
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

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

  const handleGenerate = async () => {
    if (!selectedVersionId) return;
    setIsGenerating(true);
    setQuestions([]);
    setRevealedIds([]);
    try {
      const res = await axios.get(`/api/interview/${selectedVersionId}/questions?target_role=${targetRole}`);
      setQuestions(res.data);
    } catch (err) {
      console.error("Questions generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger generation when selected resume/version or target role updates
  useEffect(() => {
    if (selectedVersionId) {
      handleGenerate();
    }
  }, [selectedVersionId, targetRole]);

  const toggleReveal = (id: number) => {
    if (revealedIds.includes(id)) {
      setRevealedIds(prev => prev.filter(x => x !== id));
    } else {
      setRevealedIds(prev => [...prev, id]);
    }
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

  const categories = ['All', 'HR', 'Behavioral', 'Technical', 'Coding', 'System Design'];
  
  const filteredQuestions = activeCategory === 'All' 
    ? questions 
    : questions.filter(q => q.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <span>Interview Preparation</span>
          </h1>
          <p className="text-foreground/50 text-sm mt-1">Audit customized Q&A prompts built directly from your extracted resume credentials</p>
        </div>

        {flatVersions.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none text-foreground"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="AI Engineer">AI Engineer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="QA Engineer">QA Engineer</option>
            </select>

            <select
              value={selectedVersionId || ''}
              onChange={(e) => setSelectedVersionId(Number(e.target.value))}
              className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none text-foreground"
            >
              {flatVersions.map(fv => (
                <option key={fv.id} value={fv.id}>{fv.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {flatVersions.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center text-center py-16 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Upload a resume</h3>
            <p className="text-sm text-foreground/50 max-w-sm">
              Please upload a resume first under the Resume Analyzer tab before running interview preparator audits.
            </p>
          </div>
        </GlassCard>
      ) : isGenerating ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'border-border/30 bg-card hover:bg-card-border/50 text-foreground/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredQuestions.length === 0 ? (
            <GlassCard className="text-center py-12 text-foreground/45 border border-dashed border-border/60">
              <p className="text-xs font-semibold">No questions generated for category "{activeCategory}". Click a different category.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredQuestions.map(q => {
                const isRevealed = revealedIds.includes(q.id);
                return (
                  <GlassCard key={q.id} className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">
                            {q.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            q.difficulty === 'Easy' 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : q.difficulty === 'Medium'
                                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm md:text-base text-foreground leading-relaxed">
                          {q.question}
                        </h4>
                      </div>

                      <button
                        onClick={() => toggleReveal(q.id)}
                        className="p-2 rounded-xl border border-border hover:bg-card-border/40 text-foreground/60 transition-colors shrink-0"
                        title={isRevealed ? "Hide Answer" : "Reveal Answer"}
                      >
                        {isRevealed ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>

                    {/* Expandable answers */}
                    {isRevealed && (
                      <div className="border-t border-border/40 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                        <div className="md:col-span-2 space-y-2">
                          <span className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1">
                            <Bookmark className="w-3.5 h-3.5 text-primary" />
                            <span>Suggested Answer Outline</span>
                          </span>
                          <div className="bg-card-border/10 border border-border/20 rounded-xl p-4 text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap font-sans">
                            {q.sample_answer}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-accent" />
                            <span>Evaluation Rubric Checklist</span>
                          </span>
                          <div className="bg-card-border/10 border border-border/20 rounded-xl p-4 text-xs leading-relaxed text-foreground/85">
                            {q.evaluation_tips}
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
