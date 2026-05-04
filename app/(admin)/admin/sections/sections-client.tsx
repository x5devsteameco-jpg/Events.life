'use client';

import { useMemo, useState, useTransition } from 'react';

interface ManagedPageSection {
  id: string;
  pageKey: string;
  sectionKey: string;
  label: string;
  variant: string;
  enabled: boolean;
  sortOrder: number;
  config: string | null;
}

export default function SectionsClient({ initialSections }: { initialSections: ManagedPageSection[] }) {
  const [sections, setSections] = useState(initialSections);
  const [isPending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    return sections.reduce<Record<string, ManagedPageSection[]>>((acc, section) => {
      acc[section.pageKey] ??= [];
      acc[section.pageKey].push(section);
      acc[section.pageKey].sort((a, b) => a.sortOrder - b.sortOrder);
      return acc;
    }, {});
  }, [sections]);

  function updateSection(id: string, patch: Partial<ManagedPageSection>) {
    setSections((current) => current.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  }

  function saveSection(section: ManagedPageSection) {
    startTransition(async () => {
      await fetch('/api/admin/page-sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      });
    });
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([pageKey, pageSections]) => (
        <div key={pageKey} className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
          <h2 className="mb-4 text-lg font-bold text-[#e8f4f8]">/{pageKey}</h2>
          <div className="space-y-3">
            {pageSections.map((section) => (
              <div key={section.id} className="rounded-xl p-4" style={{ background: 'rgba(2,4,8,0.45)', border: '1px solid rgba(0,229,204,0.08)' }}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#e8f4f8]">{section.label}</p>
                    <p className="text-xs font-mono mt-1" style={{ color: '#4d7a90' }}>{section.sectionKey}</p>
                  </div>
                  <button type="button" onClick={() => updateSection(section.id, { enabled: !section.enabled })} className="rounded-xl px-3 py-1.5 text-xs font-semibold" style={{ background: section.enabled ? 'rgba(0,229,204,0.1)' : 'rgba(255,255,255,0.05)', color: section.enabled ? '#00e5cc' : '#7aafc4' }}>{section.enabled ? 'Enabled' : 'Disabled'}</button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <input value={section.label} onChange={(e) => updateSection(section.id, { label: e.target.value })} className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(6,13,16,0.7)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
                  <input value={section.variant} onChange={(e) => updateSection(section.id, { variant: e.target.value })} className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(6,13,16,0.7)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
                  <input type="number" value={section.sortOrder} onChange={(e) => updateSection(section.id, { sortOrder: Number(e.target.value) })} className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(6,13,16,0.7)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
                </div>
                <textarea value={section.config ?? ''} onChange={(e) => updateSection(section.id, { config: e.target.value })} rows={3} className="mt-3 w-full rounded-xl px-4 py-3 text-sm resize-none" style={{ background: 'rgba(6,13,16,0.7)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }} />
                <div className="mt-3 flex justify-end">
                  <button type="button" disabled={isPending} onClick={() => saveSection(section)} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: 'rgba(0,229,204,0.1)', border: '1px solid rgba(0,229,204,0.25)', color: '#00e5cc' }}>Save Section</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
