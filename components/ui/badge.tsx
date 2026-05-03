'use client';

import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'live'
  | 'draft'
  | 'private'
  | 'cancelled'
  | 'ended'
  | 'pending'
  | 'confirmed'
  | 'waitlisted'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantMap: Record<BadgeVariant, string> = {
  live:       'badge-live',
  draft:      'badge-draft',
  private:    'badge-private',
  cancelled:  'badge-cancelled',
  ended:      'badge-ended',
  pending:    'badge-pending',
  confirmed:  'badge-confirmed',
  waitlisted: 'badge-waitlisted',
  default:    'bg-[rgba(77,122,144,0.15)] text-[#4d7a90] border border-[rgba(77,122,144,0.3)]',
};

export function Badge({ variant = 'default', children, className, size = 'md' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Status to variant mapping ────────────────────────────────────────────────
export function statusToBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    LIVE:       'live',
    DRAFT:      'draft',
    PRIVATE:    'private',
    CANCELLED:  'cancelled',
    ENDED:      'ended',
    PENDING:    'pending',
    CONFIRMED:  'confirmed',
    WAITLISTED: 'waitlisted',
  };
  return map[status.toUpperCase()] ?? 'default';
}
