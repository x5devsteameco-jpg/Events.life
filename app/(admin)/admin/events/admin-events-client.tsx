'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  category: string | null;
  date: Date;
  createdAt: Date;
  host: { id: string; name: string | null; email: string };
  _count: { rsvps: number };
}

const STATUS_COLORS: Record<string, string> = {
  LIVE: '#00e5cc', DRAFT: '#4d7a90', ENDED: '#6b7280', CANCELLED: '#ff3cac', PRIVATE: '#9c6bff'
};

async function setEventStatus(eventId: string, status: string) {
  const res = await fetch(`/api/admin/events/${eventId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.ok;
}

export default function AdminEventsClient({ events }: { events: Event[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.host.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.host.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleStatusChange(eventId: string, newStatus: string) {
    startTransition(async () => {
      await setEventStatus(eventId, newStatus);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search events or hosts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.15)', color: '#e8f4f8' }}
        >
          {['ALL', 'LIVE', 'DRAFT', 'PRIVATE', 'ENDED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
                {['Event', 'Host', 'Status', 'RSVPs', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#4d7a90' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(0,229,204,0.05)' }}>
              {filtered.map((event) => (
                <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="max-w-[200px]">
                      <p className="font-medium text-[#e8f4f8] truncate">{event.title}</p>
                      <p className="text-xs" style={{ color: '#4d7a90' }}>{event.category ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#7aafc4]">{event.host.name ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={event.status}
                      onChange={(e) => handleStatusChange(event.id, e.target.value)}
                      disabled={isPending}
                      className="px-2 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: `${STATUS_COLORS[event.status] ?? '#4d7a90'}18`,
                        color: STATUS_COLORS[event.status] ?? '#4d7a90',
                        border: `1px solid ${STATUS_COLORS[event.status] ?? '#4d7a90'}33`,
                        cursor: 'pointer',
                      }}
                    >
                      {['LIVE', 'DRAFT', 'PRIVATE', 'ENDED', 'CANCELLED'].map((s) => (
                        <option key={s} value={s} style={{ background: '#0c1a1f', color: '#e8f4f8' }}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#7aafc4]">{event._count.rsvps}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#4d7a90' }}>
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/event/${event.slug}`}
                        target="_blank"
                        className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: '#00e5cc' }}
                      >
                        View ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: '#4d7a90' }}>
            No events found
          </div>
        )}
      </div>
    </div>
  );
}
