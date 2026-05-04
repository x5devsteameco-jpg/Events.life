'use client';

import { useState, useTransition } from 'react';

interface SiteAsset {
  id: string;
  key: string;
  label: string;
  type: string;
  url: string;
  alt: string | null;
}

export default function AssetsClient({ initialAssets }: { initialAssets: SiteAsset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [isPending, startTransition] = useTransition();

  function updateAsset(id: string, patch: Partial<SiteAsset>) {
    setAssets((current) => current.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)));
  }

  function saveAsset(asset: SiteAsset) {
    startTransition(async () => {
      await fetch('/api/admin/site-assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });
    });
  }

  return (
    <div className="space-y-4">
      {assets.map((asset) => (
        <div key={asset.id} className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(0,229,204,0.12)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt={asset.alt ?? asset.label} className="h-40 w-full object-cover" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-[#e8f4f8]">{asset.label}</p>
                <p className="text-xs font-mono mt-1" style={{ color: '#4d7a90' }}>{asset.key}</p>
              </div>
              <input value={asset.url} onChange={(e) => updateAsset(asset.id, { url: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
              <input value={asset.alt ?? ''} onChange={(e) => updateAsset(asset.id, { alt: e.target.value })} placeholder="Alt text" className="w-full rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
              <div className="flex justify-end">
                <button type="button" disabled={isPending} onClick={() => saveAsset(asset)} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: 'rgba(0,229,204,0.1)', border: '1px solid rgba(0,229,204,0.25)', color: '#00e5cc' }}>Save Asset</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
