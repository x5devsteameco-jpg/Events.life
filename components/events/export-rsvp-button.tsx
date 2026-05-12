'use client';

import { useState } from 'react';

interface ExportRSVPButtonProps {
  eventId: string;
  eventTitle: string;
}

export function ExportRSVPButton({ eventId, eventTitle }: ExportRSVPButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp/export`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventTitle.replace(/\s+/g, '-').toLowerCase()}-rsvps.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export RSVPs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
      style={{
        background: 'rgba(0,229,204,0.1)',
        color: '#00e5cc',
        border: '1px solid rgba(0,229,204,0.2)',
      }}
      title="Download RSVPs as CSV"
    >
      {isLoading ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
