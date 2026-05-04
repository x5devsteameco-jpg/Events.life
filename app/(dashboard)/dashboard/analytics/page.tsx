import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageTransition } from '@/components/ui/page-transition';

async function getPortfolioAnalytics(userId: string) {
  const events = await db.event.findMany({
    where: { hostId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { rsvps: true, pageViews_: true } },
      rsvps: { select: { status: true } },
    },
  });

  const totals = events.reduce(
    (acc, event) => {
      const confirmed = event.rsvps.filter((item) => item.status === 'CONFIRMED').length;
      acc.events += 1;
      acc.rsvps += event._count.rsvps;
      acc.pageViews += event.pageViews + event._count.pageViews_;
      acc.confirmed += confirmed;
      return acc;
    },
    { events: 0, rsvps: 0, pageViews: 0, confirmed: 0 }
  );

  return { events, totals };
}

export default async function PortfolioAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const { events, totals } = await getPortfolioAnalytics(session.user.id);

  return (
    <PageTransition>
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Portfolio Analytics</h1>
          <p className="mt-1 text-sm text-[#4d7a90]">Cross-event performance snapshot for your hosted events.</p>
        </div>
        <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-medium text-[#7aafc4]" style={{ borderColor: 'rgba(0,229,204,0.18)' }}>Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Events', value: totals.events, color: '#00e5cc' },
          { label: 'RSVPs', value: totals.rsvps, color: '#38bdf8' },
          { label: 'Page Views', value: totals.pageViews, color: '#9c6bff' },
          { label: 'Confirmed', value: totals.confirmed, color: '#10b981' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: `1px solid ${card.color}22` }}>
            <p className="text-xs uppercase tracking-[0.16em]" style={{ color: '#4d7a90' }}>{card.label}</p>
            <p className="mt-2 text-4xl font-black" style={{ color: card.color, fontFamily: 'Bebas Neue, sans-serif' }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
        <div className="grid grid-cols-[minmax(0,1.7fr)_120px_120px_120px_120px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#4d7a90', borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
          <span>Event</span><span>Status</span><span>Views</span><span>RSVPs</span><span>Conversion</span>
        </div>
        {events.map((event) => {
          const pageViews = event.pageViews + event._count.pageViews_;
          const conversion = pageViews > 0 ? `${((event._count.rsvps / pageViews) * 100).toFixed(1)}%` : '0%';
          return (
            <div key={event.id} className="grid grid-cols-[minmax(0,1.7fr)_120px_120px_120px_120px] gap-4 px-5 py-4 text-sm" style={{ borderBottom: '1px solid rgba(0,229,204,0.05)' }}>
              <div className="min-w-0">
                <p className="truncate font-medium text-[#e8f4f8]">{event.title}</p>
                <p className="mt-1 text-xs text-[#4d7a90]">{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <span style={{ color: '#7aafc4' }}>{event.status}</span>
              <span style={{ color: '#38bdf8' }}>{pageViews}</span>
              <span style={{ color: '#e8f4f8' }}>{event._count.rsvps}</span>
              <span style={{ color: '#00e5cc' }}>{conversion}</span>
            </div>
          );
        })}
        {events.length === 0 && <p className="px-5 py-10 text-center text-sm text-[#4d7a90]">Create events to unlock portfolio analytics.</p>}
      </div>
    </div>
    </PageTransition>
  );
}
