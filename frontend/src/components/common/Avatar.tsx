import React from 'react';
import { cn } from '../../utils/tw';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-[#200F38] to-[#0D0518] text-[#D8B4FE] font-bold border border-[rgba(184,107,255,0.4)] shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 hover:shadow-[0_0_22px_rgba(184,107,255,0.55)] select-none',
        sizes[size],
        className
      )}
    >
      {/* 3D Glass Light reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      {src ? (
        <img src={src} alt={alt || fallback} className="w-full h-full object-cover" />
      ) : (
        <span className="relative z-10 tracking-tight">{fallback.substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
