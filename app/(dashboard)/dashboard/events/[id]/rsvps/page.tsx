import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Props = { params: Promise<{ id: string }> };

const rsvpStatusColor: Record<string, string> = {
  CONFIRMED: '#00e5cc',
  WAITLISTED: '#7fff00',
  PENDING: '#4d7a90',
  CANCELLED: '#ff3cac',
};

export default async function EventRSVPsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    include: {
      rsvps: {
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { rsvps: true } },
    },
  });

  if (!event) notFound();
  if (event.hostId !== session.user.id) notFound();

  const confirmed = event.rsvps.filter((r) => r.status === 'CONFIRMED').length;
  const waitlisted = event.rsvps.filter((r) => r.status === 'WAITLISTED').length;
  const cancelled = event.rsvps.filter((r) => r.status === 'CANCELLED').length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/events" className="text-xs text-[#4d7a90] hover:text-[#00e5cc] transition-colors">← My Events</Link>
          </div>
          <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
            RSVPs: {event.title}
          </h1>
          <p className="text-sm text-[#4d7a90] mt-1">{formatDateTime(event.date)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/event/${event.slug}`} target="_blank" className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4d7a90] hover:text-[#00e5cc] transition-colors" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.1)' }}>
            View Event Page ↗
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total RSVPs', value: event._count.rsvps, color: '#00e5cc' },
          { label: 'Confirmed', value: confirmed, color: '#00e5cc' },
          { label: 'Waitlisted', value: waitlisted, color: '#7fff00' },
          { label: 'Cancelled', value: cancelled, color: '#ff3cac' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
            <div className="text-2xl font-black mb-1" style={{ color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
            <div className="text-xs text-[#4d7a90]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      {event.maxAttendees && (
        <div className="mb-8 p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.08)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#4d7a90]">Capacity</span>
            <span className="text-xs font-semibold text-[#00e5cc]">{confirmed} / {event.maxAttendees}</span>
          </div>
          <div className="h-2 rounded-full bg-[rgba(0,229,204,0.08)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (confirmed / event.maxAttendees) * 100)}%`,
                background: confirmed >= event.maxAttendees ? '#ff3cac' : 'linear-gradient(90deg, #00e5cc, #7fff00)',
              }}
            />
          </div>
        </div>
      )}

      {/* RSVPs table */}
      {event.rsvps.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(12,26,31,0.3)', border: '1px dashed rgba(0,229,204,0.1)' }}>
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-lg font-bold text-[#e8f4f8] mb-2" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>No RSVPs yet</h3>
          <p className="text-sm text-[#4d7a90]">Share your event link to start collecting RSVPs.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,229,204,0.08)' }}>
          <div className="grid grid-cols-[1fr_160px_100px_100px_80px] gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#2d5268]" style={{ background: 'rgba(6,13,16,0.8)' }}>
            <span>Attendee</span>
            <span>Contact</span>
            <span>Company</span>
            <span>Registered</span>
            <span>Status</span>
          </div>

          <div className="divide-y" style={{ divideColor: 'rgba(0,229,204,0.05)' } as React.CSSProperties}>
            {event.rsvps.map((rsvp) => {
              const answers = (() => {
                try { return rsvp.answers ? JSON.parse(rsvp.answers as string) : {}; }
                catch { return {}; }
              })();

              return (
                <div key={rsvp.id} className="grid grid-cols-[1fr_160px_100px_100px_80px] gap-4 px-5 py-4 items-center hover:bg-[rgba(0,229,204,0.02)] transition-colors" style={{ borderTopColor: 'rgba(0,229,204,0.05)' }}>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#e8f4f8] truncate">{rsvp.guestName}</p>
                    {rsvp.position && <p className="text-xs text-[#4d7a90] truncate">{rsvp.position}</p>}
                    {rsvp.certificationUrl && (
                      <a href={rsvp.certificationUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#7fff00] hover:underline">
                        📎 Certification
                      </a>
                    )}
                    {Object.keys(answers).length > 0 && (
                      <details className="mt-1">
                        <summary className="text-[10px] text-[#4d7a90] cursor-pointer hover:text-[#00e5cc]">Custom answers</summary>
                        <div className="mt-1 space-y-0.5">
                          {Object.entries(answers).map(([k, v]) => (
                            <p key={k} className="text-[10px] text-[#2d5268]"><span className="text-[#4d7a90]">{k}:</span> {String(v)}</p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#4d7a90] truncate">{rsvp.guestEmail}</p>
                    {rsvp.storeName && <p className="text-[10px] text-[#2d5268] truncate">{rsvp.storeName}</p>}
                  </div>
                  <div className="text-xs text-[#4d7a90] truncate">{rsvp.brand ?? rsvp.storeName ?? '—'}</div>
                  <div className="text-xs text-[#4d7a90]">{new Date(rsvp.createdAt).toLocaleDateString('en-CA')}</div>
                  <div>
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: `${rsvpStatusColor[rsvp.status]}18`, color: rsvpStatusColor[rsvp.status], border: `1px solid ${rsvpStatusColor[rsvp.status]}30` }}>
                      {rsvp.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
