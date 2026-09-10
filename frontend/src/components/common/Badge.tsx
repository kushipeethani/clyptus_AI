import React from 'react';
import { cn } from '../../utils/tw';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', dot = false, className, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-white/[0.06] text-[#A8A0B8] border border-white/10',
    primary: 'bg-purple-500/15 text-[#D8B4FE] border border-[rgba(168,85,247,0.35)] shadow-[0_0_12px_rgba(168,85,247,0.2)]',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 shadow-[0_0_12px_rgba(52,211,153,0.18)]',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-[0_0_12px_rgba(251,191,36,0.18)]',
    danger: 'bg-red-500/15 text-red-300 border border-red-500/35 shadow-[0_0_12px_rgba(239,68,68,0.18)]',
    outline: 'border border-[rgba(168,85,247,0.25)] text-[#A8A0B8] bg-transparent',
  };

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-[#B86BFF] shadow-[0_0_6px_#B86BFF]',
    success: 'bg-emerald-400 shadow-[0_0_6px_#34D399]',
    warning: 'bg-amber-400 shadow-[0_0_6px_#FBBF24]',
    danger: 'bg-red-400 shadow-[0_0_6px_#EF4444]',
    outline: 'bg-purple-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
