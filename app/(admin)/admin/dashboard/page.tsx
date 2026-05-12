import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { ADMIN_NAV_LINKS } from '@/lib/admin';

async function getAdminOverview() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, totalEvents, totalRsvps, recentEvents, activeAnnouncements, recentReports,
    newUsersThisMonth, liveEvents, newRsvpsThisMonth, recentUsers] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.rSVP.count(),
    db.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true, host: { select: { name: true } }, _count: { select: { rsvps: true } } },
    }),
    db.announcement.count({ where: { isActive: true } }),
    db.contentReport.count({ where: { status: 'OPEN' } }).catch(() => 0),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.event.count({ where: { status: 'LIVE' } }),
    db.rSVP.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { hostedEvents: true } } },
    }),
  ]);

  // Build 7-day daily trend for new users and RSVPs
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [weeklyUsers, weeklyRsvps] = await Promise.all([
    db.user.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
    db.rSVP.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
  ]);

  const dailyMap: Record<string, { users: number; rsvps: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = { users: 0, rsvps: 0 };
  }
  for (const u of weeklyUsers) {
    const k = new Date(u.createdAt).toISOString().slice(0, 10);
    if (k in dailyMap) dailyMap[k].users++;
  }
  for (const r of weeklyRsvps) {
    const k = new Date(r.createdAt).toISOString().slice(0, 10);
    if (k in dailyMap) dailyMap[k].rsvps++;
  }
  const weeklyTrend = Object.entries(dailyMap).map(([date, counts]) => ({
    label: new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    users: counts.users,
    rsvps: counts.rsvps,
  }));

  return { totalUsers, totalEvents, totalRsvps, recentEvents, activeAnnouncements, recentReports,
    newUsersThisMonth, liveEvents, newRsvpsThisMonth, recentUsers, weeklyTrend };
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const data = await getAdminOverview();

  const STATUS_COLORS: Record<string, string> = {
    LIVE: '#00e5cc', DRAFT: '#4d7a90', ENDED: '#6b7280', CANCELLED: '#ff3cac', PRIVATE: '#9c6bff'
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r" style={{ background: 'rgba(12,26,31,0.5)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,229,204,0.08)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">+</span>
            <div>
              <p className="text-xs font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>ADMIN PORTAL</p>
              <p className="text-[10px]" style={{ color: '#4d7a90' }}>events.life</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {ADMIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
              style={{ color: '#7aafc4' }}
            >
              <span style={{ color: '#00e5cc' }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t mt-3" style={{ borderColor: 'rgba(0,229,204,0.08)' }}>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4d7a90] hover:text-[#7aafc4] transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>
              ADMIN OVERVIEW
            </h1>
            <p className="text-sm" style={{ color: '#4d7a90' }}>Platform-wide statistics and management</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: data.totalUsers, color: '#00e5cc' },
              { label: 'Total Events', value: data.totalEvents, color: '#9c6bff' },
              { label: 'Total RSVPs', value: data.totalRsvps, color: '#f59e0b' },
              { label: 'Active Notices', value: data.activeAnnouncements, color: '#ff3cac' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: `1px solid ${color}22` }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#4d7a90' }}>{label}</p>
                <p className="text-4xl font-black" style={{ color, fontFamily: 'Bebas Neue, sans-serif' }}>{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Recent Events */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,229,204,0.08)' }}>
              <h2 className="font-bold text-[#e8f4f8]">Recent Events</h2>
              <Link href="/admin/events" className="text-xs font-medium" style={{ color: '#00e5cc' }}>View all →</Link>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(0,229,204,0.06)' }}>
              {data.recentEvents.map((event) => (
                <div key={event.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#e8f4f8] truncate">{event.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4d7a90' }}>
                      by {event.host.name ?? 'Unknown'} · {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: `${STATUS_COLORS[event.status] ?? '#4d7a90'}18`, color: STATUS_COLORS[event.status] ?? '#4d7a90' }}>
                      {event.status}
                    </span>
                    <span className="text-xs" style={{ color: '#4d7a90' }}>{event._count.rsvps} RSVPs</span>
                    <Link href={`/admin/events?action=view&id=${event.id}`} className="text-xs" style={{ color: '#00e5cc' }}>Manage →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
