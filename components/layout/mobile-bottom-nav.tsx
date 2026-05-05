'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const publicItems = [
  { href: '/', label: 'Home', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>) },
  { href: '/events', label: 'Browse', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>) },
  { href: '/register', label: 'Start', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>) },
];

const authItems = [
  { href: '/dashboard', label: 'Dashboard', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>) },
  { href: '/events', label: 'Browse', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>) },
  { href: '/events/new', label: 'Create', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>) },
  { href: '/dashboard/analytics', label: 'Analytics', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>) },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const items = session?.user ? authItems : publicItems;

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t lg:hidden" style={{ background: 'rgba(6,13,16,0.94)', backdropFilter: 'blur(18px)', borderColor: 'rgba(0,229,204,0.1)', paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))' }}>
      <nav className="mx-auto flex max-w-xl items-center justify-around px-3 pt-2" aria-label="Main navigation">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className="flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition-all" style={{ color: active ? '#00e5cc' : '#6f93a3', background: active ? 'rgba(0,229,204,0.08)' : 'transparent' }}>
              <span className="leading-none" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
