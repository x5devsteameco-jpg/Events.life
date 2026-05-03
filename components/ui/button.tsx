'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Button Props ─────────────────────────────────────────────────────────────
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: [
    'bg-gradient-to-r from-[#00c4a8] to-[#00e5cc]',
    'text-[#020408] font-bold',
    'border-0',
    'hover:shadow-[0_0_24px_rgba(0,229,204,0.4)] hover:-translate-y-0.5',
    'active:translate-y-0',
  ].join(' '),
  secondary: [
    'bg-[rgba(0,229,204,0.08)]',
    'text-[#00e5cc]',
    'border border-[rgba(0,229,204,0.2)]',
    'hover:bg-[rgba(0,229,204,0.15)] hover:border-[#00e5cc] hover:shadow-[0_0_16px_rgba(0,229,204,0.25)]',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-[#7aafc4]',
    'border border-[rgba(255,255,255,0.04)]',
    'hover:bg-[#1a3040] hover:text-[#e8f4f8] hover:border-[rgba(0,229,204,0.08)]',
  ].join(' '),
  danger: [
    'bg-gradient-to-r from-[#ff3cac] to-[#cc2e89]',
    'text-white font-bold',
    'border-0',
    'hover:shadow-[0_0_24px_rgba(255,60,172,0.4)] hover:-translate-y-0.5',
  ].join(' '),
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3.5 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-[10px]',
  lg: 'px-7 py-3.5 text-base gap-2 rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e5cc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020408]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'relative overflow-hidden select-none whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
