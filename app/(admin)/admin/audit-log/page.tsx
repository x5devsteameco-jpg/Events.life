import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ADMIN_NAV_LINKS, requireAdmin } from '@/lib/admin';
import Link from 'next/link';

export default async function AdminAuditLogPage() {
  const session = await requireAdmin();
  if (!session) redirect('/dashboard');
  const entries = await db.adminChangeLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)' }}>
      <aside className="w-56 flex-shrink-0 border-r hidden lg:block" style={{ background: 'rgba(12,26,31,0.5)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,229,204,0.08)' }}><p className="text-xs font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>ADMIN PORTAL</p></div>
        <nav className="p-3 space-y-1">{ADMIN_NAV_LINKS.map((link) => <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: link.href === '/admin/audit-log' ? 'rgba(0,229,204,0.08)' : 'transparent', color: link.href === '/admin/audit-log' ? '#00e5cc' : '#7aafc4' }}><span style={{ color: '#00e5cc' }}>{link.icon}</span>{link.label}</Link>)}</nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>AUDIT LOG</h1>
            <p className="text-sm" style={{ color: '#4d7a90' }}>Every admin write operation is captured here for governance and rollback analysis.</p>
          </div>
          <div className="overflow-hidden rounded-2xl" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
            <div className="grid grid-cols-[140px_120px_140px_1fr] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#4d7a90', borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
              <span>Date</span><span>Action</span><span>Target</span><span>Summary</span>
            </div>
            {entries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[140px_120px_140px_1fr] gap-4 px-5 py-3 text-sm" style={{ borderBottom: '1px solid rgba(0,229,204,0.05)' }}>
                <span style={{ color: '#7aafc4' }}>{new Date(entry.createdAt).toLocaleDateString()}</span>
                <span style={{ color: '#00e5cc' }}>{entry.action}</span>
                <span className="truncate text-[#e8f4f8]">{entry.targetType}</span>
                <span style={{ color: '#b9d5df' }}>{entry.summary}</span>
              </div>
            ))}
            {entries.length === 0 && <p className="px-5 py-10 text-center text-sm" style={{ color: '#4d7a90' }}>No admin changes recorded yet.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
