import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/tw';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'New Candidate Match', href: '/upload', icon: Sparkles, isHighlight: true },
    { name: 'Jobs & AI Interview Prep', href: '/jobs', icon: Briefcase },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[rgba(8,5,15,0.92)] backdrop-blur-2xl border-r border-[rgba(168,85,247,0.18)] shadow-[10px_0_40px_rgba(0,0,0,0.85)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Logo Branding */}
        <div className="flex items-center h-20 px-6 border-b border-[rgba(168,85,247,0.14)] bg-gradient-to-r from-purple-950/20 via-transparent to-transparent">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* 3D Layered Cyber Prism Icon */}
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#1A0B2E] to-[#0A0414] border border-[rgba(168,85,247,0.35)] flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.35)] group-hover:border-[#B86BFF] group-hover:shadow-[0_0_30px_rgba(184,107,255,0.5)] transition-all duration-300">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-500/10 to-transparent pointer-events-none" />
              <svg className="w-6 h-6 transform group-hover:rotate-6 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#sidebarBrandGrad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="url(#sidebarBrandGrad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="url(#sidebarBrandGrad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="sidebarBrandGrad1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D8B4FE" />
                    <stop offset="0.5" stopColor="#B86BFF" />
                    <stop offset="1" stopColor="#7C3AED" />
                  </linearGradient>
                  <linearGradient id="sidebarBrandGrad2" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C084FC" />
                    <stop offset="1" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-white font-['Outfit'] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                CLYPTUS<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D8B4FE] via-[#B86BFF] to-[#A855F7] ml-0.5">.AI</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-3 text-[10px] font-bold tracking-[0.2em] text-[#A8A0B8]/70 uppercase font-mono">
            RECRUITMENT COMMAND
          </div>

          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3.5 px-3.5 py-3 text-sm font-medium rounded-xl transition-all duration-300 group overflow-hidden',
                  isActive
                    ? 'text-white bg-gradient-to-r from-purple-600/25 via-purple-600/15 to-transparent border-l-2 border-[#B86BFF] shadow-[inset_0_0_24px_rgba(168,85,247,0.22),_0_0_20px_rgba(168,85,247,0.18)] translate-x-1'
                    : 'text-[#A8A0B8] hover:text-white hover:bg-white/[0.04] hover:border-l-2 hover:border-purple-500/40'
                )
              }
              onClick={() => setIsOpen(false)}
            >
              {({ isActive }) => (
                <>
                  {/* Subtle 3D active background accent */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <motion.div
                    whileHover={{ scale: 1.15, rotate: isActive ? 0 : 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="relative z-10"
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors duration-300",
                      isActive 
                        ? "text-[#B86BFF] drop-shadow-[0_0_8px_rgba(184,107,255,0.7)]" 
                        : (item.isHighlight ? "text-[#C084FC]" : "text-[#A8A0B8] group-hover:text-[#D8B4FE]")
                    )} />
                  </motion.div>

                  <span className="z-10 relative font-medium tracking-wide">{item.name}</span>

                  {item.isHighlight && !isActive && (
                    <span className="ml-auto flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#B86BFF] shadow-[0_0_10px_#B86BFF] animate-pulse" />
                    </span>
                  )}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B86BFF] shadow-[0_0_6px_#B86BFF]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
