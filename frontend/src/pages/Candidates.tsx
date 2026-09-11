import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, XCircle, Users, Sparkles, UserPlus, FileText, Phone, Trash2 } from 'lucide-react';
import { candidateService } from '../services/candidateService';
import { Candidate } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Sync with searchParams if changed from external navigation
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await candidateService.getCandidates();
      setCandidates(response.data);
      setFilteredCandidates(response.data);
    } catch (err) {
      setError('Failed to load candidates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Handle filtering
    let result = [...candidates];

    if (searchTerm.trim()) {
      const lowercasedSearch = searchTerm.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lowercasedSearch) ||
        c.email.toLowerCase().includes(lowercasedSearch) ||
        (c.phone && c.phone.toLowerCase().includes(lowercasedSearch)) ||
        c.skills.some(s => s.toLowerCase().includes(lowercasedSearch)) ||
        (c.summary && c.summary.toLowerCase().includes(lowercasedSearch)) ||
        (c.resumeFile && c.resumeFile.toLowerCase().includes(lowercasedSearch))
      );
    }

    if (statusFilter) {
      result = result.filter(c => c.status === statusFilter);
    }

    // Sort by match percentage (high matching first)
    result.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));

    setFilteredCandidates(result);
    setCurrentPage(1); // Reset page on filter
  }, [searchTerm, statusFilter, candidates]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await candidateService.updateCandidateStatus(id, newStatus);
      // Update local state
      setCandidates(candidates.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    if (!window.confirm(`Are you sure you want to permanently delete candidate ${candidate.name} and their uploaded resume?`)) {
      return;
    }
    try {
      await candidateService.deleteCandidate(candidate.id);
      setCandidates(prev => prev.filter(c => c.id !== candidate.id));
    } catch (err) {
      alert('Failed to delete candidate.');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-['Outfit']">
            Candidate <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-[#C084FC]">Database</span>
          </h1>
          <p className="text-xs font-mono text-[#A8A0B8] mt-1">Review applicant profiles, neural match scoring, and resume pipeline</p>
        </div>
        <Button onClick={() => navigate('/upload')} leftIcon={<UserPlus className="w-4 h-4" />}>
          Add Candidate
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[rgba(16,10,26,0.68)] backdrop-blur-2xl p-4.5 rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-[rgba(168,85,247,0.18)] flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search candidate name, email, skills, or resume keywords..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) {
                setSearchParams({ search: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
          />
        </div>
        <div className="w-full md:w-72 flex items-center gap-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A0B8]">
              <Filter className="w-4 h-4" />
            </div>
            <select
              className="w-full bg-[rgba(12,6,18,0.75)] backdrop-blur-xl border border-[rgba(168,85,247,0.22)] rounded-xl shadow-sm text-white focus:border-[#B86BFF] focus:ring-2 focus:ring-[#B86BFF]/25 text-xs font-mono py-2.5 pl-9 pr-8 outline-none transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="" className="bg-[#0e071a] text-white">All Candidate Stages</option>
              <option value="New" className="bg-[#0e071a] text-white">Stage: New</option>
              <option value="Under Review" className="bg-[#0e071a] text-white">Stage: Under Review</option>
              <option value="Shortlisted" className="bg-[#0e071a] text-white">Stage: Shortlisted</option>
              <option value="Interview Scheduled" className="bg-[#0e071a] text-white">Stage: Interview Scheduled</option>
              <option value="Selected" className="bg-[#0e071a] text-white">Stage: Selected</option>
              <option value="Rejected" className="bg-[#0e071a] text-white">Stage: Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <LoadingSpinner className="min-h-[50vh]" label="Loading Candidate Intelligence..." />
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-300 flex items-center justify-between font-mono text-xs">
          <span>{error}</span>
          <Button onClick={fetchCandidates} size="sm">Retry</Button>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-[rgba(16,10,26,0.65)] backdrop-blur-2xl rounded-[22px] shadow-2xl border border-[rgba(168,85,247,0.18)] p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Users className="h-8 w-8 text-[#C084FC]" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {candidates.length === 0 ? 'No Candidates In Database' : 'No Matching Candidates'}
          </h3>
          <p className="mt-1 text-xs text-[#A8A0B8] max-w-sm mx-auto font-mono">
            {candidates.length === 0 
              ? 'There are currently no candidates in the portal. Upload resumes to get started.'
              : `No candidates matched "${searchTerm}". Try different skills or keywords.`}
          </p>
          {candidates.length === 0 ? (
            <div className="mt-6">
              <Button onClick={() => navigate('/upload')}>Upload Resumes</Button>
            </div>
          ) : (
            <div className="mt-6">
              <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); setSearchParams({}); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Extracted Skills</TableHead>
                <TableHead>AI Match</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div>
                      <div className="font-bold text-white tracking-wide">{candidate.name}</div>
                      <div className="text-[#A8A0B8] text-xs font-mono mt-0.5">{candidate.email}</div>
                      {candidate.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D8B4FE]/90 mt-0.5">
                          <Phone className="w-3 h-3 text-[#B86BFF] shrink-0" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      {candidate.resumeFile && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-[#D8B4FE]/80 mt-1">
                          <FileText className="w-3 h-3 text-[#B86BFF]" />
                          <span>{candidate.resumeFile}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#D8B4FE] font-mono text-xs">{candidate.experience} yrs</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                      {candidate.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[#D8B4FE] text-[10px] font-mono font-medium rounded-md">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/[0.04] border border-white/10 text-[#A8A0B8] text-[10px] font-mono rounded-md">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono font-bold text-xs ${(candidate.matchScore ?? 0) >= 80 ? 'text-emerald-400' : (candidate.matchScore ?? 0) >= 60 ? 'text-[#D8B4FE]' : 'text-[#A8A0B8]'}`}>
                      {candidate.matchScore === null ? 'Pending' : `${candidate.matchScore.toFixed(1)}%`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={candidate.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/candidates/${candidate.id}`)} title="View Profile">
                        <Eye className="w-4 h-4 text-[#A8A0B8] hover:text-[#B86BFF]" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(candidate.id, 'Shortlisted')} title="Shortlist Candidate">
                        <CheckCircle className="w-4 h-4 text-[#A8A0B8] hover:text-emerald-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(candidate.id, 'Rejected')} title="Reject Candidate">
                        <XCircle className="w-4 h-4 text-[#A8A0B8] hover:text-red-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCandidate(candidate)} title="Delete Candidate and Resume">
                        <Trash2 className="w-4 h-4 text-[#A8A0B8] hover:text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages || 1}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
