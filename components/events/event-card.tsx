'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDateTime } from '@/lib/utils';
import type { Event } from '@/lib/types';

interface EventCardProps {
  event: Event & { _count?: { rsvps: number } };
}

export function EventCard({ event }: EventCardProps) {
  const rsvpCount = event._count?.rsvps ?? 0;
  const capacity = event.maxAttendees;

  const defaultGradients: Record<string, string> = {
    'Networking':        'linear-gradient(135deg, #060d10 0%, #132530 100%)',
    'Product Demo':      'linear-gradient(135deg, #060d10 0%, #0c2020 100%)',
    'Private Gathering': 'linear-gradient(135deg, #060d10 0%, #150c25 100%)',
    'Industry Event':    'linear-gradient(135deg, #060d10 0%, #0c1a10 100%)',
    'Other':             'linear-gradient(135deg, #060d10 0%, #1a1020 100%)',
  };

  const bgGradient = defaultGradients[event.category ?? 'Other'] ?? defaultGradients['Other'];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl overflow-hidden flex flex-col group"
      style={{
        background: 'rgba(12,26,31,0.7)',
        border: '1px solid rgba(0,229,204,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,229,204,0.28)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,204,0.14), 0 0 40px rgba(0,229,204,0.06)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,229,204,0.1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.45)';
      }}
    >
      {/* Banner */}
      <div className="h-40 relative overflow-hidden flex-shrink-0">
        {event.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden" style={{ background: bgGradient }}>
            {/* Cinematic grid overlay */}
            <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
              <svg width="100%" height="100%"><defs><pattern id={`grid-${event.id}`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#00e5cc" strokeWidth="0.6"/></pattern></defs><rect width="100%" height="100%" fill={`url(#grid-${event.id})`}/></svg>
            </div>
            {/* Brand mark */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="52" height="52" viewBox="0 0 48 48" fill="none" opacity="0.12" aria-hidden="true">
                <path d="M24 6L38 13.5V28.5L24 36L10 28.5V13.5L24 6Z" stroke="#00e5cc" strokeWidth="2.2" strokeLinejoin="round"/>
                <path d="M24 14L30.5 17.8V25.2L24 29L17.5 25.2V17.8L24 14Z" fill="#00e5cc"/>
              </svg>
            </div>
            {/* Subtle radial glow */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(0,229,204,0.07) 0%, transparent 70%)' }} />
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge variant={statusToBadgeVariant(event.status)} size="sm">
            {event.status}
          </Badge>
        </div>

        {/* Age gate badge */}
        {event.ageGate > 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'rgba(255,60,172,0.15)', border: '1px solid rgba(255,60,172,0.3)', color: '#ff3cac' }}>
              {event.ageGate}+
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="font-bold text-[#e8f4f8] line-clamp-1 mb-1 text-sm"
          style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)", letterSpacing: '0.02em' }}
        >
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-[#4d7a90] mb-3">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span suppressHydrationWarning>{formatDateTime(event.date)}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-[#4d7a90] mb-3">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* RSVP progress */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#4d7a90]">{rsvpCount} {rsvpCount === 1 ? 'RSVP' : 'RSVPs'}</span>
            {capacity && (
              <span className="text-[#4d7a90]">
                {capacity - rsvpCount} spots left
              </span>
            )}
          </div>
          {capacity && (
            <Progress value={rsvpCount} max={capacity} size="sm" />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,229,204,0.06)' }}>
          <Link
            href={`/events/${event.id}`}
            className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold text-[#00e5cc] transition-all hover:bg-[rgba(0,229,204,0.08)]"
            style={{ border: '1px solid rgba(0,229,204,0.15)' }}
          >
            Manage
          </Link>
          <Link
            href={`/event/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold text-[#7aafc4] transition-all hover:bg-[rgba(122,175,196,0.06)]"
            style={{ border: '1px solid rgba(122,175,196,0.1)' }}
          >
            Preview
          </Link>
          <Link
            href={`/events/${event.id}/edit`}
            className="p-1.5 rounded-lg text-[#4d7a90] hover:text-[#e8f4f8] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            aria-label="Edit event"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
