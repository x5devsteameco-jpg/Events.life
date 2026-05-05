import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { EventCard } from '@/components/events/event-card';
import { AnimatedStats } from '@/components/dashboard/animated-stats';
import { StaggerGrid } from '@/components/dashboard/stagger-grid';
import { RSVPSparkline } from '@/components/dashboard/rsvp-sparkline';
import { PageTransition } from '@/components/ui/page-transition';
import { formatDate } from '@/lib/utils';
import type { Event } from '@/lib/types';

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED:  '#00e5cc',
  WAITLISTED: '#f59e0b',
  CANCELLED:  '#ff3cac',
  PENDING:    '#9c6bff',
};

async function getDashboardData(userId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [events, rsvpCount, recentRsvps, activityFeed] = await Promise.all([
    db.event.findMany({
      where: { hostId: userId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { _count: { select: { rsvps: true } } },
    }),
    db.rSVP.count({
      where: { event: { hostId: userId } },
    }),
    db.rSVP.findMany({
      where: {
        event: { hostId: userId },
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
    }),
    db.rSVP.findMany({
      where: { event: { hostId: userId } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        guestName: true,
        status: true,
        createdAt: true,
        event: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const now = new Date();
  const upcoming = events.filter((e) => e.status === 'LIVE' && new Date(e.date) > now).length;
  const drafts = events.filter((e) => e.status === 'DRAFT').length;

  const rsvpTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    return recentRsvps.filter((r) => {
      const rd = new Date(r.createdAt);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth() && rd.getDate() === d.getDate();
    }).length;
  });

  return { events, rsvpCount, upcoming, drafts, total: events.length, rsvpTrend, recentRsvpCount: recentRsvps.length, activityFeed };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { events, rsvpCount, upcoming, drafts, total, rsvpTrend, recentRsvpCount, activityFeed } = await getDashboardData(session.user.id);

  const stats = [
    { label: 'Total Events', value: total, icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>), color: '#00e5cc' },
    { label: 'Total RSVPs', value: rsvpCount, icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>), color: '#00d4b0' },
    { label: 'Upcoming', value: upcoming, icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>), color: '#00e5cc' },
    { label: 'Drafts', value: drafts, icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>), color: '#4d7a90' },
  ];

  const quickActions = [
    { href: '/events/new', label: 'Create Event', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>, accent: true },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { href: '/dashboard/events', label: 'Manage Events', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { href: '/dashboard/attendees', label: 'View Attendees', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { href: '/dashboard/settings', label: 'Edit Profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> },
  ];

  return (
    <PageTransition>
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
            Dashboard
          </h1>
          <p className="text-sm text-[#4d7a90] mt-1 truncate max-w-xs">Welcome back, {session.user.name || 'Host'}</p>
        </div>
        <Link
          href="/events/new"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#020408] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,229,204,0.3)] flex-shrink-0 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Event
        </Link>
      </div>

      {/* Quick Actions (mobile prominent) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 sm:hidden">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center text-xs font-semibold min-h-[72px] justify-center transition-all active:scale-95"
            style={action.accent
              ? { background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', color: '#020408' }
              : { background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)', color: '#7aafc4' }
            }
          >
            <span className="flex-shrink-0">{action.icon}</span>
            {action.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <AnimatedStats stats={stats} />

      {/* RSVP Trend Sparkline + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 mb-2">
        <RSVPSparkline data={rsvpTrend} label="RSVPs This Week" total={recentRsvpCount} />

        {/* Recent Activity Feed */}
        <div
          className="lg:col-span-2 rounded-2xl p-4"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4d7a90] mb-3">Recent Activity</h3>
          {activityFeed.length === 0 ? (
            <p className="text-sm text-[#4d7a90] py-4 text-center">No RSVPs yet — share your first event to get started.</p>
          ) : (
            <ul className="space-y-2">
              {activityFeed.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm py-1">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLOR[item.status] ?? '#7aafc4' }}
                    aria-hidden="true"
                  />
                  <span className="text-[#e8f4f8] font-medium truncate flex-1">{item.guestName}</span>
                  <span className="text-[#4d7a90] truncate hidden sm:block max-w-[160px]">{item.event.title}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: STATUS_COLOR[item.status] ?? '#7aafc4' }}>
                    {item.status}
                  </span>
                  <span className="text-xs text-[#4d7a90] flex-shrink-0">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Events */}
      <div className="flex items-center justify-between mb-5 mt-8">
        <h2 className="text-lg font-bold text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
          Recent Events
        </h2>
        <Link href="/dashboard/events" className="text-sm text-[#4d7a90] hover:text-[#00e5cc] transition-colors">
          View all →
        </Link>
      </div>

      {events.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: 'rgba(12,26,31,0.4)', border: '1px dashed rgba(0,229,204,0.15)' }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.15)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></svg>
            </div>
          <h3 className="text-xl font-bold text-[#e8f4f8] mb-2" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
            No events yet
          </h3>
          <p className="text-sm text-[#4d7a90] mb-6 max-w-sm mx-auto">
            Create your first event to start collecting RSVPs and growing your community.
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[#020408]"
            style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <StaggerGrid>
          {events.map((event) => (
            <EventCard key={event.id} event={event as unknown as Event & { _count: { rsvps: number } }} />
          ))}
        </StaggerGrid>
      )}
    </div>
    </PageTransition>
  );
}
