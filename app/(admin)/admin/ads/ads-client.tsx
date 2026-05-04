'use client';

import { useState, useTransition } from 'react';

interface AdSlot {
  id: string;
  key: string;
  label: string;
  headline: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  active: boolean;
  priority: number;
}

export default function AdsClient({ initialSlots }: { initialSlots: AdSlot[] }) {
  const [slots, setSlots] = useState(initialSlots);
  const [isPending, startTransition] = useTransition();

  function updateSlot(id: string, patch: Partial<AdSlot>) {
    setSlots((current) => current.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));
  }

  function saveSlot(slot: AdSlot) {
    startTransition(async () => {
      await fetch('/api/admin/ad-slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot),
      });
    });
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <div key={slot.id} className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#e8f4f8]">{slot.label}</p>
              <p className="text-xs font-mono mt-1" style={{ color: '#4d7a90' }}>{slot.key}</p>
            </div>
            <button type="button" onClick={() => updateSlot(slot.id, { active: !slot.active })} className="rounded-xl px-3 py-1.5 text-xs font-semibold" style={{ background: slot.active ? 'rgba(0,229,204,0.1)' : 'rgba(255,255,255,0.05)', color: slot.active ? '#00e5cc' : '#7aafc4' }}>{slot.active ? 'Active' : 'Inactive'}</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={slot.headline ?? ''} onChange={(e) => updateSlot(slot.id, { headline: e.target.value })} placeholder="Headline" className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
            <input value={slot.imageUrl ?? ''} onChange={(e) => updateSlot(slot.id, { imageUrl: e.target.value })} placeholder="Image URL" className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
            <input value={slot.ctaLabel ?? ''} onChange={(e) => updateSlot(slot.id, { ctaLabel: e.target.value })} placeholder="CTA label" className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
            <input value={slot.ctaHref ?? ''} onChange={(e) => updateSlot(slot.id, { ctaHref: e.target.value })} placeholder="CTA href" className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
            <textarea value={slot.body ?? ''} onChange={(e) => updateSlot(slot.id, { body: e.target.value })} rows={3} placeholder="Body copy" className="md:col-span-2 rounded-xl px-4 py-3 text-sm resize-none" style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
          </div>
          <div className="mt-3 flex justify-end">
            <button type="button" disabled={isPending} onClick={() => saveSlot(slot)} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: 'rgba(0,229,204,0.1)', border: '1px solid rgba(0,229,204,0.25)', color: '#00e5cc' }}>Save Slot</button>
          </div>
        </div>
      ))}
    </div>
  );
}
