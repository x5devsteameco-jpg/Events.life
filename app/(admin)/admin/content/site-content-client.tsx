'use client';

import { useState, useTransition } from 'react';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
  updatedAt: Date;
}

const KEY_LABELS: Record<string, string> = {
  hero_headline: 'Hero Headline',
  hero_subheading: 'Hero Subheading',
  hero_cta_primary: 'Hero CTA (Primary Button)',
  hero_cta_secondary: 'Hero CTA (Secondary Button)',
  footer_tagline: 'Footer Tagline',
};

export default function SiteContentClient({ contents }: { contents: SiteContent[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(contents.map((c) => [c.key, c.value]))
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSave(key: string) {
    startTransition(async () => {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key] }),
      });
      if (res.ok) {
        setSaved((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
      } else {
        setErrors((prev) => ({ ...prev, [key]: 'Save failed' }));
      }
    });
  }

  return (
    <div className="space-y-4">
      {contents.map((content) => (
        <div key={content.id} className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-[#e8f4f8]">{KEY_LABELS[content.key] ?? content.key}</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#4d7a90' }}>{content.key}</p>
            </div>
            <p className="text-xs" style={{ color: '#4d7a90' }}>
              Updated {new Date(content.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {content.type === 'textarea' ? (
            <textarea
              value={values[content.key] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [content.key]: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }}
            />
          ) : (
            <input
              type="text"
              value={values[content.key] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [content.key]: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }}
            />
          )}

          {errors[content.key] && <p className="text-xs mt-1" style={{ color: '#ff3cac' }}>{errors[content.key]}</p>}

          <div className="flex justify-end mt-3">
            <button
              onClick={() => handleSave(content.key)}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: saved[content.key] ? 'rgba(0,229,204,0.2)' : 'rgba(0,229,204,0.1)',
                border: '1px solid rgba(0,229,204,0.25)',
                color: saved[content.key] ? '#00e5cc' : '#7aafc4',
              }}
            >
              {saved[content.key] ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      ))}

      <div className="p-4 rounded-xl" style={{ background: 'rgba(255,60,172,0.04)', border: '1px solid rgba(255,60,172,0.1)' }}>
        <p className="text-xs" style={{ color: '#ff3cac' }}>
          ⚠ Note: This editor modifies site labels and marketing copy only. It does NOT access, view, or modify any account holder personal information (names, emails, passwords).
        </p>
      </div>
    </div>
  );
}
