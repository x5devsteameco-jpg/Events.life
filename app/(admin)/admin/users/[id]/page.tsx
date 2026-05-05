import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ADMIN_NAV_LINKS, requireAdmin } from '@/lib/admin';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'User Detail | Admin' };

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) redirect('/dashboard');

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      company: true,
      position: true,
      bio: true,
      instagram: true,
      linkedin: true,
      twitter: true,
      website: true,
      bannerUrl: true,
      themePreset: true,
      createdAt: true,
      termsAcceptedAt: true,
      privacyAcceptedAt: true,
      hostResponsibilityAcceptedAt: true,
      policyVersion: true,
      hostedEvents: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, status: true, date: true, _count: { select: { rsvps: true } } },
      },
      rsvps: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, status: true, createdAt: true, event: { select: { id: true, title: true, slug: true } } },
      },
      _count: { select: { hostedEvents: true, rsvps: true } },
    },
  });

  if (!user) notFound();

  const STATUS_COLORS: Record<string, string> = {
    LIVE: '#00e5cc', DRAFT: '#4d7a90', ENDED: '#6b7280', CANCELLED: '#ff3cac', PRIVATE: '#9c6bff',
  };
  const RSVP_COLORS: Record<string, string> = {
    CONFIRMED: '#00e5cc', WAITLISTED: '#f59e0b', CANCELLED: '#ff3cac', PENDING: '#4d7a90',
  };
  const ROLE_COLORS: Record<string, string> = {
    ADMIN: '#ff3cac', HOST: '#00e5cc', ATTENDEE: '#4d7a90',
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)' }}>
      <aside className="w-56 flex-shrink-0 border-r hidden lg:block" style={{ background: 'rgba(12,26,31,0.5)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,229,204,0.08)' }}>
          <p className="text-xs font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>ADMIN PORTAL</p>
        </div>
        <nav className="p-3 space-y-1">
          {ADMIN_NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ color: link.href === '/admin/users' ? '#00e5cc' : '#7aafc4', background: link.href === '/admin/users' ? 'rgba(0,229,204,0.08)' : 'transparent' }}
            >
              <span style={{ color: '#00e5cc' }}>{link.icon}</span>{link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#4d7a90]">
            <Link href="/admin/users" className="hover:text-[#00e5cc] transition-colors">Users</Link>
            <span>/</span>
            <span className="text-[#e8f4f8]">{user.name ?? user.email}</span>
          </div>

          {/* Profile header */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
            <div className="flex items-start gap-5 flex-wrap">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-[#020408] flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
                {(user.name?.[0] ?? user.email[0] ?? 'U').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-xl font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>
                    {user.name ?? 'No Name'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: `${ROLE_COLORS[user.role]}18`, border: `1px solid ${ROLE_COLORS[user.role]}30`, color: ROLE_COLORS[user.role] }}>
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-[#4d7a90]">{user.email}</p>
                {user.company && <p className="text-xs text-[#4d7a90] mt-1">{user.company}{user.position ? ` · ${user.position}` : ''}</p>}
                <p className="text-xs text-[#2d5268] mt-2">Member since {formatDate(user.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/users?search=${encodeURIComponent(user.email)}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#4d7a90] hover:text-[#e8f4f8] transition-colors"
                  style={{ border: '1px solid rgba(0,229,204,0.1)' }}
                >
                  ← Back to Users
                </Link>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-sm text-[#7aafc4] border-t pt-4" style={{ borderColor: 'rgba(0,229,204,0.08)' }}>
                {user.bio}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Events Hosted', value: user._count.hostedEvents, color: '#00e5cc' },
              { label: 'RSVPs Made', value: user._count.rsvps, color: '#9c6bff' },
              { label: 'Role', value: user.role, color: ROLE_COLORS[user.role] },
              { label: 'Theme', value: user.themePreset ?? 'teal', color: '#4d7a90' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.06)' }}>
                <p className="text-xs text-[#4d7a90] mb-1">{label}</p>
                <p className="text-xl font-black" style={{ color, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Policy compliance */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.06)' }}>
            <h2 className="text-sm font-bold text-[#00e5cc] uppercase tracking-wider mb-4">Policy Compliance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Terms of Service', date: user.termsAcceptedAt },
                { label: 'Privacy Policy', date: user.privacyAcceptedAt },
                { label: 'Host Responsibility', date: user.hostResponsibilityAcceptedAt },
              ].map(({ label, date }) => (
                <div key={label} className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: 'rgba(6,13,16,0.5)' }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: date ? '#00e5cc' : '#4d7a90' }}>
                    {date ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#e8f4f8]">{label}</p>
                    <p className="text-[10px] text-[#4d7a90] mt-0.5">
                      {date ? formatDate(date) : 'Not accepted'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {user.policyVersion && (
              <p className="mt-3 text-xs text-[#2d5268]">Policy version: {user.policyVersion}</p>
            )}
          </div>

          {/* Social links */}
          {(user.instagram || user.twitter || user.linkedin || user.website) && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.06)' }}>
              <h2 className="text-sm font-bold text-[#00e5cc] uppercase tracking-wider mb-3">Social Links</h2>
              <div className="flex flex-wrap gap-3">
                {user.instagram && <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4d7a90] hover:text-[#00e5cc] transition-colors">Instagram: {user.instagram}</a>}
                {user.twitter && <a href={`https://twitter.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4d7a90] hover:text-[#00e5cc] transition-colors">Twitter: {user.twitter}</a>}
                {user.linkedin && <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4d7a90] hover:text-[#00e5cc] transition-colors">LinkedIn</a>}
                {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4d7a90] hover:text-[#00e5cc] transition-colors">Website</a>}
              </div>
            </div>
          )}

          {/* Hosted events */}
          {user.hostedEvents.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.06)' }}>
              <h2 className="text-sm font-bold text-[#00e5cc] uppercase tracking-wider mb-4">
                Hosted Events ({user._count.hostedEvents})
              </h2>
              <div className="space-y-2">
                {user.hostedEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(6,13,16,0.5)' }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: STATUS_COLORS[event.status] ?? '#4d7a90' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#e8f4f8] truncate">{event.title}</p>
                      <p className="text-xs text-[#4d7a90]">{formatDate(event.date)} · {event._count.rsvps} RSVPs</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${STATUS_COLORS[event.status] ?? '#4d7a90'}18`, color: STATUS_COLORS[event.status] ?? '#4d7a90' }}
                    >
                      {event.status}
                    </span>
                    <Link href={`/admin/events?search=${encodeURIComponent(event.title)}`}
                      className="text-[10px] text-[#4d7a90] hover:text-[#00e5cc] transition-colors flex-shrink-0"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent RSVPs */}
          {user.rsvps.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.06)' }}>
              <h2 className="text-sm font-bold text-[#00e5cc] uppercase tracking-wider mb-4">
                Recent RSVPs ({user._count.rsvps})
              </h2>
              <div className="space-y-2">
                {user.rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(6,13,16,0.5)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#e8f4f8] truncate">{rsvp.event.title}</p>
                      <p className="text-xs text-[#4d7a90]">{formatDate(rsvp.createdAt)}</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${RSVP_COLORS[rsvp.status] ?? '#4d7a90'}18`, color: RSVP_COLORS[rsvp.status] ?? '#4d7a90' }}
                    >
                      {rsvp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
