'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const publicItems = [
  { href: '/', label: 'Home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/events', label: 'Browse', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { href: '/register', label: 'Get Started', accent: true, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
];

const authItems = [
  { href: '/dashboard', label: 'Home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: '/events', label: 'Browse', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { href: '/events/new', label: 'Create', accent: true, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { href: '/dashboard/saved', label: 'Saved', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { href: '/dashboard/settings', label: 'Profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const items = session?.user ? authItems : publicItems;

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t lg:hidden"
      style={{
        background: 'rgba(2,4,8,0.96)',
        backdropFilter: 'blur(24px)',
        borderColor: 'rgba(0,229,204,0.1)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <nav className="mx-auto flex max-w-xl items-center justify-around px-2 pt-2" aria-label="Main navigation">
        {items.map((item) => {
          const isCreate = (item as { accent?: boolean }).accent;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          if (isCreate) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl text-[10px] font-bold transition-all active:scale-90"
                style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', color: '#020408' }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center gap-0.5 min-w-[52px] rounded-xl px-2 py-1.5 text-[10px] font-medium transition-all active:scale-90"
              style={{
                color: active ? '#00e5cc' : '#4d7a90',
                background: active ? 'rgba(0,229,204,0.08)' : 'transparent',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

