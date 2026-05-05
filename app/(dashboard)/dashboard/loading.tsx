export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-xl bg-white/5" />
        <div className="h-4 w-64 rounded-xl bg-white/5" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3">
            <div className="h-4 w-24 rounded-lg bg-white/5" />
            <div className="h-8 w-16 rounded-lg bg-white/8" />
            <div className="h-3 w-20 rounded-lg bg-white/5" />
          </div>
        ))}
      </div>

      {/* Activity feed skeleton */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
        <div className="h-5 w-32 rounded-lg bg-white/5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded-lg bg-white/5" />
              <div className="h-3 w-1/2 rounded-lg bg-white/4" />
            </div>
          </div>
        ))}
      </div>

      {/* Events list skeleton */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
        <div className="h-5 w-24 rounded-lg bg-white/5" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-t border-white/5">
            <div className="h-12 w-12 rounded-xl bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded-lg bg-white/5" />
              <div className="h-3 w-1/3 rounded-lg bg-white/4" />
            </div>
            <div className="h-6 w-16 rounded-full bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
