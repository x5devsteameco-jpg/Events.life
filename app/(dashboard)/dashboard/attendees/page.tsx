import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AttendeeTable } from '@/components/events/attendee-table';

async function getAttendeeData(userId: string) {
  const [rsvps, eventCount] = await Promise.all([
    db.rSVP.findMany({
      where: { event: { hostId: userId } },
      orderBy: { createdAt: 'desc' },
    }),
    db.event.count({ where: { hostId: userId } }),
  ]);

  const stats = {
    total: rsvps.length,
    confirmed: rsvps.filter((r) => r.status === 'CONFIRMED').length,
    waitlisted: rsvps.filter((r) => r.status === 'WAITLISTED').length,
    cancelled: rsvps.filter((r) => r.status === 'CANCELLED').length,
    events: eventCount,
  };

  return { rsvps, stats };
}

export default async function AttendeesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { rsvps, stats } = await getAttendeeData(session.user.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
          Attendees
        </h1>
        <p className="text-sm text-[#4d7a90] mt-1">
          Manage attendees across all your events.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total RSVPs', value: stats.total, color: '#00e5cc' },
          { label: 'Confirmed', value: stats.confirmed, color: '#7fff00' },
          { label: 'Waitlisted', value: stats.waitlisted, color: '#ffb347' },
          { label: 'Cancelled', value: stats.cancelled, color: '#ff3cac' },
          { label: 'Events', value: stats.events, color: '#9dd8ea' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-4"
            style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}
          >
            <p className="text-xs text-[#4d7a90] mb-1">{item.label}</p>
            <p className="text-2xl font-black" style={{ color: item.color, fontFamily: 'var(--font-display)' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <AttendeeTable rsvps={rsvps as import('@/lib/types').RSVP[]} eventTitle="all-events" />
    </div>
  );
}
