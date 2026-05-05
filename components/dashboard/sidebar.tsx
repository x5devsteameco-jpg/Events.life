'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand/logo';
import { AvatarCharacter, DEFAULT_AVATAR_CONFIG, type AvatarConfig } from '@/components/ui/avatar-character';

interface SidebarProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    avatarConfig?: string | null;
  };
}

const adminNavItem = {
  href: '/admin/dashboard',
  label: 'Admin Portal',
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  accent: false,
  admin: true,
};

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/dashboard/events',
    label: 'My Events',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/events/new',
    label: 'Create Event',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    accent: true,
  },
  {
    href: '/dashboard/attendees',
    label: 'Attendees',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/saved',
    label: 'Saved Events',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function Sidebar({ user, isAdmin = false }: SidebarProps & { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex-shrink-0 flex flex-col h-full relative overflow-hidden"
      style={{ borderRight: '1px solid rgba(0,229,204,0.08)', background: 'rgba(6,13,16,0.9)' }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,229,204,0.06)' }}>
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <BrandLogo size="sm" showText={false} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-black text-sm gradient-text-static whitespace-nowrap"
                style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)", letterSpacing: '0.06em', fontSize: '0.82rem' }}
              >
                Gatewise Events
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'ml-auto p-1.5 rounded-lg text-[#2d5268] hover:text-[var(--accent)] hover:bg-[var(--accent-glass)] transition-colors flex-shrink-0',
            collapsed && 'mx-auto ml-0 mt-0'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group',
                active
                  ? 'text-[var(--accent)] bg-[var(--accent-glass)]'
                  : item.accent
                  ? 'text-[var(--accent)] hover:bg-[var(--accent-glass)]'
                  : 'text-[#4d7a90] hover:text-[#e8f4f8] hover:bg-[var(--accent-glass)]'
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active left border */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--accent)]"
                />
              )}
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

        {/* Admin link */}
        {isAdmin && (
          <div className="px-2 pb-2 flex-shrink-0">
            <Link
              href="/admin/dashboard"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                pathname.startsWith('/admin')
                  ? 'text-[#ff3cac] bg-[rgba(255,60,172,0.1)]'
                  : 'text-[#7a3560] hover:text-[#ff3cac] hover:bg-[rgba(255,60,172,0.06)]'
              )}
              title={collapsed ? 'Admin Portal' : undefined}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="whitespace-nowrap">
                    Admin Portal
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        )}

      {/* User section */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,229,204,0.06)' }}>
        <div className={cn('flex items-center gap-3 p-2 rounded-xl', collapsed && 'justify-center')}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="Profile" className="w-8 h-8 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden" style={{ background: 'rgba(0,229,204,0.06)' }}>
              <AvatarCharacter
                config={user.avatarConfig ? (JSON.parse(user.avatarConfig) as Partial<AvatarConfig>) : DEFAULT_AVATAR_CONFIG}
                size={32}
              />
            </div>
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-xs font-semibold text-[#e8f4f8] truncate">{user.name || 'User'}</p>
                <p className="text-[10px] text-[#2d5268] truncate">{user.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-1.5 rounded-lg text-[#2d5268] hover:text-[#ff3cac] hover:bg-[rgba(255,60,172,0.06)] transition-colors flex-shrink-0"
              aria-label="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
