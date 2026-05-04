function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.08)' }}>
      <div className="skeleton h-48 w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-6 w-4/5 rounded-xl" />
        <div className="skeleton h-4 w-full rounded-xl" />
        <div className="skeleton h-4 w-2/3 rounded-xl" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-8 w-24 rounded-full" />
          <div className="skeleton h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function EventsLoading() {
  return (
    <div className="min-h-screen px-4 pb-28 pt-24" style={{ background: '#020408' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="skeleton mx-auto mb-4 h-8 w-48 rounded-full" />
          <div className="skeleton mx-auto mb-3 h-14 w-[min(32rem,90%)] rounded-[20px]" />
          <div className="skeleton mx-auto h-5 w-[min(24rem,70%)] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <EventCardSkeleton key={index} />)}
        </div>
      </div>
    </div>
  );
}
