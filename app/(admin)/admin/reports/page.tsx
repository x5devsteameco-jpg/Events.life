import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ADMIN_NAV_LINKS, requireAdmin } from '@/lib/admin';

export const metadata = { title: 'Content Reports | Admin' };

export default async function AdminReportsPage() {
  const session = await requireAdmin();
  if (!session) redirect('/dashboard');

  const reports = await db.contentReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const pending = reports.filter((r) => r.status === 'PENDING');
  const resolved = reports.filter((r) => r.status !== 'PENDING');

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)' }}>
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

      <main className="flex-1 p-6 overflow-auto" id="main-content">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>
              CONTENT REPORTS
            </h1>
            <p className="text-sm text-[#4d7a90]">User-submitted content reports requiring review.</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total', value: reports.length, color: '#7aafc4' },
              { label: 'Pending', value: pending.length, color: '#f59e0b' },
              { label: 'Resolved', value: resolved.length, color: '#00e5cc' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 text-center"
                style={{ background: 'rgba(12,26,31,0.6)', border: `1px solid ${stat.color}20` }}
              >
                <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-[#4d7a90] mt-1 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {reports.length === 0 ? (
            <div
              className="rounded-2xl p-16 text-center"
              style={{ background: 'rgba(12,26,31,0.4)', border: '1px dashed rgba(0,229,204,0.15)' }}
            >
              <p className="text-4xl mb-3">✅</p>
              <h3 className="text-lg font-bold text-[#e8f4f8]">No reports yet</h3>
              <p className="text-sm text-[#4d7a90] mt-1">The platform is clean.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl p-5"
                  style={{
                    background: 'rgba(12,26,31,0.6)',
                    border: `1px solid ${report.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : 'rgba(0,229,204,0.1)'}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{
                            background: report.status === 'PENDING' ? 'rgba(245,158,11,0.12)' : 'rgba(0,229,204,0.08)',
                            color: report.status === 'PENDING' ? '#f59e0b' : '#00e5cc',
                          }}
                        >
                          {report.status}
                        </span>
                        <span className="text-xs text-[#4d7a90]">{report.targetType} · {report.targetId.slice(0, 12)}…</span>
                      </div>
                      <p className="text-sm font-semibold text-[#e8f4f8]">{report.reason}</p>
                      {report.details && (
                        <p className="text-xs text-[#4d7a90] mt-1 line-clamp-2">{report.details}</p>
                      )}
                      <p className="text-xs text-[#2d5268] mt-2">
                        Reporter ID: {report.reporterId?.slice(0, 12) ?? 'Anonymous'} ·{' '}
                        {new Date(report.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
