'use client';

export function DataExportSection() {
  return (
    <section>
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(0,229,204,0.03)', border: '1px solid rgba(0,229,204,0.1)' }}>
        <h2 className="text-sm font-bold text-[#00e5cc] mb-1 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Your Data (PIPEDA Data Portability)
        </h2>
        <p className="text-xs text-[#6b9bb0] mb-4 leading-relaxed">
          Under PIPEDA, you have the right to receive a copy of your personal data in a structured, machine-readable format.
          Your export will include account details, events you&apos;ve hosted, and your RSVP history.
        </p>
        <a
          href="/api/user/data-export"
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#00e5cc] border transition-all hover:bg-[rgba(0,229,204,0.06)]"
          style={{ borderColor: 'rgba(0,229,204,0.2)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Data Export (JSON)
        </a>
      </div>
    </section>
  );
}
