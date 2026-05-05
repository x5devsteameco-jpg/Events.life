'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import type { EventStatus } from '@/lib/types';

interface EventItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  date: Date;
  location: string | null;
  isOnline: boolean;
  bannerImage: string | null;
  category: string | null;
  ageGate: number;
  maxAttendees: number | null;
  eventTheme: string | null;
  dressCode: string | null;
  host: { name: string | null; company: string | null };
  _count: { rsvps: number };
}

interface Props {
  events: EventItem[];
}

import { type Variants } from 'framer-motion';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 260 } },
};

export function EventsGrid({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-24 rounded-2xl" style={{ background: 'rgba(12,26,31,0.3)', border: '1px dashed rgba(0,229,204,0.1)' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,229,204,0.06)', border: '1px solid rgba(0,229,204,0.12)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h2 className="text-xl font-bold text-[#e8f4f8] mb-2" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>No events found</h2>
        <p className="text-sm text-[#4d7a90] mb-6">Try adjusting your search or check back later.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
          Host Your Own Event
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {events.map((event) => {
        const confirmedCount = event._count?.rsvps ?? 0;
        const isFull = event.maxAttendees ? confirmedCount >= event.maxAttendees : false;

        return (
          <motion.div key={event.id} variants={item}>
            <Link
              href={`/event/${event.slug}`}
              className="group rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,229,204,0.12)]"
              style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}
            >
              {/* Banner */}
              <div className="h-44 relative overflow-hidden flex-shrink-0">
                {event.bannerImage ? (
                  <Image
                    src={event.bannerImage}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,229,204,0.1), rgba(0,180,150,0.06))' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="1.2" opacity="0.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={statusToBadgeVariant(event.status as EventStatus)} size="sm">{event.status}</Badge>
                  {event.ageGate > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'rgba(255,60,172,0.15)', border: '1px solid rgba(255,60,172,0.3)', color: '#ff3cac' }}>
                      {event.ageGate}+
                    </span>
                  )}
                </div>
                {isFull && (
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(255,60,172,0.8)', color: 'white' }}>
                    SOLD OUT
                  </div>
                )}
                {!isFull && event.maxAttendees && event.maxAttendees - confirmedCount <= 10 && event.maxAttendees - confirmedCount > 0 && (
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.85)', color: '#020408' }}>
                    {event.maxAttendees - confirmedCount} spot{event.maxAttendees - confirmedCount === 1 ? '' : 's'} left
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                {event.category && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00e5cc] mb-1">{event.category}</span>
                )}
                <h3 className="font-bold text-[#e8f4f8] line-clamp-2 mb-2 leading-snug" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
                  {event.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#4d7a90] mb-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {formatDate(event.date)}
                </div>

                {(event.location || event.isOnline) && (
                  <div className="flex items-center gap-1.5 text-xs text-[#4d7a90] mb-3">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {event.isOnline ? 'Online Event' : event.location}
                  </div>
                )}

                {(event.eventTheme || event.dressCode) && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {event.eventTheme && (
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.12)', color: '#00e5cc' }}>
                        {event.eventTheme}
                      </span>
                    )}
                    {event.dressCode && (
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9bc6d8' }}>
                        {event.dressCode}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(0,229,204,0.06)' }}>
                  <div className="text-xs text-[#4d7a90] min-w-0 truncate mr-2">
                    By <span className="text-[#7aafc4]">{event.host.name ?? event.host.company ?? 'Anonymous'}</span>
                  </div>
                  <div className="text-xs text-[#4d7a90] flex-shrink-0 whitespace-nowrap">
                    {confirmedCount > 0 ? (
                      <span className="text-[#00e5cc] font-semibold">{confirmedCount} {confirmedCount === 1 ? 'person' : 'people'} going</span>
                    ) : (
                      <span>Be first to RSVP</span>
                    )}
                  </div>
                </div>
                {event.maxAttendees && event.maxAttendees > 0 && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,229,204,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((confirmedCount / event.maxAttendees) * 100, 100)}%`,
                          background: isFull ? '#ff3cac' : confirmedCount / event.maxAttendees > 0.7 ? '#f59e0b' : '#00e5cc',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
