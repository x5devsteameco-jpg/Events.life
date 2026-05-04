'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import crypto from 'crypto';

interface Announcement {
  id: string;
  message: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
}

const TYPE_COLORS: Record<string, string> = {
  info: '#38bdf8',
  warning: '#f59e0b',
  success: '#00e5cc',
  error: '#ff3cac',
};

export default function AnnouncementsClient({ announcements: initial }: { announcements: Announcement[] }) {
  const [announcements, setAnnouncements] = useState(initial);
  const [newMsg, setNewMsg] = useState('');
  const [newType, setNewType] = useState('info');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate() {
    if (!newMsg.trim()) return;
    startTransition(async () => {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMsg, type: newType }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements((prev) => [data, ...prev]);
        setNewMsg('');
      }
      router.refresh();
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await fetch(`/api/admin/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, isActive: !isActive } : a));
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    });
  }

  return (
    <div className="space-y-5">
      {/* Create new */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.15)' }}>
        <h2 className="font-bold text-[#e8f4f8]">New Announcement</h2>
        <textarea
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Enter announcement message..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none"
          style={{ background: 'rgba(2,4,8,0.5)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }}
        />
        <div className="flex gap-3">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }}
          >
            {['info', 'success', 'warning', 'error'].map((t) => (
              <option key={t} value={t} style={{ background: '#0c1a1f' }}>{t.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={isPending || !newMsg.trim()}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', color: '#020408' }}
          >
            Publish
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div key={ann.id} className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'rgba(12,26,31,0.7)', border: `1px solid ${TYPE_COLORS[ann.type] ?? '#4d7a90'}22` }}>
            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: TYPE_COLORS[ann.type] ?? '#4d7a90' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#e8f4f8]">{ann.message}</p>
              <p className="text-xs mt-1" style={{ color: '#4d7a90' }}>
                {ann.type.toUpperCase()} · {new Date(ann.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleToggle(ann.id, ann.isActive)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: ann.isActive ? 'rgba(0,229,204,0.12)' : 'rgba(255,255,255,0.04)',
                  color: ann.isActive ? '#00e5cc' : '#4d7a90',
                  border: `1px solid ${ann.isActive ? 'rgba(0,229,204,0.2)' : 'transparent'}`,
                }}
              >
                {ann.isActive ? 'Active' : 'Paused'}
              </button>
              <button
                onClick={() => handleDelete(ann.id)}
                className="p-1.5 rounded-lg text-[#ff3cac] hover:bg-[rgba(255,60,172,0.08)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#4d7a90' }}>No announcements yet</p>
        )}
      </div>
    </div>
  );
}
