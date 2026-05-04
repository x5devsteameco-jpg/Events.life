'use client';

interface RSVPRow {
  guestName: string;
  guestEmail: string;
  storeName: string | null;
  storeAddress: string | null;
  brand: string | null;
  position: string | null;
  status: string;
  certificationUrl: string | null;
  answers: string | null;
  createdAt: Date;
}

interface Props {
  rsvps: RSVPRow[];
  eventTitle: string;
}

export function RSVPExportButton({ rsvps, eventTitle }: Props) {
  function handleExport() {
    const headers = ['Name', 'Email', 'Store', 'Store Address', 'Brand', 'Position', 'Status', 'Certification', 'Registered'];
    const rows = rsvps.map((r) => [
      r.guestName,
      r.guestEmail,
      r.storeName ?? '',
      r.storeAddress ?? '',
      r.brand ?? '',
      r.position ?? '',
      r.status,
      r.certificationUrl ?? '',
      new Date(r.createdAt).toLocaleDateString('en-CA'),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/\s+/g, '_')}_rsvps.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
      style={{
        background: 'rgba(0,229,204,0.08)',
        border: '1px solid rgba(0,229,204,0.2)',
        color: '#00e5cc',
      }}
    >
      ↓ Export CSV
    </button>
  );
}
