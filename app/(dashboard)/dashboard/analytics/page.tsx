import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageTransition } from '@/components/ui/page-transition';
import { AnalyticsBarChart } from '@/components/dashboard/analytics-charts';
import { AnalyticsCsvExport } from '@/components/dashboard/analytics-csv-export';

async function getPortfolioAnalytics(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [events, recentRsvps] = await Promise.all([
    db.event.findMany({
      where: { hostId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { rsvps: true, pageViews_: true } },
        rsvps: { select: { status: true, checkedIn: true } },
      },
    }),
    db.rSVP.findMany({
      where: {
        event: { hostId: userId },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const totals = events.reduce(
    (acc, event) => {
      const confirmed = event.rsvps.filter((item) => item.status === 'CONFIRMED').length;
      const checkedIn = event.rsvps.filter((item) => item.status === 'CONFIRMED' && item.checkedIn).length;
      acc.events += 1;
      acc.rsvps += event._count.rsvps;
      acc.pageViews += event.pageViews + event._count.pageViews_;
      acc.confirmed += confirmed;
      acc.checkedIn += checkedIn;
      return acc;
    },
    { events: 0, rsvps: 0, pageViews: 0, confirmed: 0, checkedIn: 0 }
  );

  // Build 30-day daily counts
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const r of recentRsvps) {
    const key = new Date(r.createdAt).toISOString().slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const rsvpTrend = Object.entries(dailyMap).map(([date, value]) => ({
    label: new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value,
    color: '#00e5cc',
  }));

  return { events, totals, rsvpTrend };
}

export default async function PortfolioAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const { events, totals, rsvpTrend } = await getPortfolioAnalytics(session.user.id);

  // Build conversion funnel steps
  const funnelSteps = [
    { label: 'Page Views', value: totals.pageViews, color: '#9c6bff', pct: 100 },
    { label: 'Total RSVPs', value: totals.rsvps, color: '#38bdf8', pct: totals.pageViews > 0 ? Math.round((totals.rsvps / totals.pageViews) * 100) : 0 },
    { label: 'Confirmed', value: totals.confirmed, color: '#00e5cc', pct: totals.rsvps > 0 ? Math.round((totals.confirmed / totals.rsvps) * 100) : 0 },
    { label: 'Checked In', value: totals.checkedIn, color: '#10b981', pct: totals.confirmed > 0 ? Math.round((totals.checkedIn / totals.confirmed) * 100) : 0 },
  ];

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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Events', value: totals.events, color: '#00e5cc' },
          { label: 'RSVPs', value: totals.rsvps, color: '#38bdf8' },
          { label: 'Page Views', value: totals.pageViews, color: '#9c6bff' },
          { label: 'Confirmed', value: totals.confirmed, color: '#10b981' },
          { label: 'Attendance Rate', value: `${totals.confirmed > 0 ? Math.round((totals.checkedIn / totals.confirmed) * 100) : 0}%`, color: '#f59e0b' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: `1px solid ${card.color}22` }}>
            <p className="text-xs uppercase tracking-[0.16em]" style={{ color: '#4d7a90' }}>{card.label}</p>
            <p className="mt-2 text-4xl font-black" style={{ color: card.color, fontFamily: 'Bebas Neue, sans-serif' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Conversion Funnel */}
      {totals.pageViews > 0 && (
        <section className="rounded-2xl p-6" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.08)' }}>
          <h2 className="text-sm font-bold text-[#00e5cc] uppercase tracking-wider mb-5">Conversion Funnel</h2>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-28 text-xs text-[#7aafc4] text-right flex-shrink-0">{step.label}</div>
                <div className="flex-1 relative h-8 rounded-lg overflow-hidden" style={{ background: 'rgba(6,13,16,0.6)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700"
                    style={{
                      width: `${Math.max(step.pct, step.value > 0 ? 2 : 0)}%`,
                      background: `linear-gradient(90deg, ${step.color}40, ${step.color}80)`,
                      borderRight: step.pct > 0 ? `2px solid ${step.color}` : 'none',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 gap-2">
                    <span className="text-sm font-bold" style={{ color: step.color }}>{step.value.toLocaleString()}</span>
                    {i > 0 && <span className="text-xs text-[#2d5268]">{step.pct}% of {funnelSteps[i - 1].label.toLowerCase()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#2d5268] mt-4">
            Overall view-to-RSVP rate: <span className="text-[#00e5cc] font-semibold">
              {totals.pageViews > 0 ? `${((totals.rsvps / totals.pageViews) * 100).toFixed(1)}%` : '—'}
            </span>
          </p>
        </section>
      )}

      {/* RSVP Trend: 30-day daily chart */}
      {rsvpTrend.some((d) => d.value > 0) && (
        <AnalyticsBarChart
          title="RSVPs – Last 30 Days"
          data={rsvpTrend}
        />
      )}

      {/* RSVP bar chart — top 8 events by RSVPs */}
      {events.length > 0 && (
        <AnalyticsBarChart
          title="RSVPs by Event"
          data={[...events]
            .sort((a, b) => b._count.rsvps - a._count.rsvps)
            .slice(0, 8)
            .map((e) => ({
              label: e.title.length > 14 ? e.title.slice(0, 13) + '…' : e.title,
              value: e._count.rsvps,
              color: '#00e5cc',
            }))}
        />
      )}

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

      {events.length > 0 && (
        <div className="flex justify-end">
          <AnalyticsCsvExport
            rows={events.map((event) => {
              const pageViews = event.pageViews + event._count.pageViews_;
              const conversion = pageViews > 0 ? `${((event._count.rsvps / pageViews) * 100).toFixed(1)}%` : '0%';
              return {
                title: event.title,
                date: new Date(event.date).toLocaleDateString(),
                status: event.status,
                pageViews,
                rsvps: event._count.rsvps,
                conversion,
              };
            })}
          />
        </div>
      )}
    </div>
    </PageTransition>
  );
}
