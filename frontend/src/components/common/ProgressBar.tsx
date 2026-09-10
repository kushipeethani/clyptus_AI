import React from 'react';
import { cn } from '../../utils/tw';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  colorClass?: string;
  showValue?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  colorClass = 'bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#B86BFF]', 
  showValue = false 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full select-none", className)}>
      {showValue && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
          <span className="text-[#A8A0B8] uppercase tracking-wider font-medium">AI Match</span>
          <span className="text-white font-bold tracking-tight">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full bg-[#0E061A]/80 rounded-full h-2 p-[1px] overflow-hidden border border-[rgba(168,85,247,0.2)] shadow-[inset_0_1px_4px_rgba(0,0,0,0.7)] relative">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(184,107,255,0.6)] relative overflow-hidden", 
            colorClass
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Subtle animated light shimmer across the progress fill */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
