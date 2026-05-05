'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/toast';
import type { EventStatus } from '@/lib/types';

interface EventRow {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  date: string;
  location: string | null;
  isOnline: boolean;
  category: string | null;
  ageGate: number;
  _count: { rsvps: number };
  maxAttendees: number | null;
  visibility: string;
}

const STATUS_ORDER: EventStatus[] = ['LIVE', 'DRAFT', 'PRIVATE', 'ENDED', 'CANCELLED'];

function StatusMenu({ eventId, currentStatus, onUpdate }: { eventId: string; currentStatus: EventStatus; onUpdate: (id: string, status: EventStatus) => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const options: { status: EventStatus; label: string; color: string }[] = ([
    { status: 'LIVE', label: '◉ Publish Live', color: '#00e5cc' },
    { status: 'PRIVATE', label: '⊗ Set Private', color: '#9dd8ea' },
    { status: 'DRAFT', label: '◫ Move to Draft', color: '#4d7a90' },
    { status: 'ENDED', label: 'Mark Ended', color: '#4d7a90' },
    { status: 'CANCELLED', label: 'Cancel', color: '#ff3cac' },
  ] as { status: EventStatus; label: string; color: string }[]).filter((o) => o.status !== currentStatus);

  const change = async (status: EventStatus) => {
    setOpen(false);
    try {
      const res = await fetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        onUpdate(eventId, status);
        toast(`Event ${status === 'LIVE' ? 'published!' : status === 'DRAFT' ? 'moved to draft' : 'updated'}`, 'success');
      } else {
        toast('Failed to update status', 'error');
      }
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg text-[#4d7a90] hover:text-[#00e5cc] hover:bg-[rgba(0,229,204,0.08)] transition-all" title="Change status">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-xl overflow-hidden py-1"
              style={{ background: 'rgba(12,26,31,0.98)', border: '1px solid rgba(0,229,204,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              {options.map((o) => (
                <button key={o.status} onClick={() => change(o.status)} className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[rgba(0,229,204,0.06)] transition-colors" style={{ color: o.color }}>
                  {o.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventStatus | 'ALL'>('ALL');
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      const json = await res.json();
      if (res.ok) {
        const sorted = (json.data ?? []).sort((a: EventRow, b: EventRow) => {
          const ai = STATUS_ORDER.indexOf(a.status);
          const bi = STATUS_ORDER.indexOf(b.status);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        setEvents(sorted);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleStatusUpdate = useCallback((id: string, status: EventStatus) => {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
  }, []);

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/event/${slug}`;
    navigator.clipboard.writeText(url).then(() => toast('Link copied!', 'success')).catch(() => toast('Could not copy link', 'error'));
  };

  const filtered = filter === 'ALL' ? events : events.filter((e) => e.status === filter);

  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>My Events</h1>
          <p className="text-sm text-[#4d7a90] mt-1">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/events/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#020408] hover:-translate-y-0.5 transition-transform flex-shrink-0 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          New Event
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['ALL', 'LIVE', 'DRAFT', 'PRIVATE', 'ENDED', 'CANCELLED'] as const).map((s) => {
          const count = s === 'ALL' ? events.length : (counts[s] ?? 0);
          const isActive = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0"
              style={{
                background: isActive ? 'rgba(0,229,204,0.15)' : 'rgba(12,26,31,0.5)',
                border: isActive ? '1px solid rgba(0,229,204,0.3)' : '1px solid rgba(0,229,204,0.08)',
                color: isActive ? '#00e5cc' : '#4d7a90',
              }}
            >
              {s}
              {count > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: isActive ? 'rgba(0,229,204,0.2)' : 'rgba(0,229,204,0.08)' }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(12,26,31,0.5)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(12,26,31,0.3)', border: '1px dashed rgba(0,229,204,0.1)' }}>
          <div className="text-4xl mb-3" style={{ color: '#00e5cc' }}>◈</div>
          <h3 className="text-lg font-bold text-[#e8f4f8] mb-2" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
            {filter === 'ALL' ? 'No events yet' : `No ${filter.toLowerCase()} events`}
          </h3>
          <p className="text-sm text-[#4d7a90] mb-5">
            {filter === 'ALL' ? 'Create your first event to get started.' : `You don't have any ${filter.toLowerCase()} events.`}
          </p>
          {filter === 'ALL' && (
            <Link href="/events/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
              Create Your First Event
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ border: '1px solid rgba(0,229,204,0.08)' }}>
          <div className="min-w-[580px]">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_100px_90px_80px_120px] gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#2d5268]" style={{ background: 'rgba(6,13,16,0.8)' }}>
            <span>Event</span>
            <span>Date</span>
            <span>Status</span>
            <span>RSVPs</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ divideColor: 'rgba(0,229,204,0.05)' } as React.CSSProperties}>
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[1fr_100px_90px_80px_120px] gap-4 px-5 py-4 items-center hover:bg-[rgba(0,229,204,0.03)] transition-colors"
                style={{ borderTopColor: 'rgba(0,229,204,0.05)' }}
              >
                {/* Event name */}
                <div className="min-w-0">
                  <Link href={`/events/${event.id}`} className="font-semibold text-sm text-[#e8f4f8] hover:text-[#00e5cc] transition-colors line-clamp-1">
                    {event.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {event.category && <span className="text-[10px] text-[#2d5268]">{event.category}</span>}
                    {event.ageGate > 0 && <span className="text-[10px] text-[#ff3cac]">{event.ageGate}+</span>}
                    {event.visibility === 'PRIVATE' && <span className="text-[10px] text-[#4d7a90]">⊗ Private</span>}
                  </div>
                </div>

                {/* Date */}
                <div className="text-xs text-[#4d7a90]">{formatDateTime(new Date(event.date))}</div>

                {/* Status */}
                <div><Badge variant={statusToBadgeVariant(event.status)} size="sm">{event.status}</Badge></div>

                {/* RSVPs */}
                <div className="text-sm font-bold" style={{ color: '#00e5cc' }}>
                  {event._count.rsvps}
                  {event.maxAttendees && <span className="text-[10px] text-[#2d5268] font-normal">/{event.maxAttendees}</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/events/${event.id}/rsvps`} className="p-1.5 rounded-lg text-[#4d7a90] hover:text-[#00e5cc] hover:bg-[rgba(0,229,204,0.08)] transition-all" title="View RSVPs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </Link>
                  <button onClick={() => copyLink(event.slug)} className="p-1.5 rounded-lg text-[#4d7a90] hover:text-[#00e5cc] hover:bg-[rgba(0,229,204,0.08)] transition-all" title="Copy share link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </button>
                  <Link href={`/events/${event.id}/edit`} className="p-1.5 rounded-lg text-[#4d7a90] hover:text-[#7aafc4] hover:bg-[rgba(122,175,196,0.08)] transition-all" title="Edit event">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </Link>
                  <StatusMenu eventId={event.id} currentStatus={event.status} onUpdate={handleStatusUpdate} />
                </div>
              </motion.div>
            ))}
          </div>
            </div>
          </div>
      )}
    </div>
  );
}
