import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ADMIN_NAV_LINKS, IMMUTABLE_ACCOUNT_HOLDER_FIELDS, requireAdmin } from '@/lib/admin';
import FlagsClient from './flags-client';
import Link from 'next/link';

export default async function AdminFlagsPage() {
  const session = await requireAdmin();
  if (!session) redirect('/dashboard');

  const flags = await db.featureFlag.findMany({ orderBy: [{ scope: 'asc' }, { label: 'asc' }] });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)' }}>
      <aside className="w-56 flex-shrink-0 border-r hidden lg:block" style={{ background: 'rgba(12,26,31,0.5)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,229,204,0.08)' }}><p className="text-xs font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>ADMIN PORTAL</p></div>
        <nav className="p-3 space-y-1">{ADMIN_NAV_LINKS.map((link) => <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: link.href === '/admin/flags' ? 'rgba(0,229,204,0.08)' : 'transparent', color: link.href === '/admin/flags' ? '#00e5cc' : '#7aafc4' }}><span style={{ color: '#00e5cc' }}>{link.icon}</span>{link.label}</Link>)}</nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>FEATURE FLAGS</h1>
            <p className="text-sm" style={{ color: '#4d7a90' }}>Control feature rollout without touching non-admin account-holder data.</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,60,172,0.04)', border: '1px solid rgba(255,60,172,0.12)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff3cac]">Immutable Data Policy</p>
            <p className="mt-2 text-sm" style={{ color: '#f2c0d8' }}>Admin controls must not edit these personal domains:</p>
            <div className="mt-3 flex flex-wrap gap-2">{IMMUTABLE_ACCOUNT_HOLDER_FIELDS.map((field) => <span key={field} className="rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(255,60,172,0.08)', color: '#ff9dcb' }}>{field}</span>)}</div>
          </div>
          <FlagsClient initialFlags={flags} />
        </div>
      </main>
    </div>
  );
}
