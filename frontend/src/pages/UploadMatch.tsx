import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, ArrowRight, Sparkles, X, FileBadge, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { candidateService } from '../services/candidateService';

export default function UploadMatch() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Resume, 2: JD, 3: Processing
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [processingError, setProcessingError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'jd') => {
    if (e.target.files && e.target.files.length > 0) {
      if (type === 'resume') {
        setResumeFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      } else {
        const file = e.target.files[0];
        setJdFile(file);
        if (file.name.toLowerCase().endsWith('.txt')) {
          void file.text().then(setJobDescription).catch(() => {
            setProcessingError('The job description file could not be read. Paste the description below instead.');
          });
        }
      }
    }
  };

  const removeResume = (index: number) => {
    setResumeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeJd = () => {
    setJdFile(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'jd') => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (type === 'resume') {
        setResumeFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
      } else {
        const file = e.dataTransfer.files[0];
        setJdFile(file);
        if (file.name.toLowerCase().endsWith('.txt')) {
          void file.text().then(setJobDescription).catch(() => {
            setProcessingError('The job description file could not be read. Paste the description below instead.');
          });
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const handleNextStep = () => {
    if (step === 1 && resumeFiles.length > 0) setStep(2);
    else if (step === 2 && (jdFile || jobDescription.trim())) {
      setStep(3);
      void processApplications();
    }
  };

  const processApplications = async () => {
    setProcessingError('');
    setProgress(10);
    try {
      const upload = await candidateService.uploadResumes(resumeFiles);
      if (upload.successful_resumes.length === 0) {
        throw new Error(upload.failed_resumes[0]?.error || 'No resumes could be processed.');
      }
      setProgress(45);
      const job = jdFile
        ? await candidateService.createJobFromFile(jdFile, jobTitle.trim())
        : await candidateService.createJob(jobTitle.trim() || 'Job Description', jobDescription.trim());
      setProgress(70);
      await candidateService.getMatches(job.id);
      setProgress(100);
      navigate('/candidates');
    } catch (error: any) {
      setProcessingError(error?.response?.data?.detail || error?.message || 'Unable to process the job and resumes.');
      setStep(2);
      setProgress(0);
    }
  };

  const stepVariants = {
    inactive: { backgroundColor: 'rgba(255, 255, 255, 0.04)', color: '#A8A0B8', scale: 1, border: '1px solid rgba(168, 85, 247, 0.15)' },
    active: { backgroundColor: 'rgba(168, 85, 247, 0.22)', color: '#D8B4FE', scale: 1.08, border: '2px solid #B86BFF', boxShadow: '0 0 25px rgba(184, 107, 255, 0.5)' },
    completed: { backgroundColor: '#7C3AED', color: '#ffffff', scale: 1, border: '2px solid #B86BFF', boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)' }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-10 py-4 px-4 sm:px-0"
    >
      {/* Header telemetry */}
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(20,10,32,0.65)] border border-[rgba(168,85,247,0.3)] text-[#D8B4FE] text-xs font-mono font-semibold uppercase tracking-wider mb-1 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#B86BFF]" />
          <span>NEURAL EVALUATION PIPELINE</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight font-['Outfit']">
          Candidate Match <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-[#C084FC]">Intelligence</span>
        </h1>
        <p className="text-[#A8A0B8] max-w-lg mx-auto text-xs font-mono leading-relaxed">
          Upload resumes and let our AI engine extract competencies, evaluate experience, and compute semantic match scores against target JDs.
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center justify-center max-w-2xl mx-auto relative z-10">
        {[1, 2, 3].map((s, index) => {
          const isCompleted = step > s;
          const isActive = step === s;
          
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center relative group">
                <motion.div
                  variants={stepVariants}
                  initial="inactive"
                  animate={isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm relative z-10 transition-colors duration-300"
                >
                  {isCompleted ? <CheckCircle className="w-6 h-6 text-white" /> : s}
                </motion.div>
                <div className={`absolute top-14 whitespace-nowrap text-[11px] font-mono font-bold tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-[#D8B4FE]' : isCompleted ? 'text-white' : 'text-[#A8A0B8]/60'}`}>
                  {s === 1 ? '1. Resumes' : s === 2 ? '2. Job Description' : '3. AI Matching'}
                </div>
              </div>
              
              {index < 2 && (
                <div className="flex-1 h-1 mx-4 relative bg-white/5 rounded-full overflow-hidden border border-[rgba(168,85,247,0.1)]">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#B86BFF] shadow-[0_0_10px_#B86BFF]"
                    initial={{ width: '0%' }}
                    animate={{ width: step > s ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Container Card */}
      <div className="mt-16 bg-[rgba(16,10,26,0.7)] backdrop-blur-2xl rounded-[26px] overflow-hidden relative border border-[rgba(168,85,247,0.2)] shadow-[0_25px_70px_rgba(0,0,0,0.6)]">
        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(184,107,255,0.4)] to-transparent pointer-events-none" />

        <div className="p-8 sm:p-12 relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black text-white font-['Outfit']">Upload Candidate Resumes</h2>
                  <p className="text-[#A8A0B8] text-xs font-mono">PDF resumes are parsed securely by the backend AI engine (up to 10MB each).</p>
                </div>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'resume')}
                  onMouseMove={handleMouseMove}
                  className="perspective-1000"
                >
                  <motion.div 
                    animate={{ 
                      scale: isDragging ? 1.015 : 1,
                      borderColor: isDragging ? '#B86BFF' : 'rgba(168, 85, 247, 0.25)',
                      backgroundColor: isDragging ? 'rgba(168, 85, 247, 0.12)' : 'rgba(12, 6, 18, 0.65)'
                    }}
                    className="border-2 border-dashed rounded-2xl p-12 transition-all duration-300 relative overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#B86BFF]/70"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple
                      className="hidden" 
                      accept="application/pdf,.pdf"
                      onChange={(e) => handleFileChange(e, 'resume')}
                    />

                    <div className="flex flex-col items-center justify-center relative z-10">
                      <motion.div 
                        whileHover={{ y: -4, scale: 1.05 }}
                        className="w-20 h-20 bg-gradient-to-br from-[#2D124D] to-[#120724] rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.35)] flex items-center justify-center mb-5 border border-[rgba(184,107,255,0.4)]"
                      >
                        <UploadCloud className="w-10 h-10 text-[#D8B4FE]" />
                      </motion.div>
                      <span className="text-lg text-white font-bold mb-1 font-['Outfit']">
                        {isDragging ? 'Drop Resumes Into Zone' : 'Click or Drag Resumes Here'}
                      </span>
                      <span className="text-xs font-mono text-[#A8A0B8]">Batch upload supported • Fast multi-resume ingestion</span>
                    </div>
                  </motion.div>
                </div>

                {/* Uploaded Files Grid */}
                {resumeFiles.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <h3 className="text-xs font-mono font-bold text-[#A8A0B8] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B86BFF]" />
                      Files Queued For Parsing ({resumeFiles.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                      <AnimatePresence>
                        {resumeFiles.map((f, i) => (
                          <motion.div 
                            key={`${f.name}-${i}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center justify-between bg-white/[0.03] border border-[rgba(168,85,247,0.18)] p-3.5 rounded-xl shadow-sm hover:border-[rgba(184,107,255,0.4)] transition-colors group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-[#D8B4FE]">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-mono font-semibold text-white truncate">{f.name}</span>
                                <span className="text-[10px] font-mono text-[#A8A0B8]">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeResume(i); }}
                              className="p-1.5 text-[#A8A0B8] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                <div className="pt-4 flex justify-end">
                  <button 
                    disabled={resumeFiles.length === 0}
                    onClick={handleNextStep}
                    className="px-8 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7] shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_25px_rgba(184,107,255,0.5)] border border-purple-400/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  >
                    <span>Configure Job Description</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black text-white font-['Outfit']">Target Job Description</h2>
                  <p className="text-[#A8A0B8] text-xs font-mono">Specify the role title and description to calibrate candidate match ranking.</p>
                </div>

                {processingError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-xs font-mono text-red-300">
                    {processingError}
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="Job Title (e.g. Senior AI / ML Systems Engineer)"
                    className="w-full rounded-xl border border-[rgba(168,85,247,0.25)] bg-[rgba(12,6,18,0.75)] backdrop-blur-xl px-4 py-3 text-sm text-white placeholder-[#A8A0B8]/50 outline-none focus:border-[#B86BFF] focus:ring-2 focus:ring-[#B86BFF]/25 transition-all font-medium"
                  />
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the target job description, core responsibilities, and mandatory skills..."
                    rows={8}
                    className="w-full resize-y rounded-xl border border-[rgba(168,85,247,0.25)] bg-[rgba(12,6,18,0.75)] backdrop-blur-xl px-4 py-3 text-sm text-white placeholder-[#A8A0B8]/50 outline-none focus:border-[#B86BFF] focus:ring-2 focus:ring-[#B86BFF]/25 transition-all font-medium leading-relaxed"
                  />
                </div>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'jd')}
                  onMouseMove={handleMouseMove}
                  className="perspective-1000"
                >
                  <motion.div 
                    animate={{ 
                      scale: isDragging ? 1.015 : 1,
                      borderColor: isDragging ? '#B86BFF' : 'rgba(168, 85, 247, 0.25)',
                      backgroundColor: isDragging ? 'rgba(168, 85, 247, 0.12)' : 'rgba(12, 6, 18, 0.65)'
                    }}
                    className="border-2 border-dashed rounded-2xl p-8 transition-colors duration-300 relative overflow-hidden group cursor-pointer text-center hover:border-[#B86BFF]/70"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="application/pdf,.pdf,text/plain,.txt"
                      onChange={(e) => handleFileChange(e, 'jd')}
                    />
                    
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2D124D] to-[#120724] rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center mb-3 border border-[rgba(184,107,255,0.4)]">
                        <FileBadge className="w-7 h-7 text-[#D8B4FE]" />
                      </div>
                      <span className="text-sm font-bold text-white mb-1">
                        {isDragging ? 'Drop JD File Here' : 'Or Upload JD as PDF/TXT'}
                      </span>
                      <span className="text-[11px] font-mono text-[#A8A0B8]">Automated text extraction from PDF or plain text</span>
                    </div>
                  </motion.div>
                </div>

                {jdFile && (
                  <div className="flex items-center justify-between bg-white/[0.03] border border-[rgba(184,107,255,0.4)] p-4 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[#B86BFF]">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-white block">{jdFile.name}</span>
                        <span className="text-[10px] font-mono text-[#A8A0B8]">{(jdFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI Matching</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeJd(); }}
                      className="p-2 text-[#A8A0B8] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="pt-4 flex justify-between items-center">
                  <button 
                    onClick={() => setStep(1)}
                    className="text-xs font-mono font-bold text-[#A8A0B8] hover:text-white px-4 py-2 transition-colors uppercase tracking-wider"
                  >
                    ← Back
                  </button>
                  <button 
                    disabled={!jdFile && !jobDescription.trim()}
                    onClick={handleNextStep}
                    className="px-8 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7] shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_25px_rgba(184,107,255,0.5)] border border-purple-400/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  >
                    <Zap className="w-4 h-4 text-purple-200" />
                    <span>Initiate AI Neural Matching</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Glowing AI rings */}
                  <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full animate-spin-slow" />
                  <div className="absolute inset-2 border-2 border-t-[#B86BFF] border-r-transparent border-b-[#7C3AED] border-l-transparent rounded-full animate-spin" />
                  <div className="absolute inset-4 border border-purple-500/10 rounded-full" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D124D] to-[#120724] border border-[rgba(184,107,255,0.5)] flex items-center justify-center shadow-[0_0_25px_rgba(184,107,255,0.5)]">
                    <Cpu className="w-7 h-7 text-[#D8B4FE] animate-pulse" />
                  </div>
                </div>

                <div className="space-y-4 max-w-sm w-full">
                  <h2 className="text-2xl font-black text-white font-['Outfit']">
                    Evaluating {resumeFiles.length} Candidate{resumeFiles.length > 1 ? 's' : ''}...
                  </h2>
                  <p className="text-xs font-mono text-[#A8A0B8] h-5">
                    {progress < 30 ? 'Parsing resumes & extracting core entities...' : 
                     progress < 70 ? 'Vectorizing skills & calculating embeddings...' : 
                     'Computing weighted neural compatibility scores...'}
                  </p>
                  
                  <div className="w-full h-2.5 bg-[#0E061A] rounded-full overflow-hidden relative border border-[rgba(168,85,247,0.25)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#B86BFF] rounded-full shadow-[0_0_15px_rgba(184,107,255,0.7)]"
                      style={{ width: `${progress}%` }}
                      layout
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-[#D8B4FE]">
                    <span>STATUS: IN PROGRESS</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
