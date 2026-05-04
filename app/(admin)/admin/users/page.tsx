import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ADMIN_NAV_LINKS, requireAdmin } from '@/lib/admin';
import AdminUsersClient from './admin-users-client';

export const metadata = { title: 'Users | Admin' };

async function getUsers(search?: string, role?: string) {
  return db.user.findMany({
    where: {
      ...(search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
      ...(role && role !== 'ALL' ? { role: role as never } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      company: true,
      createdAt: true,
      _count: { select: { hostedEvents: true, rsvps: true } },
    },
  });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  const session = await requireAdmin();
  if (!session) redirect('/dashboard');

  const { search, role } = await searchParams;
  const users = await getUsers(search, role);

  const stats = {
    total: users.length,
    hosts: users.filter((u) => u.role === 'HOST' || u._count.hostedEvents > 0).length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    attendees: users.filter((u) => u.role === 'ATTENDEE').length,
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void, #020408)' }}>
      <aside className="w-56 flex-shrink-0 border-r hidden lg:block" style={{ background: 'rgba(12,26,31,0.5)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,229,204,0.08)' }}>
          <p className="text-xs font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>ADMIN PORTAL</p>
        </div>
        <nav className="p-3 space-y-1">
          {ADMIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: link.href === '/admin/users' ? 'rgba(0,229,204,0.08)' : 'transparent',
                color: link.href === '/admin/users' ? '#00e5cc' : '#7aafc4',
              }}
            >
              <span style={{ color: '#00e5cc' }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto" id="main-content" role="main">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>
              USER MANAGEMENT
            </h1>
            <p className="text-sm text-[#4d7a90]">View, search, and manage all registered users.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.total, color: '#7aafc4' },
              { label: 'Hosts', value: stats.hosts, color: '#00e5cc' },
              { label: 'Attendees', value: stats.attendees, color: '#9c6bff' },
              { label: 'Admins', value: stats.admins, color: '#ff3cac' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(12,26,31,0.6)', border: `1px solid ${s.color}20` }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-[#4d7a90] mt-1 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search/filter form */}
          <form method="get" className="flex flex-wrap gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name or email…"
              className="h-10 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none flex-1 min-w-[200px]"
              style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)' }}
            />
            <select
              name="role"
              defaultValue={role ?? 'ALL'}
              className="h-10 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
              style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)' }}
            >
              <option value="ALL">All Roles</option>
              <option value="ATTENDEE">Attendee</option>
              <option value="HOST">Host</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl text-sm font-bold text-[#020408]"
              style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
            >
              Search
            </button>
            {(search || role) && (
              <Link href="/admin/users" className="h-10 px-4 inline-flex items-center rounded-xl text-sm text-[#4d7a90] hover:text-[#e8f4f8]" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.08)' }}>
                Clear
              </Link>
            )}
          </form>

          {/* Users table */}
          <AdminUsersClient users={users} actorId={session.user.id!} />
        </div>
      </main>
    </div>
  );
}
