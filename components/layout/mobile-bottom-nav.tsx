'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const publicItems = [
  { href: '/', label: 'Home', icon: '◌' },
  { href: '/events', label: 'Browse', icon: '◍' },
  { href: '/register', label: 'Start', icon: '◎' },
];

const authItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◌' },
  { href: '/events', label: 'Browse', icon: '◍' },
  { href: '/events/new', label: 'Create', icon: '◎' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '◈' },
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
              <span className="text-base leading-none" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
