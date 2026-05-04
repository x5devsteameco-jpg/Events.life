'use client';

import { useState, useTransition } from 'react';

interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  scope: string;
}

export default function FlagsClient({ initialFlags }: { initialFlags: FeatureFlag[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [isPending, startTransition] = useTransition();

  function updateFlag(id: string, patch: Partial<FeatureFlag>) {
    setFlags((current) => current.map((flag) => (flag.id === id ? { ...flag, ...patch } : flag)));
  }

  function saveFlag(flag: FeatureFlag) {
    startTransition(async () => {
      await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flag),
      });
    });
  }

  return (
    <div className="space-y-4">
      {flags.map((flag) => (
        <div key={flag.id} className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="font-semibold text-[#e8f4f8]">{flag.label}</p>
              <p className="text-xs font-mono mt-1" style={{ color: '#4d7a90' }}>{flag.key} · {flag.scope}</p>
            </div>
            <button
              type="button"
              onClick={() => updateFlag(flag.id, { enabled: !flag.enabled })}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: flag.enabled ? '#00e5cc' : 'rgba(255,255,255,0.12)' }}
            >
              <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all" style={{ left: flag.enabled ? '26px' : '4px' }} />
            </button>
          </div>
          <textarea
            value={flag.description ?? ''}
            onChange={(e) => updateFlag(flag.id, { description: e.target.value })}
            rows={2}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none"
            style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={isPending}
              onClick={() => saveFlag(flag)}
              className="rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: 'rgba(0,229,204,0.1)', border: '1px solid rgba(0,229,204,0.25)', color: '#00e5cc' }}
            >
              Save Flag
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
