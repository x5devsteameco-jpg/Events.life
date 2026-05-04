'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    href: '/events',
    label: 'Explore',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/events/new',
    label: 'Create',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
    accent: true,
  },
  {
    href: '/dashboard/saved',
    label: 'Saved',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden flex items-center justify-around px-2 pb-safe-area"
      style={{
        background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,229,204,0.1)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        paddingTop: '8px',
      }}
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/events' && pathname.startsWith(item.href));
        if (item.accent) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all active:scale-90"
              style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', color: '#020408' }}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all active:scale-90"
            style={{ color: isActive ? '#00e5cc' : '#4d7a90' }}
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-[9px] font-medium">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-1.5 w-1 h-1 rounded-full" style={{ background: '#00e5cc' }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
