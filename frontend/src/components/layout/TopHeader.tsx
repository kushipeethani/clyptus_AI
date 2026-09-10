import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Bell, Search, LogOut, User as UserIcon, Command, Sparkles, X, 
  ArrowRight, UserCheck, FileText, CheckCheck, Clock, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { candidateService } from '../../services/candidateService';
import { Candidate } from '../../types';

interface TopHeaderProps {
  onMenuClick: () => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'match' | 'interview' | 'candidate' | 'system';
  link?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High-Match Candidate Discovered',
    description: 'Alex Morgan matches 94% with Senior Full-Stack Engineer role.',
    time: '5m ago',
    read: false,
    type: 'match',
    link: '/candidates'
  },
  {
    id: 'notif-2',
    title: 'AI Technical Interview Evaluated',
    description: 'Autonomous scoring & report generated for Sarah Chen.',
    time: '22m ago',
    read: false,
    type: 'interview',
    link: '/jobs'
  },
  {
    id: 'notif-3',
    title: 'Batch Resume Ingestion Complete',
    description: 'Successfully parsed and indexed 12 new engineering profiles.',
    time: '1h ago',
    read: false,
    type: 'candidate',
    link: '/upload'
  },
  {
    id: 'notif-4',
    title: 'Candidate Advanced Stage',
    description: 'David Kim moved to Client Offer Presentation stage.',
    time: '3h ago',
    read: true,
    type: 'system',
    link: '/candidates'
  },
  {
    id: 'notif-5',
    title: 'New Position Created',
    description: 'DevOps & SRE Lead opened by Engineering Hiring Team.',
    time: '1d ago',
    read: true,
    type: 'system',
    link: '/jobs'
  }
];

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.link) {
      setNotificationsOpen(false);
      navigate(item.link);
    }
  };

  const handleDismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Fetch candidates for real-time live search
  useEffect(() => {
    candidateService.getCandidates()
      .then((res) => setCandidates(res.data))
      .catch(() => {});
  }, []);

  // Filter candidates live as search query updates
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCandidates([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const matches = candidates.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(query);
      const emailMatch = c.email.toLowerCase().includes(query);
      const skillsMatch = c.skills.some((s) => s.toLowerCase().includes(query));
      const summaryMatch = c.summary ? c.summary.toLowerCase().includes(query) : false;
      const resumeMatch = c.resumeFile ? c.resumeFile.toLowerCase().includes(query) : false;
      return nameMatch || emailMatch || skillsMatch || summaryMatch || resumeMatch;
    });

    // Rank by match score if available
    matches.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
    setFilteredCandidates(matches);
  }, [searchQuery, candidates]);

  // Click outside listener for user dropdown, search dropdown & notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setNotificationsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCandidate = (candidateId: number) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate(`/candidates/${candidateId}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/candidates?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const showResults = isSearchFocused && searchQuery.trim().length > 0;

  return (
    <header className="bg-[rgba(8,5,15,0.85)] backdrop-blur-2xl border-b border-[rgba(168,85,247,0.18)] h-20 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="p-2.5 text-[#A8A0B8] rounded-xl lg:hidden hover:bg-white/5 hover:text-white focus:outline-none transition-colors border border-transparent hover:border-purple-500/20"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Futuristic Search Command Bar with Live Candidate Results */}
        <div className="flex flex-1 max-w-[460px] relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="w-full">
            <motion.div 
              animate={{ 
                boxShadow: isSearchFocused ? '0 0 25px rgba(168, 85, 247, 0.35)' : 'none',
                borderColor: isSearchFocused ? 'rgba(184, 107, 255, 0.6)' : 'rgba(168, 85, 247, 0.18)'
              }}
              className="relative flex items-center w-full bg-[rgba(15,9,26,0.6)] backdrop-blur-xl rounded-2xl border transition-all duration-300"
            >
              <div className="pl-3.5 flex items-center pointer-events-none">
                <motion.div
                  animate={{ 
                    rotate: isSearchFocused ? 90 : 0, 
                    scale: isSearchFocused ? 1.15 : 1,
                    color: isSearchFocused ? '#B86BFF' : '#A8A0B8' 
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <Search className="h-4 w-4" />
                </motion.div>
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-3 pr-20 py-2.5 bg-transparent border-none focus:ring-0 text-sm text-[#F8F7FF] placeholder-[#A8A0B8]/60 outline-none font-medium"
                placeholder="Search candidates, skills, or resumes..."
                onFocus={() => setIsSearchFocused(true)}
              />

              {/* Clear button when text present */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mr-2 text-[#A8A0B8] hover:text-white p-1 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Keyboard shortcut hint */}
              <div className="absolute right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] font-mono text-[#A8A0B8] pointer-events-none">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </motion.div>
          </form>

          {/* Floating Live Candidate Search Dropdown */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute left-0 top-[calc(100%+0.5rem)] w-full max-h-[460px] bg-[rgba(14,8,24,0.96)] backdrop-blur-2xl rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(168,85,247,0.25)] border border-[rgba(184,107,255,0.35)] z-50 overflow-hidden flex flex-col"
              >
                {/* Search Header */}
                <div className="px-4 py-3 border-b border-[rgba(168,85,247,0.15)] bg-white/[0.02] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#D8B4FE] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B86BFF]" />
                    CANDIDATE INTELLIGENCE SEARCH
                  </span>
                  <span className="text-[#A8A0B8] text-[11px]">
                    {filteredCandidates.length} MATCH{filteredCandidates.length === 1 ? '' : 'ES'}
                  </span>
                </div>

                {/* Candidate Results List */}
                <div className="overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1 max-h-[340px]">
                  {filteredCandidates.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-2 text-[#A8A0B8]">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-mono font-bold text-white">No candidates found</p>
                      <p className="text-[11px] font-mono text-[#A8A0B8] mt-0.5">
                        No resumes matched "{searchQuery}"
                      </p>
                    </div>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <motion.div
                        key={candidate.id}
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(168, 85, 247, 0.12)' }}
                        onClick={() => handleSelectCandidate(candidate.id)}
                        className="p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group border border-transparent hover:border-[rgba(184,107,255,0.3)]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar 
                            fallback={candidate.name} 
                            size="md" 
                            className="border border-[rgba(184,107,255,0.4)] shadow-[0_0_10px_rgba(168,85,247,0.25)] shrink-0" 
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white group-hover:text-[#D8B4FE] transition-colors truncate">
                                {candidate.name}
                              </h4>
                              {candidate.matchScore !== null && (
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  candidate.matchScore >= 80 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-purple-500/20 text-[#D8B4FE] border border-purple-500/30'
                                }`}>
                                  {candidate.matchScore.toFixed(0)}% Match
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-[#A8A0B8] truncate mt-0.5">
                              {candidate.email} • {candidate.experience} yrs exp
                            </p>
                            {candidate.resumeFile && (
                              <p className="text-[10px] font-mono text-[#D8B4FE]/80 truncate mt-0.5 flex items-center gap-1">
                                <FileText className="w-2.5 h-2.5 text-[#B86BFF] shrink-0" />
                                <span className="truncate">{candidate.resumeFile}</span>
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {candidate.skills.slice(0, 3).map((skill) => (
                                <span 
                                  key={skill} 
                                  className="text-[9px] font-mono px-1.5 py-0.2 bg-purple-500/10 text-purple-200 rounded border border-purple-500/20"
                                >
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 3 && (
                                <span className="text-[9px] font-mono text-[#A8A0B8]">
                                  +{candidate.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pl-2 shrink-0">
                          <ArrowRight className="w-4 h-4 text-[#A8A0B8] group-hover:text-[#B86BFF] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer Action */}
                <div 
                  onClick={() => handleSearchSubmit()}
                  className="px-4 py-2.5 border-t border-[rgba(168,85,247,0.15)] bg-white/[0.02] hover:bg-purple-600/15 cursor-pointer flex items-center justify-between text-xs font-mono text-[#D8B4FE] transition-colors"
                >
                  <span>View all in Candidates Database</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Controls: Notifications + Recruiter Profile */}
      <div className="flex items-center gap-5">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setNotificationsOpen(prev => !prev)}
            className={`relative p-2.5 transition-colors rounded-xl border ${
              notificationsOpen 
                ? 'bg-purple-500/20 text-white border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'text-[#A8A0B8] hover:text-white bg-white/[0.03] hover:bg-purple-500/10 border-white/5 hover:border-purple-500/30'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B86BFF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B86BFF] shadow-[0_0_8px_#B86BFF]" />
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 top-[calc(100%+0.75rem)] mt-1 w-80 sm:w-96 bg-[rgba(14,8,24,0.96)] backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(168,85,247,0.2)] border border-[rgba(168,85,247,0.22)] z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="px-4 py-3.5 border-b border-[rgba(168,85,247,0.18)] bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-[#D8B4FE] border border-purple-500/30 font-semibold">
                        {unreadCount} new
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#A8A0B8]">
                        All read
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-[#D8B4FE] hover:text-white flex items-center gap-1 font-mono transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.04]">
                  {notifications.length === 0 ? (
                    <div className="px-6 py-10 text-center text-[#A8A0B8]">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-purple-400/40" />
                      <p className="text-sm font-medium text-white">No notifications</p>
                      <p className="text-xs text-[#A8A0B8] mt-0.5">You're completely up to date.</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                          item.read 
                            ? 'bg-transparent hover:bg-white/[0.03]' 
                            : 'bg-purple-900/[0.12] hover:bg-purple-900/[0.22]'
                        }`}
                      >
                        {/* Type Icon Badge */}
                        <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                          item.type === 'match' 
                            ? 'bg-purple-500/20 text-[#B86BFF] border border-purple-500/30' 
                            : item.type === 'interview'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.type === 'candidate'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.type === 'match' && <Sparkles className="w-4 h-4" />}
                          {item.type === 'interview' && <UserCheck className="w-4 h-4" />}
                          {item.type === 'candidate' && <FileText className="w-4 h-4" />}
                          {item.type === 'system' && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-xs font-semibold truncate ${item.read ? 'text-[#D0C8E0]' : 'text-white'}`}>
                              {item.title}
                            </p>
                            {!item.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B86BFF] shadow-[0_0_6px_#B86BFF] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#A8A0B8] line-clamp-2 mt-0.5 group-hover:text-white/80 transition-colors leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-[#A8A0B8]/80">
                            <Clock className="w-3 h-3" />
                            <span>{item.time}</span>
                          </div>
                        </div>

                        {/* Dismiss action */}
                        <button
                          onClick={(e) => handleDismissNotification(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#A8A0B8] hover:text-white hover:bg-white/10 rounded-lg transition-all absolute top-3 right-3"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-[rgba(168,85,247,0.15)] bg-white/[0.02] flex items-center justify-between text-xs font-mono text-[#D8B4FE]">
                    <span className="text-[11px] text-[#A8A0B8]">Autonomous Talent Feed</span>
                    <button 
                      onClick={() => setNotifications([])}
                      className="hover:text-white transition-colors text-[11px]"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Profile with 3D Glass Avatar */}
        <div className="flex items-center gap-3.5 pl-5 border-l border-[rgba(168,85,247,0.18)] relative" ref={dropdownRef}>
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-white tracking-wide">{user?.name || 'Recruiter'}</p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
              <p className="text-[10px] text-[#C084FC] font-mono font-semibold uppercase tracking-wider">{user?.role || 'RECRUITER'}</p>
            </div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="cursor-pointer relative group"
          >
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#B86BFF] opacity-70 group-hover:opacity-100 blur-[2px] transition duration-300" />
            <Avatar 
              fallback={user?.name || 'R'} 
              className="relative border-2 border-[rgba(168,85,247,0.5)] shadow-[0_0_15px_rgba(168,85,247,0.4)] bg-gradient-to-br from-[#2D124D] to-[#120724] text-[#D8B4FE] font-bold" 
            />
          </motion.div>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 top-[calc(100%+0.75rem)] mt-1 w-60 bg-[rgba(14,8,24,0.96)] backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(168,85,247,0.2)] border border-[rgba(168,85,247,0.22)] z-50 overflow-hidden p-2"
              >
                <div className="px-3.5 py-2.5 border-b border-white/5 mb-1.5">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || 'Recruiter'}</p>
                  <p className="text-[11px] text-[#A8A0B8] truncate">{user?.email || 'admin@example.com'}</p>
                </div>
                
                <button 
                  className="w-full text-left px-3.5 py-2.5 text-sm text-[#A8A0B8] hover:bg-purple-500/15 hover:text-white rounded-xl flex items-center gap-3 transition-colors font-medium"
                  onClick={() => setDropdownOpen(false)}
                >
                  <UserIcon className="w-4 h-4 text-[#B86BFF]" /> My Profile
                </button>
                <div className="h-px bg-white/5 my-1.5 mx-2" />
                <button 
                  className="w-full text-left px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/15 hover:text-red-300 rounded-xl flex items-center gap-3 transition-colors font-medium"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
