import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import { AttendeeTable } from '@/components/events/attendee-table';
import type { EventStatus } from '@/lib/types';
import { DuplicateEventButton } from '@/components/events/duplicate-event-button';
import { PromoteWaitlistButton } from '@/components/events/promote-waitlist-button';
import { AnnouncePanel } from '@/components/events/announce-panel';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> };

export default async function EventManagePage({ params, searchParams }: Props) {
  const [{ id }, { tab = 'overview' }, session] = await Promise.all([params, searchParams, auth()]);

  if (!session?.user?.id) redirect('/login');

  const event = await db.event.findUnique({
    where: { id },
    include: {
      rsvps: { orderBy: { createdAt: 'asc' } },
      _count: { select: { rsvps: true } },
    },
  });

  if (!event) notFound();
  if (event.hostId !== session.user.id) notFound();

  const confirmed = event.rsvps.filter((r) => r.status === 'CONFIRMED').length;
  const waitlisted = event.rsvps.filter((r) => r.status === 'WAITLISTED').length;
  const capacityPct = event.maxAttendees ? Math.round((confirmed / event.maxAttendees) * 100) : null;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'attendees', label: `Attendees (${confirmed})` },
    { key: 'waitlist', label: `Waitlist (${waitlisted})` },
    { key: 'message', label: 'Message Attendees' },
    { key: 'share', label: 'Share & Invite' },
  ];

  const publicUrl = `${process.env.NEXTAUTH_URL}/event/${event.slug}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Badge variant={statusToBadgeVariant(event.status as EventStatus)}>{event.status}</Badge>
            {event.category && <span className="text-xs text-[#4d7a90]">{event.category}</span>}
          </div>
          <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>{event.title}</h1>
          <p className="text-sm text-[#4d7a90] mt-1">{formatDate(event.date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/event/${event.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl border text-sm font-medium text-[#00e5cc] transition-all hover:bg-[rgba(0,229,204,0.06)]"
            style={{ borderColor: 'rgba(0,229,204,0.2)' }}
          >
            View Public Page ↗
          </Link>
          <Link
            href={`/dashboard/events/${id}/analytics`}
            className="px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-white/5"
            style={{ borderColor: 'rgba(156,107,255,0.25)', color: '#9c6bff' }}
          >
            ◐ Analytics
          </Link>
          <DuplicateEventButton eventId={id} />
          <Link
            href={`/events/${id}/edit`}
            className="px-4 py-2 rounded-xl text-sm font-bold text-[#020408] transition-all"
            style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
          >
            Edit Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Confirmed', value: confirmed, color: '#00e5cc' },
          { label: 'Waitlisted', value: waitlisted, color: waitlisted > 0 ? '#ff3cac' : '#4d7a90' },
          { label: 'Capacity', value: event.maxAttendees ? `${confirmed}/${event.maxAttendees}` : '∞', color: '#00e5cc' },
          { label: 'Total RSVPs', value: event._count.rsvps, color: '#e8f4f8' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
            <p className="text-xs text-[#4d7a90] mb-1">{label}</p>
            <p className="text-2xl font-black" style={{ color, fontFamily: 'var(--font-display)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'rgba(0,229,204,0.1)' }}>
        {tabs.map(({ key, label }) => (
          <Link
            key={key}
            href={`/events/${id}?tab=${key}`}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${tab === key ? 'border-[#00e5cc] text-[#00e5cc]' : 'border-transparent text-[#4d7a90] hover:text-[#e8f4f8]'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Date & Time', value: formatDate(event.date) },
            { label: 'Event Type', value: event.isOnline ? 'Online' : 'In-Person' },
            { label: 'Location', value: event.location ?? (event.isOnline ? 'Online' : '—') },
            ...(event.address ? [{ label: 'Address', value: event.address }] : []),
            { label: 'Age Gate', value: event.ageGate > 0 ? `${event.ageGate}+` : 'None' },
            { label: 'Theme', value: event.eventTheme ?? 'host preset' },
            { label: 'Dress Code', value: event.dressCode ?? '—' },
            { label: 'Per Person Cap', value: event.maxTicketsPerPerson ?? '—' },
            { label: 'Certification', value: event.requiresCertification ? (event.certificationNote ?? 'Required') : 'Not required' },
            { label: 'Visibility', value: event.visibility ?? 'Public' },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.06)' }}>
              <p className="text-xs text-[#4d7a90] mb-1">{label}</p>
              <p className="text-sm text-[#e8f4f8]">{value}</p>
            </div>
          ))}
          {event.description && (
            <div className="sm:col-span-2 p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.06)' }}>
              <p className="text-xs text-[#4d7a90] mb-1">Description</p>
              <p className="text-sm text-[#6b9bb0] whitespace-pre-line">{event.description}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'attendees' && (
        <AttendeeTable
          rsvps={event.rsvps.filter((r) => r.status === 'CONFIRMED') as import('@/lib/types').RSVP[]}
          eventTitle={event.title}
          eventId={id}
        />
      )}

      {tab === 'waitlist' && (
        <div className="space-y-4">
          {waitlisted > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#4d7a90]">{waitlisted} attendee{waitlisted !== 1 ? 's' : ''} on waitlist</p>
              <PromoteWaitlistButton
                eventId={id}
                waitlistedIds={event.rsvps.filter((r) => r.status === 'WAITLISTED').map((r) => r.id)}
              />
            </div>
          )}
          <AttendeeTable
            rsvps={event.rsvps.filter((r) => r.status === 'WAITLISTED') as import('@/lib/types').RSVP[]}
            eventTitle={event.title}
            eventId={id}
          />
        </div>
      )}

      {tab === 'message' && (
        <AnnouncePanel eventId={id} confirmedCount={confirmed} />
      )}

      {tab === 'share' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.1)' }}>
            <p className="text-xs text-[#4d7a90] mb-2 font-medium uppercase tracking-wider">Public Event URL</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm text-[#00e5cc] bg-[rgba(0,229,204,0.06)] px-3 py-2 rounded-lg truncate font-mono">
                {publicUrl}
              </code>
              <CopyButton text={publicUrl} />
            </div>
          </div>
          <InvitePanel eventId={id} />
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  'use client';
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="px-3 py-2 text-xs font-semibold text-[#00e5cc] border rounded-lg transition-all hover:bg-[rgba(0,229,204,0.08)]"
      style={{ borderColor: 'rgba(0,229,204,0.2)' }}
    >
      Copy
    </button>
  );
}

function InvitePanel({ eventId }: { eventId: string }) {
  'use client';
  return (
    <div className="p-5 rounded-xl" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.1)' }}>
      <p className="text-sm font-semibold text-[#e8f4f8] mb-1">Send Email Invites</p>
      <p className="text-xs text-[#4d7a90] mb-4">Enter email addresses to send personal invitations.</p>
      <form action={`/api/events/${eventId}/invite`} method="POST" className="space-y-3">
        <textarea
          name="emails"
          rows={4}
          placeholder="one@example.com&#10;two@example.com"
          className="input-base w-full resize-none"
        />
        <button type="submit" className="px-5 py-2 rounded-xl text-sm font-bold text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
          Send Invites
        </button>
      </form>
    </div>
  );
}
