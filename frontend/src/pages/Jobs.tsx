import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Sparkles, 
  MapPin, 
  Clock, 
  Users, 
  Copy, 
  Check, 
  RefreshCw, 
  FileText, 
  ChevronRight, 
  Award, 
  Zap, 
  HelpCircle, 
  Sliders, 
  Layers, 
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Key,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  Trash2,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { candidateService } from '../services/candidateService';
import { interviewService, DEFAULT_GROQ_MODEL } from '../services/interviewService';
import { Job, Candidate, InterviewKit, InterviewQuestion } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

export default function Jobs() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'generator'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Grok API Settings State
  const [grokKey, setGrokKey] = useState<string>('');
  const [inputGrokKey, setInputGrokKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GROQ_MODEL);
  const [availableModels, setAvailableModels] = useState<string[]>([DEFAULT_GROQ_MODEL]);
  const [showKeyDrawer, setShowKeyDrawer] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [keySavedNotification, setKeySavedNotification] = useState<string | null>(null);
  const [backendConfigured, setBackendConfigured] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Generator form state
  const [selectedJobId, setSelectedJobId] = useState<number | 'custom'>(1);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [customJobDescription, setCustomJobDescription] = useState('');

  const [selectedCandidateMode, setSelectedCandidateMode] = useState<'existing' | 'custom'>('custom');
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | ''>('');
  const [customCandidateName, setCustomCandidateName] = useState('');
  const [candidateExperience, setCandidateExperience] = useState<number>(5);
  const [candidateResumeText, setCandidateResumeText] = useState('');

  // Generation status and result
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [generatedKit, setGeneratedKit] = useState<InterviewKit | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    Promise.all([
      candidateService.getJobs(),
      candidateService.getCandidates(),
      interviewService.checkBackendGroqStatus(),
    ]).then(([jobResponse, candidateResponse, status]) => {
      setJobs(jobResponse.data);
      setCandidates(candidateResponse.data);
      setBackendConfigured(status.configured);
      if (status.default_model) setSelectedModel(status.default_model);
      if (status.supported_models?.length) setAvailableModels(status.supported_models);
      if (jobResponse.data.length > 0) setSelectedJobId(jobResponse.data[0].id);
      if (candidateResponse.data.length > 0) {
        const candidate = candidateResponse.data[0];
        setSelectedCandidateMode('existing');
        setSelectedCandidateId(candidate.id);
        setCandidateExperience(candidate.experience);
        setCandidateResumeText(candidate.summary || '');
      }
    }).catch(() => setGenerationError('Unable to load jobs, candidates, or AI service status. Start the FastAPI backend and retry.'));
  }, []);

  const handleSaveGrokKey = () => {
    const trimmed = inputGrokKey.trim();
    if (trimmed) {
      setGrokKey(trimmed);
      setKeySavedNotification('Browser-managed API keys are disabled. Configure GROQ_API_KEY on the backend instead.');
      setTimeout(() => setKeySavedNotification(null), 3000);
      setShowKeyDrawer(false);
      setGenerationError(null);
    }
  };

  const handleClearGrokKey = () => {
    setGrokKey('');
    setInputGrokKey('');
    setKeySavedNotification('Grok API key removed.');
    setTimeout(() => setKeySavedNotification(null), 3000);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJobId(job.id);
    setActiveTab('generator');
  };

  const getCurrentJobDetails = () => {
    if (selectedJobId === 'custom') {
      return {
        title: customJobTitle || 'Custom Job Position',
        description: customJobDescription || 'Custom job description requirements.'
      };
    }
    const found = jobs.find(j => j.id === selectedJobId) || jobs[0];
    return {
      title: found?.title || 'Select a job',
      description: found?.description || ''
    };
  };

  const getCurrentCandidateDetails = () => {
    if (selectedCandidateMode === 'existing') {
      const found = candidates.find(c => c.id === selectedCandidateId);
      if (found) {
        return {
          name: found.name,
          experience: found.experience,
          resume: found.summary || `${found.name}'s resume highlights expertise in ${found.skills.join(', ')}.`
        };
      }
    }
    return {
      name: customCandidateName || 'Candidate',
      experience: candidateExperience,
      resume: candidateResumeText || 'Candidate with practical development background.'
    };
  };

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setGenerationStep(1);
    setGenerationError(null);

    const job = getCurrentJobDetails();
    const candidate = getCurrentCandidateDetails();

    const t1 = setTimeout(() => setGenerationStep(2), 500);
    const t2 = setTimeout(() => setGenerationStep(3), 1000);
    const t3 = setTimeout(() => setGenerationStep(4), 1400);

    try {
      const kit = await interviewService.generateInterviewKit({
        jobTitle: job.title,
        jobDescription: job.description,
        candidateName: candidate.name,
        candidateResume: candidate.resume,
        candidateExperience: candidateExperience,
        model: selectedModel
      });

      setGeneratedKit(kit);
      setTimeout(() => {
        const el = document.getElementById('interview-results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err?.message || 'Error occurred while generating with Grok API. Check your API key or use calibrated mode.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsGenerating(false);
    }
  };

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  const handleCopyAll = () => {
    if (!generatedKit) return;
    const content = `INTERVIEW QUESTIONS FOR ${generatedKit.candidateName.toUpperCase()} - ${generatedKit.jobTitle.toUpperCase()}
Engine: ${generatedKit.source === 'groq-llm' ? `Groq (${generatedKit.model || 'Llama 3.3'})` : 'Calibrated Algorithmic Model'}
Experience: ${generatedKit.candidateExperience} Years
Match Score: ${generatedKit.matchedScore}%
Date: ${generatedKit.generatedAt}

${generatedKit.questions.map((q, idx) => `
Q${idx + 1} [${q.category}] (${q.difficulty})
Question: ${q.question}
Rationale: ${q.rationale}
Key Evaluation Indicators:
${q.whatToLookFor.map(item => `  - ${item}`).join('\n')}
Follow-up Probe: ${q.followUpProbe}
`).join('\n----------------------------------------\n')}
`;
    navigator.clipboard.writeText(content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const filteredQuestions = generatedKit
    ? activeCategoryFilter === 'All'
      ? generatedKit.questions
      : generatedKit.questions.filter(q => q.category === activeCategoryFilter)
    : [];

  const getDifficultyBadge = (tier: string) => {
    if (tier.includes('Junior')) return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    if (tier.includes('Mid')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (tier.includes('Senior')) return 'bg-purple-500/20 text-[#D8B4FE] border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.25)]';
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  };

  const isGrokActive = backendConfigured;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Command Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[rgba(16,10,26,0.7)] backdrop-blur-2xl p-8 rounded-[24px] text-white shadow-[0_25px_70px_rgba(0,0,0,0.6)] border border-[rgba(168,85,247,0.2)] relative overflow-hidden">
        {/* Top subtle highlight line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(184,107,255,0.4)] to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-[rgba(168,85,247,0.3)] text-xs font-mono font-semibold uppercase tracking-wider text-[#D8B4FE]">
            <Sparkles className="w-3.5 h-3.5 text-[#B86BFF]" />
            <span>AI INTERVIEW SYNTHESIS</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-['Outfit']">
            Jobs & AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-[#C084FC]">Interview Kits</span>
          </h1>
          <p className="text-[#A8A0B8] text-xs font-mono leading-relaxed">
            Manage active roles and synthesize personalized interview questions calibrated against candidate resume claims, required skills, and tenure.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="relative z-10 flex p-1.5 bg-[rgba(10,5,18,0.75)] backdrop-blur-xl rounded-2xl border border-[rgba(168,85,247,0.2)] self-start md:self-center shadow-lg">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'jobs' 
                ? 'bg-gradient-to-r from-purple-600/35 to-fuchsia-600/35 text-white border border-[#B86BFF] shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'text-[#A8A0B8] hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Active Openings ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'generator' 
                ? 'bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7] text-white shadow-[0_0_20px_rgba(184,107,255,0.45)] border border-purple-400/40' 
                : 'text-[#A8A0B8] hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            AI Generator
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE JOBS */}
      {activeTab === 'jobs' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white font-['Outfit']">Current Job Deployments</h2>
              <p className="text-xs font-mono text-[#A8A0B8]">Select any position to synthesize candidate-specific interview kits</p>
            </div>
            <Button onClick={() => setActiveTab('generator')} leftIcon={<Sparkles className="w-4 h-4" />}>
              Generate Interview Kit
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-[rgba(16,10,26,0.68)] backdrop-blur-2xl rounded-[22px] border border-[rgba(168,85,247,0.18)] shadow-[0_15px_45px_rgba(0,0,0,0.4)] hover:border-[rgba(184,107,255,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.65),_0_0_25px_rgba(168,85,247,0.2)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold px-3 py-1 bg-purple-500/15 border border-[rgba(184,107,255,0.35)] text-[#D8B4FE] rounded-lg shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        {job.candidateCount} matched candidate{job.candidateCount === 1 ? '' : 's'}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-3 group-hover:text-[#D8B4FE] transition-colors tracking-tight">
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#A8A0B8] line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[rgba(168,85,247,0.12)]">
                    <p className="text-[10px] font-mono font-bold text-[#A8A0B8] uppercase tracking-wider">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-purple-500/10 text-[#D8B4FE] text-[10px] font-mono rounded-md border border-purple-500/20 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-white/[0.015] border-t border-[rgba(168,85,247,0.12)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#A8A0B8]">
                    <Users className="w-4 h-4 text-[#C084FC]" />
                    <span className="font-bold text-white">{job.candidateCount}</span> candidates
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSelectJob(job)}
                    className="group-hover:border-[#B86BFF] group-hover:text-white transition-all gap-1.5 font-mono text-xs"
                  >
                    <span>Generate Kit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 2: AI QUESTION GENERATOR SECTION */}
      {activeTab === 'generator' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* GROK API CONFIGURATION BAR */}
          <div className="bg-[rgba(16,10,26,0.7)] backdrop-blur-2xl rounded-[22px] p-6 text-white shadow-xl border border-[rgba(168,85,247,0.2)] relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2D124D] to-[#120724] border border-[rgba(184,107,255,0.4)] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] flex-shrink-0">
                  <Cpu className="w-6 h-6 text-[#D8B4FE]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white tracking-tight">AI Inference Engine</h3>
                    {isGrokActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active ({selectedModel.split('-').slice(0, 3).join(' ')})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-semibold">
                        <Key className="w-3 h-3" />
                        Backend Config Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[#A8A0B8] mt-1 max-w-xl leading-relaxed">
                    Real-time question synthesis powered by Llama 3.3-70B on Groq. Calibrates inquiries directly across candidate claims and experience tenure.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="font-mono text-xs opacity-75"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#B86BFF]" />
                  <span>Backend .env Synced</span>
                </Button>
              </div>
            </div>

            {/* Notification alert */}
            {keySavedNotification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 font-mono"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{keySavedNotification}</span>
              </motion.div>
            )}
          </div>

          {/* Error Alert if generation failed */}
          {generationError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/30 border border-red-500/40 p-4 rounded-2xl flex items-start gap-3 text-red-300 text-xs shadow-sm font-mono"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <strong className="font-bold block text-sm">Question Generation Notice</strong>
                <p>{generationError}</p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleGenerateQuestions}
                    className="font-bold underline hover:text-white"
                  >
                    Retry Generation
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Controls & Configuration Card */}
          <div className="bg-[rgba(16,10,26,0.7)] backdrop-blur-2xl rounded-[24px] border border-[rgba(168,85,247,0.2)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden text-white">
            <div className="p-6 md:p-8 border-b border-[rgba(168,85,247,0.14)] bg-white/[0.015] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-[#D8B4FE] border border-purple-500/30 flex items-center justify-center font-black text-sm">
                    AI
                  </span>
                  Interview Question Synthesizer
                </h2>
                <p className="text-xs font-mono text-[#A8A0B8] mt-1">
                  Calibrates difficulty and questions against candidate resume and target role.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-[#D8B4FE] text-xs font-mono font-semibold">
                <Sliders className="w-4 h-4 text-[#B86BFF]" />
                <span>Tenure Calibrated</span>
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Job Description Setup */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-[rgba(168,85,247,0.14)]">
                  <Briefcase className="w-5 h-5 text-[#B86BFF]" />
                  <h3 className="font-bold text-white text-base">1. Select Target Job Description</h3>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono font-semibold text-[#A8A0B8] uppercase tracking-wider block">
                    Choose Active Position
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {jobs.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => setSelectedJobId(j.id)}
                        className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                          selectedJobId === j.id
                            ? 'bg-purple-600/25 border-[#B86BFF] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] font-bold'
                            : 'bg-white/[0.03] border-white/10 text-[#A8A0B8] hover:border-purple-500/30 hover:text-white'
                        }`}
                      >
                        <p className="font-bold truncate">{j.title}</p>
                        <p className="text-[#A8A0B8] mt-1 font-mono text-[11px]">{j.requiredExperience}+ Yrs Exp</p>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedJobId('custom')}
                    className={`w-full p-2.5 text-center rounded-xl border text-xs font-mono font-medium transition-all ${
                      selectedJobId === 'custom'
                        ? 'bg-purple-600/25 border-[#B86BFF] text-white font-bold'
                        : 'bg-white/[0.03] border-white/10 text-[#A8A0B8] hover:bg-purple-500/10 hover:text-white'
                    }`}
                  >
                    + Use Custom Job Title & Description
                  </button>
                </div>

                {selectedJobId === 'custom' ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-mono text-[#A8A0B8] mb-1 block">Custom Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Principal AI Platform Architect"
                        value={customJobTitle}
                        onChange={(e) => setCustomJobTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[rgba(12,6,18,0.8)] border border-[rgba(168,85,247,0.22)] rounded-xl text-sm text-white placeholder-[#A8A0B8]/50 focus:border-[#B86BFF] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-[#A8A0B8] mb-1 block">Paste Job Description</label>
                      <textarea
                        rows={4}
                        placeholder="Paste required skills, qualifications, and role responsibilities..."
                        value={customJobDescription}
                        onChange={(e) => setCustomJobDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[rgba(12,6,18,0.8)] border border-[rgba(168,85,247,0.22)] rounded-xl text-sm text-white placeholder-[#A8A0B8]/50 focus:border-[#B86BFF] focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/[0.02] p-4 rounded-2xl border border-[rgba(168,85,247,0.15)] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{getCurrentJobDetails().title}</span>
                      <span className="text-[#D8B4FE] font-mono font-semibold">Active Role</span>
                    </div>
                    <p className="text-xs text-[#A8A0B8] leading-relaxed max-h-24 overflow-y-auto font-sans">
                      {getCurrentJobDetails().description}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Candidate Resume & Experience */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-[rgba(168,85,247,0.14)]">
                  <FileText className="w-5 h-5 text-[#B86BFF]" />
                  <h3 className="font-bold text-white text-base">2. Candidate Resume & Experience</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex p-1 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-mono">
                    {candidates.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCandidateMode('existing')}
                        className={`flex-1 py-2 rounded-lg transition-all ${
                          selectedCandidateMode === 'existing' ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-sm font-bold' : 'text-[#A8A0B8] hover:text-white'
                        }`}
                      >
                        Existing Candidates ({candidates.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedCandidateMode('custom')}
                      className={`flex-1 py-2 rounded-lg transition-all ${
                        selectedCandidateMode === 'custom' ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-sm font-bold' : 'text-[#A8A0B8] hover:text-white'
                      }`}
                    >
                      Paste Resume
                    </button>
                  </div>

                  {selectedCandidateMode === 'existing' && candidates.length > 0 && (
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setSelectedCandidateId(id);
                        const c = candidates.find(item => item.id === id);
                        if (c) {
                          setCandidateExperience(c.experience);
                          setCandidateResumeText(c.summary || `${c.name} has ${c.experience} years experience with ${c.skills.join(', ')}.`);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-[rgba(12,6,18,0.8)] border border-[rgba(168,85,247,0.22)] rounded-xl text-xs font-mono text-white focus:border-[#B86BFF] focus:outline-none"
                    >
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0e071a] text-white">
                          {c.name} ({c.experience} yrs exp) - {c.status}
                        </option>
                      ))}
                    </select>
                  )}

                  {selectedCandidateMode === 'custom' && (
                    <div>
                      <label className="text-xs font-mono text-[#A8A0B8] mb-1 block">Candidate Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Jordan Miller"
                        value={customCandidateName}
                        onChange={(e) => setCustomCandidateName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[rgba(12,6,18,0.8)] border border-[rgba(168,85,247,0.22)] rounded-xl text-sm text-white placeholder-[#A8A0B8]/50 focus:border-[#B86BFF] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Experience Calibration Slider */}
                <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                      <Award className="w-4 h-4 text-[#B86BFF]" />
                      Candidate Experience Tier
                    </label>
                    <span className="px-2.5 py-1 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white font-mono font-bold text-xs rounded-lg shadow-sm">
                      {candidateExperience} {candidateExperience === 1 ? 'Year' : 'Years'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={candidateExperience}
                    onChange={(e) => setCandidateExperience(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#B86BFF]"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-[#A8A0B8]">
                    <span>Junior (0-2 Yrs)</span>
                    <span>Mid-Level (3-5 Yrs)</span>
                    <span>Senior (5-8 Yrs)</span>
                    <span>Lead / Arch (8+ Yrs)</span>
                  </div>
                </div>

                {/* Resume Summary Textarea */}
                <div>
                  <label className="text-xs font-mono text-[#A8A0B8] mb-1 block">Candidate Resume / Highlights</label>
                  <textarea
                    rows={3}
                    placeholder="Enter resume summary, key accomplishments, or technologies used..."
                    value={candidateResumeText}
                    onChange={(e) => setCandidateResumeText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[rgba(12,6,18,0.8)] border border-[rgba(168,85,247,0.22)] rounded-xl text-xs text-white placeholder-[#A8A0B8]/50 focus:border-[#B86BFF] focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 bg-white/[0.015] border-t border-[rgba(168,85,247,0.14)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A8A0B8]">
                <Sparkles className="w-4 h-4 text-[#B86BFF]" />
                <span>
                  Calibrating questions for <strong className="text-white">{candidateExperience} years experience</strong> against target JD.
                </span>
              </div>

              <Button
                onClick={() => handleGenerateQuestions()}
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-3 font-mono font-bold text-xs uppercase tracking-wider gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Questions...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-purple-200" />
                    <span>Generate AI Interview Questions</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Loading Animation State */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[rgba(16,10,26,0.85)] backdrop-blur-2xl rounded-3xl p-8 border border-[rgba(184,107,255,0.3)] shadow-2xl text-center max-w-xl mx-auto space-y-6 text-white"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D124D] to-[#120724] border border-[rgba(184,107,255,0.5)] mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(184,107,255,0.4)] animate-pulse">
                  <Cpu className="w-8 h-8 text-[#D8B4FE]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-['Outfit']">
                    Synthesizing Tailored Interview Kit
                  </h3>
                  <p className="text-xs font-mono text-[#A8A0B8]">
                    Evaluating JD requirements against candidate's background at {candidateExperience} years tenure.
                  </p>
                </div>

                {/* Stepper indicators */}
                <div className="space-y-2.5 max-w-sm mx-auto text-left text-xs font-mono">
                  <div className={`flex items-center gap-2.5 transition-colors ${generationStep >= 1 ? 'text-[#D8B4FE] font-bold' : 'text-[#A8A0B8]/60'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${generationStep >= 1 ? 'text-[#B86BFF]' : 'text-gray-600'}`} />
                    <span>Extracting technical requirements from JD</span>
                  </div>
                  <div className={`flex items-center gap-2.5 transition-colors ${generationStep >= 2 ? 'text-[#D8B4FE] font-bold' : 'text-[#A8A0B8]/60'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${generationStep >= 2 ? 'text-[#B86BFF]' : 'text-gray-600'}`} />
                    <span>Parsing candidate resume & past project claims</span>
                  </div>
                  <div className={`flex items-center gap-2.5 transition-colors ${generationStep >= 3 ? 'text-[#D8B4FE] font-bold' : 'text-[#A8A0B8]/60'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${generationStep >= 3 ? 'text-[#B86BFF]' : 'text-gray-600'}`} />
                    <span>Calibrating difficulty for {candidateExperience} yrs tenure</span>
                  </div>
                  <div className={`flex items-center gap-2.5 transition-colors ${generationStep >= 4 ? 'text-[#D8B4FE] font-bold' : 'text-[#A8A0B8]/60'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${generationStep >= 4 ? 'text-[#B86BFF]' : 'text-gray-600'}`} />
                    <span>Generating evaluation criteria & follow-up probes</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GENERATED INTERVIEW KIT RESULTS */}
          {generatedKit && !isGenerating && (
            <motion.div
              id="interview-results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Results Top Overview */}
              <div className="bg-[rgba(16,10,26,0.7)] backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-[rgba(168,85,247,0.2)] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-purple-500/20 text-[#D8B4FE] border border-purple-500/30 text-xs font-mono font-bold rounded-lg">
                      {generatedKit.jobTitle}
                    </span>
                    <span className="px-3 py-1 bg-white/[0.04] border border-white/10 text-white text-xs font-mono font-semibold rounded-lg">
                      Candidate: {generatedKit.candidateName}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono font-semibold rounded-lg">
                      {generatedKit.candidateExperience} Yrs Experience
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/40 to-fuchsia-600/40 text-[#D8B4FE] border border-[rgba(184,107,255,0.4)] text-xs font-mono font-bold rounded-lg shadow-sm flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#B86BFF]" />
                      <span>{generatedKit.source === 'groq-llm' ? `Groq (${generatedKit.model?.split('-').slice(0, 3).join(' ') || 'Llama 3.3'})` : 'Calibrated Algorithmic Mode'}</span>
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white font-['Outfit']">
                    Generated Interview Assessment Kit
                  </h2>
                  <p className="text-xs font-mono text-[#A8A0B8] max-w-2xl leading-relaxed">
                    {generatedKit.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCopyAll}
                    className="gap-2 text-xs font-mono font-bold"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedAll ? 'Copied Kit!' : 'Copy Entire Kit'}
                  </Button>
                  <Button
                    onClick={() => handleGenerateQuestions()}
                    className="gap-2 text-xs font-mono font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </Button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {['All', 'JD Technical', 'Resume Deep-Dive', 'Experience & Architecture', 'Behavioral & Leadership'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      activeCategoryFilter === cat
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                        : 'bg-white/[0.03] text-[#A8A0B8] border border-white/10 hover:bg-purple-500/10 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredQuestions.map((q, index) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[rgba(16,10,26,0.68)] backdrop-blur-2xl rounded-[22px] border border-[rgba(168,85,247,0.18)] shadow-xl hover:border-[rgba(184,107,255,0.4)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6 md:p-8 space-y-4">
                      {/* Card Header badges */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 text-[#D8B4FE] text-xs font-mono font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white/[0.03] border border-white/10 text-purple-200">
                            {q.category}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getDifficultyBadge(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyQuestion(q.id, q.question)}
                          className="flex items-center gap-1.5 text-xs font-mono text-[#A8A0B8] hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                        >
                          {copiedQuestionId === q.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Main Question Text */}
                      <p className="text-lg font-bold text-white leading-snug">
                        "{q.question}"
                      </p>

                      {/* Context Rationale */}
                      <div className="text-xs font-mono text-[#A8A0B8] flex items-start gap-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                        <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-white">Rationale:</strong> {q.rationale}</span>
                      </div>

                      {/* Evaluation Criteria */}
                      <div className="space-y-2 pt-2">
                        <p className="text-xs font-mono font-bold text-[#D8B4FE] uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          What to look for in candidate's response
                        </p>
                        <ul className="space-y-1.5 pl-5 list-disc text-xs text-[#A8A0B8] leading-relaxed font-mono">
                          {q.whatToLookFor.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Follow-up Probe */}
                      <div className="mt-4 pt-4 border-t border-purple-500/20 bg-purple-500/10 -mx-6 -mb-6 md:-mx-8 md:-mb-8 p-4 md:px-8 flex items-start gap-2.5 text-xs font-mono text-[#D8B4FE]">
                        <HelpCircle className="w-4 h-4 text-[#B86BFF] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-white">Follow-up Probe:</strong> {q.followUpProbe}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
