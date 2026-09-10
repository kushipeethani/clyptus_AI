import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Download, BrainCircuit, Briefcase, GraduationCap, CheckCircle2, XCircle } from 'lucide-react';
import { candidateService } from '../services/candidateService';
import { Candidate, MatchResult } from '../types';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      setIsLoading(true);
      try {
        const candidateId = parseInt(id || '0', 10);
        const candidateRes = await candidateService.getCandidateById(candidateId);
        setCandidate(candidateRes.data);
        try {
          const matchRes = await candidateService.getCandidateMatch(candidateId);
          setMatchResult(matchRes.data);
        } catch {
          setMatchResult(null);
        }
      } catch (err) {
        setError('Failed to load candidate details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [id]);

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" label="Decrypting Candidate Dossier..." />;
  if (error || !candidate) return (
    <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-300">
      <p className="font-bold">{error || 'Candidate record not found'}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/candidates')}>
        Return to Candidates
      </Button>
    </div>
  );

  const updateStatus = async (status: 'Shortlisted' | 'Rejected') => {
    try {
      const response = await candidateService.updateCandidateStatus(candidate.id, status);
      setCandidate(response.data);
    } catch {
      setError('Unable to update the candidate status.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/candidates')}
          className="flex items-center text-xs font-mono font-bold text-[#A8A0B8] hover:text-white transition-colors gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO CANDIDATE DATABASE
        </button>
        <div className="flex items-center gap-3">
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => updateStatus('Rejected')}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Reject
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => updateStatus('Shortlisted')}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Shortlist Candidate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card glow>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar 
                  size="xl" 
                  fallback={candidate.name} 
                  className="h-24 w-24 text-2xl border-2 border-[rgba(184,107,255,0.4)] shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-gradient-to-br from-[#2D124D] to-[#120724] text-[#D8B4FE]" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">{candidate.name}</h1>
                      <p className="text-[#D8B4FE] font-mono text-xs mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B86BFF]" />
                        {candidate.experience} YEARS PROFESSIONAL EXPERIENCE
                      </p>
                    </div>
                    <StatusBadge status={candidate.status} />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-[#A8A0B8]">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 text-[#B86BFF] shrink-0" /> 
                      <span className="truncate">{candidate.email}</span>
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#B86BFF] shrink-0" /> 
                        <span>{candidate.phone}</span>
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#B86BFF] shrink-0" /> 
                        <span>{candidate.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {candidate.summary && (
                <div className="mt-6 pt-6 border-t border-[rgba(168,85,247,0.14)]">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1 h-3 rounded-full bg-[#B86BFF]" />
                    AI Extracted Executive Summary
                  </h3>
                  <p className="text-[#A8A0B8] text-sm leading-relaxed bg-[rgba(10,5,18,0.5)] p-4 rounded-xl border border-[rgba(168,85,247,0.12)]">
                    {candidate.summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Matrix */}
          <Card glow>
            <CardHeader>
              <CardTitle>Identified Core Competencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(skill => (
                  <Badge key={skill} variant="primary" className="px-3 py-1 font-mono text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience Timeline */}
          {candidate.experienceDetails && candidate.experienceDetails.length > 0 && (
            <Card glow>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#B86BFF]" /> 
                  Career History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {candidate.experienceDetails.map((exp, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-[rgba(168,85,247,0.2)] last:border-0 pb-2">
                    <div className="absolute w-3 h-3 bg-[#B86BFF] rounded-full -left-[7px] top-1.5 ring-4 ring-[#050308] shadow-[0_0_8px_#B86BFF]" />
                    <h4 className="font-bold text-white text-base">{exp.jobTitle}</h4>
                    <p className="text-xs font-mono font-medium text-[#C084FC] mb-2">
                      {exp.company} <span className="text-[#A8A0B8] mx-1">•</span> <span className="text-[#A8A0B8] font-normal">{exp.duration}</span>
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-[#A8A0B8] leading-relaxed">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {candidate.education && candidate.education.length > 0 && (
            <Card glow>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#B86BFF]" /> 
                  Academic Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.education.map((edu, index) => (
                  <div key={index} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <h4 className="font-bold text-white text-sm">{edu.degree}</h4>
                    <p className="text-xs font-mono text-[#A8A0B8] mt-0.5">{edu.university} • {edu.passingYear}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - AI Match Telemetry & Original File */}
        <div className="space-y-6">
          {matchResult && (
            <Card glow className="border-[rgba(184,107,255,0.3)] bg-[rgba(16,10,26,0.85)]">
              <CardHeader className="border-b-0 pb-0">
                <CardTitle className="flex items-center gap-2 text-white">
                  <BrainCircuit className="w-5 h-5 text-[#B86BFF]" /> 
                  AI Match Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Circular Gauge */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-purple-500/20 mb-2 relative shadow-[0_0_25px_rgba(168,85,247,0.25)]">
                    <svg className="w-full h-full absolute top-0 left-0 -rotate-90 transform" viewBox="0 0 36 36">
                      <path
                        className="text-white/5"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="text-[#B86BFF] transition-all duration-1000 ease-out"
                        strokeDasharray={`${matchResult.overallScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-white font-mono tracking-tight">{matchResult.overallScore}%</span>
                      <span className="text-[9px] font-mono text-[#A8A0B8] uppercase">OVERALL</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-[#D8B4FE] font-semibold">Weighted Neural Compatibility</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1 text-[#A8A0B8]">
                      <span>Skill Match</span>
                      <span className="text-white font-bold">{matchResult.skillMatch}%</span>
                    </div>
                    <ProgressBar value={matchResult.skillMatch} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1 text-[#A8A0B8]">
                      <span>Semantic Embedding Match</span>
                      <span className="text-white font-bold">{matchResult.semanticMatch}%</span>
                    </div>
                    <ProgressBar value={matchResult.semanticMatch} className="h-1.5" colorClass="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1 text-[#A8A0B8]">
                      <span>Keyword Density Match</span>
                      <span className="text-white font-bold">{matchResult.keywordMatch}%</span>
                    </div>
                    <ProgressBar value={matchResult.keywordMatch} className="h-1.5" colorClass="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-400" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-mono font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchedSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 rounded-lg border border-emerald-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <h4 className="text-xs font-mono font-bold text-white mt-4 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Missing Skill Opportunities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-red-500/15 text-red-300 rounded-lg border border-red-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploaded Dossier File */}
          <Card glow>
            <CardHeader>
              <CardTitle>Uploaded Resume Asset</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.resumeFile ? (
                <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-[rgba(168,85,247,0.2)]">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-[#B86BFF] border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-xs font-mono font-bold text-white truncate">
                      {candidate.resumeFile}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" title="Download Asset">
                    <Download className="w-4 h-4 text-[#A8A0B8] hover:text-white" />
                  </Button>
                </div>
              ) : (
                <p className="text-xs font-mono text-[#A8A0B8] italic">No physical resume uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
