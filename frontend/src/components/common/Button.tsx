import React from 'react';
import { cn } from '../../utils/tw';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7] text-white shadow-[0_4px_20px_rgba(124,58,237,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_6px_28px_rgba(184,107,255,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] border border-purple-400/30 hover:border-purple-300/50 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200',
      secondary: 'bg-[rgba(20,10,32,0.7)] backdrop-blur-xl text-[#D8B4FE] border border-[rgba(168,85,247,0.28)] shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:bg-purple-600/20 hover:border-[rgba(184,107,255,0.5)] hover:text-white hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200',
      outline: 'bg-transparent text-[#F8F7FF] border border-[rgba(168,85,247,0.25)] hover:bg-purple-500/10 hover:border-purple-400/50 hover:text-white hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200',
      ghost: 'bg-transparent text-[#A8A0B8] hover:text-white hover:bg-white/[0.05] active:scale-[0.98] transition-colors duration-150',
      danger: 'bg-red-950/30 text-red-300 border border-red-500/40 shadow-[0_4px_15px_rgba(239,68,68,0.2)] hover:bg-red-900/40 hover:border-red-400/60 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg tracking-wide',
      md: 'px-4.5 py-2.5 text-sm font-semibold rounded-xl tracking-wide',
      lg: 'px-6 py-3.5 text-base font-bold rounded-2xl tracking-wide',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none focus:outline-none focus:ring-2 focus:ring-[#B86BFF]/50 focus:ring-offset-2 focus:ring-offset-[#050308]',
          variants[variant],
          sizes[size],
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none hover:brightness-100',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#D8B4FE]" />}
        {!isLoading && leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
