export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#020408' }}
      aria-label="Loading…"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing ring */}
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(0,229,204,0.2)', animationDuration: '1.4s' }}
          />
          <div
            className="absolute inset-2 rounded-full animate-pulse"
            style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
          />
        </div>
        <p className="text-[#4d7a90] text-sm">Loading…</p>
      </div>
    </div>
  );
}
