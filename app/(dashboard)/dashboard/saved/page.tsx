import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { EventsGrid } from '@/components/events/events-grid';
import { PageTransition } from '@/components/ui/page-transition';

export const metadata = {
  title: 'Saved Events',
};

export default async function SavedEventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const saved = await db.savedEvent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      event: {
        select: {
          id: true, slug: true, title: true, status: true, date: true,
          location: true, isOnline: true, bannerImage: true, category: true,
          ageGate: true, maxAttendees: true, eventTheme: true, dressCode: true,
          host: { select: { name: true, company: true } },
          _count: { select: { rsvps: true } },
        },
      },
    },
  });

  const events = saved.map((s) => s.event);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
              Saved Events
            </h1>
            <p className="text-sm text-[#4d7a90] mt-1">
              {events.length === 0 ? 'Events you save will appear here.' : `${events.length} saved event${events.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm text-[#00e5cc] hover:text-[#00c4ae] transition-colors"
          >
            Browse Events →
          </Link>
        </div>

        {events.length === 0 ? (
          <div
            className="rounded-2xl py-20 text-center"
            style={{ background: 'rgba(12,26,31,0.4)', border: '1px dashed rgba(0,229,204,0.1)' }}
          >
            <div className="mb-4" style={{ color: '#00e5cc' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div>
            <h2 className="text-lg font-bold text-[#e8f4f8] mb-2">No saved events yet</h2>
            <p className="text-sm text-[#4d7a90] mb-6">
              Tap the bookmark icon on any event to save it for later.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#020408]"
              style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <EventsGrid events={events} />
        )}
      </div>
    </PageTransition>
  );
}
