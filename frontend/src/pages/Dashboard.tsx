import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Activity, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Search,
  X,
  FileText
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats, Job, Candidate } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Avatar } from '../components/common/Avatar';
import { ProgressBar } from '../components/common/ProgressBar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 120, damping: 18 }
  }
};

interface TiltCardProps {
  stat: {
    title: string;
    value: number;
    icon: any;
    color: string;
    shadow: string;
    accent: string;
  };
}

function KpiTiltCard({ stat }: TiltCardProps) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Keep tilt subtle: max 2.5 degrees
    const rotateX = ((centerY - y) / centerY) * 2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      variants={itemVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(${isHovered ? -4 : 0}px)`,
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease',
      }}
      className={`relative overflow-hidden bg-[rgba(16,10,26,0.68)] backdrop-blur-2xl rounded-[22px] border transition-all duration-300 ${
        isHovered 
          ? 'border-[rgba(184,107,255,0.45)] shadow-[0_25px_60px_rgba(0,0,0,0.7),_0_0_30px_rgba(168,85,247,0.25)]' 
          : 'border-[rgba(168,85,247,0.18)] shadow-[0_15px_45px_rgba(0,0,0,0.45)]'
      } group`}
    >
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(184,107,255,0.35)] to-transparent pointer-events-none" />

      {/* Ambient background watermark icon */}
      <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 text-white pointer-events-none">
        <stat.icon className="w-32 h-32" />
      </div>

      <div className="p-6 relative z-10">
        {/* Floating Icon Badge with 3D elevation */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-[0_0_20px_rgba(184,107,255,0.4)] group-hover:-translate-y-1 transition-all duration-300 border border-white/20`}>
            <stat.icon className="w-6 h-6" />
          </div>

          <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
            <span>ACTIVE</span>
          </span>
        </div>

        <p className="text-xs font-mono font-bold text-[#A8A0B8] uppercase tracking-wider">{stat.title}</p>
        
        <div className="flex items-baseline gap-3 mt-1.5">
          <p className="text-4xl font-black text-white tracking-tight font-['Outfit'] group-hover:scale-[1.03] origin-left transition-transform duration-200">
            {stat.value}
          </p>
        </div>
      </div>

      {/* Bottom glowing telemetry edge */}
      <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${stat.accent} transform origin-left transition-transform duration-500 ${isHovered ? 'scale-x-100 opacity-100' : 'scale-x-60 opacity-40'}`} />
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([]);
  const [streamSearch, setStreamSearch] = useState('');

  const filteredStreamCandidates = recentCandidates.filter((c) => {
    if (!streamSearch.trim()) return true;
    const q = streamSearch.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q)) ||
      (c.summary && c.summary.toLowerCase().includes(q)) ||
      (c.resumeFile && c.resumeFile.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardService.getDashboardData();
        setStats(response.data.stats);
        setRecentJobs(response.data.recentJobs);
        setRecentCandidates(response.data.recentCandidates);
      } catch (err) {
        setError('Failed to load dashboard data. Ensure backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" label="Initializing AI Command Center..." />;
  if (error) return (
    <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-300">
      <p className="font-bold text-base mb-1">Telemetry Sync Error</p>
      <p className="text-sm opacity-80">{error}</p>
    </div>
  );
  if (!stats) return null;

  const statCards = [
    { 
      title: 'Total Candidates', 
      value: stats.totalCandidates, 
      icon: Users, 
      color: 'from-blue-600 to-cyan-500', 
      shadow: 'shadow-blue-500/20',
      accent: 'from-blue-500 via-cyan-400 to-purple-500'
    },
    { 
      title: 'Active Jobs', 
      value: stats.totalJobs, 
      icon: Briefcase, 
      color: 'from-purple-600 to-indigo-600', 
      shadow: 'shadow-purple-500/20',
      accent: 'from-purple-500 via-indigo-400 to-purple-600'
    },
    { 
      title: 'Shortlisted AI Match', 
      value: stats.shortlistedCandidates, 
      icon: Zap, 
      color: 'from-fuchsia-600 to-pink-500', 
      shadow: 'shadow-pink-500/20',
      accent: 'from-fuchsia-500 via-pink-400 to-purple-500'
    },
    { 
      title: 'Interviews Scheduled', 
      value: stats.interviewsScheduled, 
      icon: Calendar, 
      color: 'from-emerald-600 to-teal-500', 
      shadow: 'shadow-emerald-500/20',
      accent: 'from-emerald-500 via-teal-400 to-cyan-500'
    },
  ];

  return (
    <motion.div 
      className="space-y-8 relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Dashboard Executive Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#C084FC] uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              INTELLIGENCE OVERVIEW
            </span>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight font-['Outfit']">
            AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-[#C084FC]">Command</span> Center
          </h1>
          
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(20,10,32,0.65)] backdrop-blur-md border border-[rgba(168,85,247,0.22)] shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            </span>
            <span className="text-xs font-mono text-[#F8F7FF] font-medium">System nominal.</span>
            <span className="text-xs text-[#A8A0B8]">Real-time candidate analytics active.</span>
          </div>
        </div>

        {/* Quick Command Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7] text-white font-semibold text-sm shadow-[0_4px_20px_rgba(124,58,237,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_6px_25px_rgba(184,107,255,0.5)] border border-purple-400/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-purple-200" />
            <span>New Match Run</span>
          </button>
        </div>
      </motion.div>

      {/* 3D Perspective KPI Cards Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <KpiTiltCard key={index} stat={stat} />
        ))}
      </motion.div>

      {/* Split Panels: Live Stream & Active Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Live Candidate Stream */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col bg-[rgba(16,10,26,0.68)] backdrop-blur-2xl rounded-[24px] border border-[rgba(168,85,247,0.18)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden relative"
        >
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(184,107,255,0.35)] to-transparent pointer-events-none" />

          <div className="px-6 py-5 border-b border-[rgba(168,85,247,0.14)] bg-white/[0.015] flex justify-between items-center">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2.5 tracking-tight">
              <Users className="w-5 h-5 text-[#B86BFF]" />
              Live Candidate Stream
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#A8A0B8] uppercase tracking-wider mr-1">LIVE FEED</span>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400/80 shadow-[0_0_6px_#EF4444]" />
                <span className="w-2 h-2 rounded-full bg-amber-400/80 shadow-[0_0_6px_#F59E0B]" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Quick Stream Search Bar */}
          <div className="px-5 py-2.5 border-b border-[rgba(168,85,247,0.12)] bg-black/25 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#A8A0B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={streamSearch}
                onChange={(e) => setStreamSearch(e.target.value)}
                placeholder="Search candidates, skills, or resumes in stream..."
                className="w-full bg-[rgba(12,6,18,0.7)] border border-[rgba(168,85,247,0.22)] rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#A8A0B8]/50 focus:border-[#B86BFF] focus:outline-none transition-all font-mono"
              />
              {streamSearch && (
                <button
                  type="button"
                  onClick={() => setStreamSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A0B8] hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-white/[0.04] flex-1 overflow-auto p-3">
            {filteredStreamCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center mb-3">
                  <Users className="w-7 h-7 text-[#A8A0B8]" />
                </div>
                <p className="text-sm font-bold text-white">
                  {recentCandidates.length === 0 ? 'No active candidates' : 'No matching candidates'}
                </p>
                <p className="text-xs text-[#A8A0B8] mt-1 max-w-xs font-mono">
                  {recentCandidates.length === 0 
                    ? 'Upload resumes to view real-time candidate matches in the stream.'
                    : `No stream records matched "${streamSearch}".`}
                </p>
              </div>
            ) : (
              filteredStreamCandidates.map((candidate, i) => (
                <motion.div 
                  key={candidate.id} 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  whileHover={{ y: -3, scale: 1.008 }}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                  className="p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-purple-600/[0.08] hover:border hover:border-[rgba(184,107,255,0.25)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.5),_0_0_15px_rgba(168,85,247,0.15)] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar 
                        fallback={candidate.name} 
                        size="lg" 
                        className="border-2 border-[rgba(184,107,255,0.4)] shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:border-[#B86BFF] group-hover:shadow-[0_0_20px_rgba(184,107,255,0.5)] transition-all" 
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#050308] rounded-full shadow-[0_0_6px_#34D399]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-[#D8B4FE] transition-colors">
                        {candidate.name}
                      </h4>
                      <p className="text-xs font-mono font-medium text-[#C084FC] mt-0.5">
                        {candidate.skills.slice(0, 2).join(' • ')}
                      </p>
                      {candidate.resumeFile && (
                        <p className="text-[10px] font-mono text-[#D8B4FE]/70 flex items-center gap-1 mt-0.5 truncate max-w-[190px]">
                          <FileText className="w-2.5 h-2.5 text-[#B86BFF] shrink-0" />
                          <span className="truncate">{candidate.resumeFile}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <StatusBadge status={candidate.status} />
                    <div className="w-32 relative">
                      <ProgressBar 
                        value={candidate.matchScore ?? 0} 
                        className="h-1.5" 
                        colorClass={(candidate.matchScore ?? 0) > 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-300' : 'bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#B86BFF]'} 
                      />
                      <span className="text-[10px] font-mono font-bold text-[#A8A0B8] mt-1 block tracking-wider uppercase group-hover:text-white transition-colors">
                        {candidate.matchScore === null ? 'Not matched' : `${candidate.matchScore.toFixed(2)}% MATCH`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Active AI Deployments */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col bg-[rgba(16,10,26,0.68)] backdrop-blur-2xl rounded-[24px] border border-[rgba(168,85,247,0.18)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden relative text-white"
        >
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(184,107,255,0.35)] to-transparent pointer-events-none" />

          <div className="px-6 py-5 border-b border-[rgba(168,85,247,0.14)] bg-white/[0.015] flex justify-between items-center">
            <h3 className="text-base font-extrabold flex items-center gap-2.5 text-white tracking-tight">
              <Briefcase className="w-5 h-5 text-[#B86BFF]" />
              Active AI Deployments
            </h3>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs font-mono font-bold text-[#D8B4FE] hover:text-white px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 transition-all border border-purple-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.2)] hover:shadow-[0_0_18px_rgba(184,107,255,0.4)]"
            >
              <span>Jobs & Prep Kits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-white/[0.04] flex-1 overflow-auto p-3 relative z-10">
            {recentJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center mb-3">
                  <Briefcase className="w-7 h-7 text-[#A8A0B8]" />
                </div>
                <p className="text-sm font-bold text-white">No active jobs</p>
                <p className="text-xs text-[#A8A0B8] mt-1 max-w-xs">
                  Create or sync job profiles to deploy automated candidate matching.
                </p>
              </div>
            ) : (
              recentJobs.map((job, i) => (
                <motion.div 
                  key={job.id} 
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate('/jobs')}
                  className="p-4 rounded-xl hover:bg-purple-600/[0.08] transition-all duration-200 border border-transparent hover:border-[rgba(184,107,255,0.25)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="max-w-[70%]">
                      <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-[#D8B4FE] transition-colors">
                        {job.title}
                      </h4>
                      <p className="text-xs text-[#A8A0B8] line-clamp-2 mt-1 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="bg-purple-500/20 text-[#D8B4FE] border border-[rgba(184,107,255,0.4)] text-[11px] font-mono px-3 py-1 rounded-full font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                        {job.candidateCount} Matches
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {job.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-mono font-semibold tracking-wider uppercase text-[#D8B4FE] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
