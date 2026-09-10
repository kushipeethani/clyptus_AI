import React from 'react';
import { cn } from '../../utils/tw';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#A8A0B8] mb-1.5 uppercase tracking-wider font-mono">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A0B8]/70">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'block w-full rounded-xl border border-[rgba(168,85,247,0.22)] bg-[rgba(12,6,18,0.75)] backdrop-blur-xl px-3.5 py-2.5 text-sm text-[#F8F7FF] placeholder-[#A8A0B8]/50',
              'focus:border-[#B86BFF] focus:outline-none focus:ring-2 focus:ring-[#B86BFF]/25 focus:shadow-[0_0_20px_rgba(168,85,247,0.35)]',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
