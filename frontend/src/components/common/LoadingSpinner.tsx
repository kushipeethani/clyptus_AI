import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ className, label = 'AI Engine Synchronizing...' }: { className?: string; label?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 gap-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing orb */}
        <div className="absolute w-14 h-14 rounded-full bg-purple-500/20 filter blur-md animate-pulse" />
        {/* Rotating cyber spinner */}
        <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-[#B86BFF] border-r-[#7C3AED] animate-spin shadow-[0_0_15px_rgba(184,107,255,0.4)]" />
      </div>
      {label && (
        <p className="text-xs font-mono font-medium tracking-widest uppercase text-[#A8A0B8] animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
