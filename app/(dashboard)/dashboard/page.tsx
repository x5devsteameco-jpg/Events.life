import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { EventCard } from '@/components/events/event-card';
import { AnimatedStats } from '@/components/dashboard/animated-stats';
import { StaggerGrid } from '@/components/dashboard/stagger-grid';
import { RSVPSparkline } from '@/components/dashboard/rsvp-sparkline';
import { PageTransition } from '@/components/ui/page-transition';
import type { Event } from '@/lib/types';

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
      take: 7,
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

  // Build daily buckets [day-6, day-5, ..., today]
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
    { label: 'Total Events', value: total, icon: '📅', color: '#00e5cc' },
    { label: 'Total RSVPs', value: rsvpCount, icon: '✅', color: '#00d4b0' },
    { label: 'Upcoming', value: upcoming, icon: '🚀', color: '#00e5cc' },
    { label: 'Drafts', value: drafts, icon: '📝', color: '#4d7a90' },
  ];

  const quickActions = [
    { href: '/events/new', label: 'Create Event', icon: '✨', accent: true },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📊' },
    { href: '/dashboard/events', label: 'Manage Events', icon: '📋' },
    { href: '/dashboard/attendees', label: 'View Attendees', icon: '👥' },
    { href: '/dashboard/settings', label: 'Edit Profile', icon: '⚙️' },
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
            <span className="text-xl">{action.icon}</span>
            {action.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <AnimatedStats stats={stats} />

      {/* RSVP Trend Sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 mb-2">
        <RSVPSparkline data={rsvpTrend} label="RSVPs This Week" total={recentRsvpCount} />
      </div>

      {/* Recent Activity Feed */}
      {activityFeed.length > 0 && (
        <div className="mt-6 rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.1)' }}>
          <h3 className="text-sm font-black text-[#e8f4f8] mb-4 uppercase tracking-widest" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
            Recent Activity
          </h3>
          <div className="space-y-2.5">
            {activityFeed.map((rsvp) => {
              const elapsed = Date.now() - new Date(rsvp.createdAt).getTime();
              const mins = Math.floor(elapsed / 60000);
              const hours = Math.floor(mins / 60);
              const days = Math.floor(hours / 24);
              const timeAgo = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : mins > 1 ? `${mins}m ago` : 'Just now';
              const statusColor = rsvp.status === 'CONFIRMED' ? '#00e5cc' : rsvp.status === 'WAITLISTED' ? '#f59e0b' : '#4d7a90';
              return (
                <div key={rsvp.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${statusColor}18`, color: statusColor }}>
                    {(rsvp.guestName ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#e8f4f8]">
                      <span className="font-semibold">{rsvp.guestName ?? 'Someone'}</span>
                      <span className="text-[#4d7a90]"> RSVPd to </span>
                      <Link href={`/event/${rsvp.event.slug}`} className="font-medium hover:underline" style={{ color: statusColor }}>
                        {rsvp.event.title}
                      </Link>
                    </p>
                    <p className="text-[10px] text-[#2d5268] mt-0.5">{timeAgo} · {rsvp.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          <div className="text-5xl mb-4">🎪</div>
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
