import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ADMIN_NAV_LINKS, requireAdmin } from '@/lib/admin';
import AdminReportsClient from './admin-reports-client';

export const metadata = { title: 'Content Reports | Admin' };

export default async function AdminReportsPage() {
  const session = await requireAdmin();
  if (!session) redirect('/dashboard');

  const reports = await db.contentReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

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
                background: link.href === '/admin/reports' ? 'rgba(0,229,204,0.08)' : 'transparent',
                color: link.href === '/admin/reports' ? '#00e5cc' : '#7aafc4',
              }}
            >
              <span style={{ color: '#00e5cc' }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto" id="main-content" role="main">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>
              CONTENT REPORTS
            </h1>
            <p className="text-sm text-[#4d7a90]">User-submitted content reports requiring review.</p>
          </div>

          <AdminReportsClient initialReports={reports} />
        </div>
      </main>
    </div>
  );
}
