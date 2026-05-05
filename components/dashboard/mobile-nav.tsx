'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { BrandLogo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  user: { name: string | null; email: string; image: string | null };
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', emoji: '🏠' },
  { href: '/dashboard/events', label: 'My Events', emoji: '📅' },
  { href: '/events/new', label: 'Create Event', emoji: '✨', accent: true },
  { href: '/dashboard/attendees', label: 'Attendees', emoji: '👥' },
  { href: '/dashboard/saved', label: 'Saved Events', emoji: '🔖' },
  { href: '/dashboard/settings', label: 'Settings', emoji: '⚙️' },
];

export function MobileNav({ user, isAdmin: _isAdmin = false }: MobileNavProps & { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="lg:hidden flex items-center justify-between px-4 h-14 flex-shrink-0 sticky top-0 z-40"
        style={{ background: 'rgba(6,13,16,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,229,204,0.08)' }}
      >
        <Link href="/dashboard">
          <BrandLogo size="sm" textClassName="text-sm" />
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl"
          style={{ background: 'rgba(0,229,204,0.06)', border: '1px solid rgba(0,229,204,0.12)' }}
          aria-label="Open navigation menu"
          aria-expanded={open}
        >
          <span className="w-4.5 h-px bg-[#e8f4f8] rounded-full w-[18px]" />
          <span className="w-3 h-px bg-[#4d7a90] rounded-full w-[14px]" />
          <span className="w-4.5 h-px bg-[#e8f4f8] rounded-full w-[18px]" />
        </button>
      </header>

      {/* Full-screen mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 lg:hidden"
              style={{ background: 'rgba(2,4,8,0.8)', backdropFilter: 'blur(8px)' }}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 lg:hidden flex flex-col"
              style={{ background: 'rgba(6,13,16,0.98)', borderRight: '1px solid rgba(0,229,204,0.1)', paddingTop: 'env(safe-area-inset-top)' }}
              aria-label="Main navigation"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 h-14 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,229,204,0.06)' }}>
                <BrandLogo size="sm" textClassName="text-sm" />
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4d7a90] hover:text-[#e8f4f8] transition-colors"
                  aria-label="Close menu"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all min-h-[52px]',
                        active
                          ? 'text-[#00e5cc] bg-[rgba(0,229,204,0.1)]'
                          : item.accent
                          ? 'text-[#020408] font-bold'
                          : 'text-[#7aafc4] hover:text-[#e8f4f8] hover:bg-[rgba(0,229,204,0.04)]'
                      )}
                      style={item.accent ? { background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' } : undefined}
                    >
                      <span className="text-lg" aria-hidden="true">{item.emoji}</span>
                      {item.label}
                      {active && !item.accent && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00e5cc]" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* User + sign out */}
              <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,229,204,0.06)', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,229,204,0.04)' }}>
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#020408] flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
                      {(user.name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#e8f4f8] truncate">{user.name || 'User'}</p>
                    <p className="text-[10px] text-[#2d5268] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="p-2 rounded-lg text-[#2d5268] hover:text-[#ff3cac] hover:bg-[rgba(255,60,172,0.06)] transition-colors flex-shrink-0"
                    aria-label="Sign out"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar — thumb-reachable sticky nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
        style={{
          background: 'rgba(6,13,16,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,229,204,0.1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label="Bottom navigation"
      >
        {[
          { href: '/dashboard', label: 'Home', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          )},
          { href: '/dashboard/events', label: 'Events', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          )},
          { href: '/events/new', label: 'Create', accent: true, icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          )},
          { href: '/dashboard/analytics', label: 'Analytics', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          )},
          { href: '/dashboard/settings', label: 'Profile', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )},
        ].map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors relative"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {item.accent ? (
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#020408]"
                  style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', boxShadow: '0 0 16px rgba(0,229,204,0.4)' }}
                >
                  {item.icon}
                </span>
              ) : (
                <span className={cn('transition-colors', active ? 'text-[#00e5cc]' : 'text-[#2d5268]')}>
                  {item.icon}
                </span>
              )}
              {!item.accent && (
                <span className={cn('text-[10px] font-medium transition-colors', active ? 'text-[#00e5cc]' : 'text-[#2d5268]')}>
                  {item.label}
                </span>
              )}
              {active && !item.accent && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#00e5cc]" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
