export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-label="Loading dashboard…">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl h-28" style={{ background: 'rgba(0,229,204,0.04)', border: '1px solid rgba(0,229,204,0.06)' }} />
        ))}
      </div>
      {/* Event card skeletons */}
      <div className="rounded-2xl h-8 w-48" style={{ background: 'rgba(0,229,204,0.04)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl h-52" style={{ background: 'rgba(0,229,204,0.04)', border: '1px solid rgba(0,229,204,0.06)' }} />
        ))}
      </div>
    </div>
  );
}
