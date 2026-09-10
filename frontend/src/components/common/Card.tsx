import React from 'react';
import { cn } from '../../utils/tw';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function Card({ className, children, glow = false, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        'bg-[rgba(16,10,26,0.65)] backdrop-blur-2xl rounded-[22px] border border-[rgba(168,85,247,0.18)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-[#F8F7FF] relative overflow-hidden transition-all duration-300',
        glow && 'hover:border-[rgba(184,107,255,0.4)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.7),_0_0_30px_rgba(168,85,247,0.2)]',
        className
      )} 
      {...props}
    >
      {/* Subtle top inner light highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(184,107,255,0.3)] to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-5 border-b border-[rgba(168,85,247,0.12)] bg-white/[0.015] flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('text-lg font-extrabold text-white tracking-tight flex items-center gap-2', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-5 text-[#A8A0B8]', className)}>
      {children}
    </div>
  );
}
