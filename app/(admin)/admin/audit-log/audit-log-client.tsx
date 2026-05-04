'use client';

import { useState, useTransition } from 'react';

type AuditEntry = {
  id: string;
  createdAt: string;
  action: string;
  targetType: string;
  summary: string;
  hasRollbackState: boolean;
};

export default function AuditLogClient({ initialEntries }: { initialEntries: AuditEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>('');

  function rollback(logId: string) {
    setMessage('');
    startTransition(async () => {
      const res = await fetch('/api/admin/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(json.error ?? 'Rollback failed');
        return;
      }
      setMessage('Rollback applied.');
      setEntries((current) => current.map((entry) => (entry.id === logId ? { ...entry, action: 'rolled_back' } : entry)));
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
      <div className="grid grid-cols-[140px_120px_140px_1fr_120px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#4d7a90', borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
        <span>Date</span><span>Action</span><span>Target</span><span>Summary</span><span>Rollback</span>
      </div>
      {entries.map((entry) => (
        <div key={entry.id} className="grid grid-cols-[140px_120px_140px_1fr_120px] gap-4 px-5 py-3 text-sm" style={{ borderBottom: '1px solid rgba(0,229,204,0.05)' }}>
          <span style={{ color: '#7aafc4' }}>{new Date(entry.createdAt).toLocaleDateString()}</span>
          <span style={{ color: '#00e5cc' }}>{entry.action}</span>
          <span className="truncate text-[#e8f4f8]">{entry.targetType}</span>
          <span style={{ color: '#b9d5df' }}>{entry.summary}</span>
          <div>
            <button
              type="button"
              disabled={isPending || !entry.hasRollbackState}
              onClick={() => rollback(entry.id)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              style={{
                background: entry.hasRollbackState ? 'rgba(255,60,172,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${entry.hasRollbackState ? 'rgba(255,60,172,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: entry.hasRollbackState ? '#ff3cac' : '#4d7a90',
              }}
            >
              Undo
            </button>
          </div>
        </div>
      ))}
      {entries.length === 0 && <p className="px-5 py-10 text-center text-sm" style={{ color: '#4d7a90' }}>No admin changes recorded yet.</p>}
      {message ? (
        <div className="border-t px-5 py-3 text-xs" style={{ borderColor: 'rgba(0,229,204,0.08)', color: '#7aafc4' }}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
