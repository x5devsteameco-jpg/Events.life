import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import AdminEventsClient from './admin-events-client';

async function getAllEvents(search?: string, status?: string) {
  return db.event.findMany({
    where: {
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(status && status !== 'ALL' ? { status: status as never } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      visibility: true,
      category: true,
      date: true,
      createdAt: true,
      host: { select: { id: true, name: true, email: true } },
      _count: { select: { rsvps: true } },
    },
  });
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const { search, status } = await searchParams;
  const events = await getAllEvents(search, status);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r hidden lg:block" style={{ background: 'rgba(12,26,31,0.5)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,229,204,0.08)' }}>
          <p className="text-xs font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>ADMIN PORTAL</p>
        </div>
        <nav className="p-3 space-y-1">
          {[
            { href: '/admin/dashboard', label: 'Overview', icon: '◈' },
            { href: '/admin/events', label: 'Events', icon: '◉', active: true },
            { href: '/admin/content', label: 'Site Content', icon: '✦' },
            { href: '/admin/announcements', label: 'Announcements', icon: '◆' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: link.active ? 'rgba(0,229,204,0.08)' : 'transparent',
                color: link.active ? '#00e5cc' : '#7aafc4',
              }}
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

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>ALL EVENTS</h1>
              <p className="text-xs" style={{ color: '#4d7a90' }}>{events.length} events loaded</p>
            </div>
          </div>
          <AdminEventsClient events={events} />
        </div>
      </main>
    </div>
  );
}
