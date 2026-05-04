import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import AnalyticsClient from './analytics-client';

async function getEventAnalytics(eventId: string, hostId: string) {
  const event = await db.event.findFirst({
    where: { id: eventId, hostId },
    select: {
      id: true,
      title: true,
      slug: true,
      date: true,
      status: true,
      pageViews: true,
      maxAttendees: true,
      rsvps: {
        select: { status: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
      pageViews_: {
        select: { createdAt: true, referer: true, path: true, utmSource: true, utmMedium: true, utmCampaign: true, ipHash: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!event) return null;

  const confirmed = event.rsvps.filter((r) => r.status === 'CONFIRMED').length;
  const pending = event.rsvps.filter((r) => r.status === 'PENDING').length;
  const cancelled = event.rsvps.filter((r) => r.status === 'CANCELLED').length;
  const waitlisted = event.rsvps.filter((r) => r.status === 'WAITLISTED').length;
  const total = event.rsvps.length;
  const pageViewCount = event.pageViews + event.pageViews_.length;
  const uniqueVisitors = new Set(event.pageViews_.map((view) => view.ipHash).filter(Boolean)).size;
  const attributedViews = event.pageViews_.filter((view) => view.utmSource || view.utmMedium || view.utmCampaign).length;
  const conversionRate = pageViewCount > 0 ? ((total / pageViewCount) * 100).toFixed(1) : '0';

  // Build 30-day daily RSVP buckets
  const now = new Date();
  const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dailyRsvps: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const label = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const count = event.rsvps.filter((r) => {
      const rd = new Date(r.createdAt);
      return (
        rd.getFullYear() === d.getFullYear() &&
        rd.getMonth() === d.getMonth() &&
        rd.getDate() === d.getDate()
      );
    }).length;
    dailyRsvps.push({ date: label, count });
  }

  // Build 30-day daily page view buckets
  const dailyViews: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const label = d.toLocaleDateString('en-CA');
    const count = event.pageViews_.filter((v) => {
      const vd = new Date(v.createdAt);
      return (
        vd.getFullYear() === d.getFullYear() &&
        vd.getMonth() === d.getMonth() &&
        vd.getDate() === d.getDate()
      );
    }).length;
    dailyViews.push({ date: label, count });
  }

  // Referrer breakdown
  const refererMap: Record<string, number> = {};
  for (const pv of event.pageViews_) {
    const ref = pv.referer ?? 'Direct';
    refererMap[ref] = (refererMap[ref] ?? 0) + 1;
  }
  const topReferers = Object.entries(refererMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, count]) => ({ source, count }));

  const campaignMap: Record<string, number> = {};
  const pathMap: Record<string, number> = {};
  for (const pv of event.pageViews_) {
    const campaignKey = [pv.utmSource, pv.utmMedium, pv.utmCampaign].filter(Boolean).join(' / ') || 'Direct / Unattributed';
    campaignMap[campaignKey] = (campaignMap[campaignKey] ?? 0) + 1;
    const pathKey = pv.path || '/event/' + event.slug;
    pathMap[pathKey] = (pathMap[pathKey] ?? 0) + 1;
  }
  const topCampaigns = Object.entries(campaignMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([campaign, count]) => ({ campaign, count }));
  const topPaths = Object.entries(pathMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({ path, count }));

  const recentViews = dailyViews.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const previousViews = dailyViews.slice(-14, -7).reduce((sum, day) => sum + day.count, 0);
  const recentRsvps = dailyRsvps.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const previousRsvps = dailyRsvps.slice(-14, -7).reduce((sum, day) => sum + day.count, 0);

  const viewsTrendPct = previousViews > 0
    ? Math.round(((recentViews - previousViews) / previousViews) * 100)
    : recentViews > 0
      ? 100
      : 0;
  const rsvpTrendPct = previousRsvps > 0
    ? Math.round(((recentRsvps - previousRsvps) / previousRsvps) * 100)
    : recentRsvps > 0
      ? 100
      : 0;
  const attributionRate = pageViewCount > 0
    ? Math.round((attributedViews / pageViewCount) * 100)
    : 0;

  return {
    event: { id: event.id, title: event.title, slug: event.slug, date: event.date, status: event.status, maxAttendees: event.maxAttendees },
    stats: { total, confirmed, pending, cancelled, waitlisted, pageViewCount, conversionRate, uniqueVisitors, attributedViews },
    dailyRsvps,
    dailyViews,
    topReferers,
    topCampaigns,
    topPaths,
    quality: {
      recentViews,
      recentRsvps,
      viewsTrendPct,
      rsvpTrendPct,
      attributionRate,
    },
  };
}

export default async function EventAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const { id } = await params;
  const data = await getEventAnalytics(id, session.user.id);
  if (!data) notFound();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(0,229,204,0.12)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/events/${id}`}
              className="p-2 rounded-xl transition-colors hover:bg-white/5"
              style={{ color: '#7aafc4' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="text-xs font-medium" style={{ color: '#4d7a90' }}>Analytics</p>
              <h1 className="text-lg font-bold text-[#e8f4f8] truncate max-w-xs">{data.event.title}</h1>
            </div>
          </div>
          <Link
            href={`/event/${data.event.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)', color: '#00e5cc' }}
          >
            View Event →
          </Link>
        </div>
      </div>

      <AnalyticsClient data={data} />
    </div>
  );
}
