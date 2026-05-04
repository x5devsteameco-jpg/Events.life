import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { EventCard } from '@/components/events/event-card';
import { AnimatedStats } from '@/components/dashboard/animated-stats';
import { StaggerGrid } from '@/components/dashboard/stagger-grid';
import type { Event } from '@/lib/types';

async function getDashboardData(userId: string) {
  const [events, rsvpCount] = await Promise.all([
    db.event.findMany({
      where: { hostId: userId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { _count: { select: { rsvps: true } } },
    }),
    db.rSVP.count({
      where: { event: { hostId: userId } },
    }),
  ]);

  const now = new Date();
  const upcoming = events.filter((e) => e.status === 'LIVE' && new Date(e.date) > now).length;
  const drafts = events.filter((e) => e.status === 'DRAFT').length;

  return { events, rsvpCount, upcoming, drafts, total: events.length };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { events, rsvpCount, upcoming, drafts, total } = await getDashboardData(session.user.id);

  const stats = [
    { label: 'Total Events', value: total, icon: '📅', color: '#00e5cc' },
    { label: 'Total RSVPs', value: rsvpCount, icon: '✅', color: '#00d4b0' },
    { label: 'Upcoming', value: upcoming, icon: '🚀', color: '#00e5cc' },
    { label: 'Drafts', value: drafts, icon: '📝', color: '#4d7a90' },
  ];

  const quickActions = [
    { href: '/events/new', label: 'Create Event', icon: '✨', accent: true },
    { href: '/dashboard/events', label: 'Manage Events', icon: '📋' },
    { href: '/dashboard/attendees', label: 'View Attendees', icon: '👥' },
    { href: '/dashboard/settings', label: 'Edit Profile', icon: '⚙️' },
  ];

  return (
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
  );
}
