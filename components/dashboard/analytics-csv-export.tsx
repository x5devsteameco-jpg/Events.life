'use client';

interface Row {
  title: string;
  date: string;
  status: string;
  pageViews: number;
  rsvps: number;
  conversion: string;
}

export function AnalyticsCsvExport({ rows }: { rows: Row[] }) {
  const handleExport = () => {
    const headers = ['Event', 'Date', 'Status', 'Page Views', 'RSVPs', 'Conversion'];
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [r.title, r.date, r.status, r.pageViews, r.rsvps, r.conversion]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-[rgba(0,229,204,0.08)]"
      style={{ border: '1px solid rgba(0,229,204,0.18)', color: '#7aafc4' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
      </svg>
      Export CSV
    </button>
  );
}
