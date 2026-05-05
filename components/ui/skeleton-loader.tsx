'use client';

import { motion } from 'framer-motion';

export function Skeleton({ width = 'w-full', height = 'h-4', className = '' }: { width?: string; height?: string; className?: string }) {
  return (
    <motion.div
      className={`${width} ${height} rounded-lg bg-gradient-to-r from-[rgba(0,229,204,0.05)] via-[rgba(0,229,204,0.1)] to-[rgba(0,229,204,0.05)] ${className}`}
      animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ backgroundSize: '200% 100%' }}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
      <div className="h-44 bg-gradient-to-r from-[rgba(0,229,204,0.05)] to-[rgba(0,180,150,0.05)]" />
      <div className="p-4 space-y-3">
        <Skeleton height="h-3" width="w-1/3" />
        <Skeleton height="h-4" width="w-4/5" />
        <Skeleton height="h-3" width="w-2/3" />
        <div className="pt-2 flex gap-2">
          <Skeleton height="h-2" width="w-1/4" />
          <Skeleton height="h-2" width="w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height="h-8" width="w-1/3" />
      <Skeleton height="h-4" width="w-3/4" />
      <Skeleton height="h-4" width="w-2/3" />
    </div>
  );
}
