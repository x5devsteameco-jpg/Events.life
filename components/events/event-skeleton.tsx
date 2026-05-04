export function EventCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.06)' }}
    >
      {/* Banner skeleton */}
      <div className="h-44 w-full" style={{ background: 'rgba(0,229,204,0.04)' }} />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-2.5 w-20 rounded-full" style={{ background: 'rgba(0,229,204,0.08)' }} />
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded-lg" style={{ background: 'rgba(232,244,248,0.06)' }} />
          <div className="h-4 w-3/4 rounded-lg" style={{ background: 'rgba(232,244,248,0.04)' }} />
        </div>
        {/* Date */}
        <div className="h-3 w-28 rounded-full" style={{ background: 'rgba(77,122,144,0.15)' }} />
        {/* Location */}
        <div className="h-3 w-36 rounded-full" style={{ background: 'rgba(77,122,144,0.1)' }} />
        {/* Footer */}
        <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'rgba(0,229,204,0.06)' }}>
          <div className="h-3 w-24 rounded-full" style={{ background: 'rgba(77,122,144,0.1)' }} />
          <div className="h-3 w-20 rounded-full" style={{ background: 'rgba(0,229,204,0.08)' }} />
        </div>
      </div>
    </div>
  );
}

export function EventsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
