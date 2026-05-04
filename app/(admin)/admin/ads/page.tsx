import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ADMIN_NAV_LINKS, requireAdmin } from '@/lib/admin';
import AdsClient from './ads-client';
import Link from 'next/link';

export default async function AdminAdsPage() {
  const session = await requireAdmin();
  if (!session) redirect('/dashboard');
  const slots = await db.adSlot.findMany({ orderBy: [{ priority: 'desc' }, { label: 'asc' }] });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)' }}>
      <aside className="w-56 flex-shrink-0 border-r hidden lg:block" style={{ background: 'rgba(12,26,31,0.5)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,229,204,0.08)' }}><p className="text-xs font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>ADMIN PORTAL</p></div>
        <nav className="p-3 space-y-1">{ADMIN_NAV_LINKS.map((link) => <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: link.href === '/admin/ads' ? 'rgba(0,229,204,0.08)' : 'transparent', color: link.href === '/admin/ads' ? '#00e5cc' : '#7aafc4' }}><span style={{ color: '#00e5cc' }}>{link.icon}</span>{link.label}</Link>)}</nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto"><div className="mx-auto max-w-5xl space-y-6"><div><h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.06em' }}>AD CONTROL</h1><p className="text-sm" style={{ color: '#4d7a90' }}>Manage promotional inventory, CTA routing, and spotlight campaigns.</p></div><AdsClient initialSlots={slots} /></div></main>
    </div>
  );
}
