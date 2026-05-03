'use client';

import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'teal' | 'green' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const variantTrack: Record<string, string> = {
  teal:  'bg-[rgba(0,229,204,0.1)]',
  green: 'bg-[rgba(127,255,0,0.1)]',
  pink:  'bg-[rgba(255,60,172,0.1)]',
};

const variantFill: Record<string, string> = {
  teal:  'bg-gradient-to-r from-[#00e5cc] to-[#00b8a3]',
  green: 'bg-gradient-to-r from-[#7fff00] to-[#5ecc00]',
  pink:  'bg-gradient-to-r from-[#ff3cac] to-[#cc2e89]',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
};

export function Progress({
  value,
  max = 100,
  variant = 'teal',
  size = 'md',
  showLabel = false,
  label,
  className,
  animated = true,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-[#4d7a90]">{label}</span>}
          {showLabel && (
            <span className="text-xs font-mono text-[#7aafc4]">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          variantTrack[variant],
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full',
            variantFill[variant],
            animated && 'transition-all duration-700 ease-out'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
