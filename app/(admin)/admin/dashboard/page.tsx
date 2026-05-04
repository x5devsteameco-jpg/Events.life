import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';

async function getAdminOverview() {
  const [totalUsers, totalEvents, totalRsvps, recentEvents, activeAnnouncements] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.rSVP.count(),
    db.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true, host: { select: { name: true } }, _count: { select: { rsvps: true } } },
    }),
    db.announcement.count({ where: { isActive: true } }),
  ]);
  return { totalUsers, totalEvents, totalRsvps, recentEvents, activeAnnouncements };
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const data = await getAdminOverview();

  const navLinks = [
    { href: '/admin/dashboard', label: 'Overview', icon: '◈' },
    { href: '/admin/events', label: 'Events', icon: '◉' },
    { href: '/admin/content', label: 'Site Content', icon: '✦' },
    { href: '/admin/announcements', label: 'Announcements', icon: '◆' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    LIVE: '#00e5cc', DRAFT: '#4d7a90', ENDED: '#6b7280', CANCELLED: '#ff3cac', PRIVATE: '#9c6bff'
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r" style={{ background: 'rgba(12,26,31,0.5)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,229,204,0.08)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">⬡</span>
            <div>
              <p className="text-xs font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>ADMIN PORTAL</p>
              <p className="text-[10px]" style={{ color: '#4d7a90' }}>events.life</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {navLinks.map((link) => (
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
