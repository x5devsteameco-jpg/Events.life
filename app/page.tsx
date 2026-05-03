'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';

function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="absolute rounded-full pointer-events-none" style={style} />;
}

function AnimSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navLinks = [{ href: '/events', label: 'Explore' }, { href: '#how-it-works', label: 'How It Works' }, { href: '#for-hosts', label: 'For Hosts' }];
  return (
    <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(2,4,8,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#020408" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <span className="text-lg font-bold gradient-text-static" style={{ fontFamily: 'var(--font-display)' }}>Gatewise Events</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-[#7aafc4] hover:text-[#00e5cc] transition-colors">{link.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-[#7aafc4] hover:text-[#00e5cc] transition-colors px-4 py-2 rounded-lg hover:bg-[rgba(0,229,204,0.06)]">Sign In</Link>
          <Link href="/register" className="hidden sm:block text-sm font-bold px-4 py-2 rounded-lg transition-all text-[#020408] hover:shadow-[0_0_20px_rgba(0,229,204,0.4)] hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>Get Started</Link>
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-[#7aafc4] hover:text-[#00e5cc] hover:bg-[rgba(0,229,204,0.08)] transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid rgba(0,229,204,0.06)' }}
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium text-[#7aafc4] hover:text-[#00e5cc] transition-colors">{link.label}</Link>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2.5 text-center text-sm font-medium text-[#7aafc4] rounded-lg" style={{ border: '1px solid rgba(0,229,204,0.15)' }}>Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block py-2.5 text-center text-sm font-bold rounded-lg text-[#020408]" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function FeatureCard({ icon, title, description, accent = 'teal' }: { icon: string; title: string; description: string; accent?: 'teal' | 'green' | 'pink' }) {
  const accentColor = accent === 'teal' ? '#00e5cc' : accent === 'green' ? '#7fff00' : '#ff3cac';
  const accentBg = accent === 'teal' ? 'rgba(0,229,204,0.08)' : accent === 'green' ? 'rgba(127,255,0,0.08)' : 'rgba(255,60,172,0.08)';
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }} className="relative rounded-2xl p-6" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)', backdropFilter: 'blur(12px)' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: accentBg, border: `1px solid ${accentColor}25` }}>{icon}</div>
      <h3 className="text-lg font-bold text-[#e8f4f8] mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      <p className="text-sm text-[#7aafc4] leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative flex flex-col items-center text-center p-8 rounded-2xl" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.1)' }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)', color: '#020408', fontFamily: 'var(--font-display)' }}>{number}</div>
      <h3 className="text-xl font-bold text-[#e8f4f8] mb-3" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      <p className="text-sm text-[#7aafc4] leading-relaxed">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020408] overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(0,229,204,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(127,255,0,0.05) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, rgba(255,60,172,0.03) 0%, transparent 70%)' }} />
          {[
            { width: 4, height: 4, top: '15%', left: '10%', background: '#00e5cc', opacity: 0.4, animation: 'float 6s ease-in-out infinite' },
            { width: 6, height: 6, top: '25%', right: '15%', background: '#7fff00', opacity: 0.3, animation: 'float 8s ease-in-out infinite 1s' },
            { width: 3, height: 3, bottom: '30%', left: '20%', background: '#ff3cac', opacity: 0.4, animation: 'float 7s ease-in-out infinite 2s' },
            { width: 5, height: 5, top: '60%', right: '10%', background: '#00e5cc', opacity: 0.3, animation: 'float 9s ease-in-out infinite 0.5s' },
            { width: 8, height: 8, top: '40%', left: '5%', background: '#7fff00', opacity: 0.15, animation: 'float 11s ease-in-out infinite 3s' },
            { width: 4, height: 4, bottom: '20%', right: '25%', background: '#00e5cc', opacity: 0.35, animation: 'float 7s ease-in-out infinite 1.5s' },
          ].map((p, i) => <Particle key={i} style={p as React.CSSProperties} />)}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" aria-hidden="true">
            <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00e5cc" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)', color: '#00e5cc' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc] animate-pulse" />
            Built for all Canadian industries 🍁
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Your Events.{' '}
            <span className="gradient-text block">Your Rules.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl text-[#7aafc4] mb-10 max-w-2xl mx-auto leading-relaxed">
            Industry-neutral by design. Full control over events, RSVPs, and attendee data, with optional age gates and certification checks where required.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-[#020408] transition-all hover:shadow-[0_0_32px_rgba(0,229,204,0.4)] hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              Create Your First Event
            </Link>
            <Link href="/events" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-[#00e5cc] transition-all hover:shadow-[0_0_20px_rgba(0,229,204,0.2)]" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)' }}>
              Browse Events
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-[#2d5268]">
            {['Free to start', 'No credit card required', 'PIPEDA compliant', 'Canadian hosted'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-12 px-6" style={{ background: 'rgba(6,13,16,0.7)', borderTop: '1px solid rgba(0,229,204,0.06)', borderBottom: '1px solid rgba(0,229,204,0.06)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '100%', label: 'Data Ownership', color: '#00e5cc' },
              { value: '9-Step', label: 'Event Wizard', color: '#7fff00' },
              { value: 'Free', label: 'To Start', color: '#00e5cc' },
              { value: '🍁', label: 'Canadian Built', color: '#ff3cac' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-black mb-1" style={{ color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                <div className="text-xs text-[#4d7a90] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="for-hosts" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimSection className="text-center mb-16">
            <span className="text-xs font-semibold text-[#00e5cc] uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Everything you need.{' '}
              <span className="gradient-text-static">Nothing you don&apos;t.</span>
            </h2>
            <p className="text-[#7aafc4] max-w-xl mx-auto">Built from the ground up for hosts who need modern event tools and clear compliance controls.</p>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🎛️', title: 'Full Event Control', description: 'Draft, publish, pause, or end events at any time. Set visibility to public or private. Full ownership of your event data.', accent: 'teal' as const },
              { icon: '🔞', title: 'Age Gate Built-In', description: 'Set minimum age requirements (18, 19, 21+). Attendees verify before seeing event details. No third-party integrations needed.', accent: 'pink' as const },
              { icon: '📋', title: 'RSVP + Lead Collection', description: 'Collect store name, brand, position, and certification status from every attendee. Export to CSV anytime.', accent: 'green' as const },
              { icon: '❓', title: 'Custom Questions', description: 'Add your own RSVP questions — text inputs, dropdowns, or checkboxes. Perfect for dietary needs, product preferences, or compliance.', accent: 'teal' as const },
              { icon: '📧', title: 'Email Invites', description: 'Paste a list of emails and blast personalized invites instantly. Track who has RSVP\'d directly from your dashboard.', accent: 'teal' as const },
              { icon: '👥', title: 'Share with Team', description: 'Invite team members to co-manage events with view or edit permissions. No extra seats to purchase.', accent: 'green' as const },
            ].map((f, i) => (
              <AnimSection key={f.title} delay={i * 0.05}>
                <FeatureCard {...f} />
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: 'rgba(6,13,16,0.5)' }}>
        <div className="max-w-5xl mx-auto">
          <AnimSection className="text-center mb-16">
            <span className="text-xs font-semibold text-[#7fff00] uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3" style={{ fontFamily: 'var(--font-display)' }}>
              Up and running in <span className="gradient-text-green">minutes.</span>
            </h2>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { number: '1', title: 'Create & Customize', description: 'Use our 9-step wizard to build your event. Set age gates, certification requirements, custom RSVP questions, FAQs, and more.' },
              { number: '2', title: 'Invite & Share', description: 'Blast email invites to your list, share a public link, or keep it private. You control who can see and RSVP.' },
              { number: '3', title: 'Collect & Grow', description: 'Manage attendees, confirm RSVPs, export your leads, and use the data to grow your brand and community.' },
            ].map((step, i) => (
              <AnimSection key={step.number} delay={i * 0.1}>
                <StepCard {...step} />
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimSection>
            <span className="text-xs font-semibold text-[#ff3cac] uppercase tracking-widest">Industry Neutral</span>
            <h2 className="text-3xl font-black mt-3 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Built for any industry that needs <span style={{ color: '#ff3cac' }}>access control.</span>
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Cannabis Retail', 'Adult Beverage', 'Nightlife & Clubs', 'Trade Shows', 'Dispensary B2B', 'Brand Activation', 'Private Networking', 'Certification Events'].map((industry) => (
                <span key={industry} className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(255,60,172,0.06)', border: '1px solid rgba(255,60,172,0.15)', color: '#c87a9e' }}>
                  {industry}
                </span>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <AnimSection>
          <div className="max-w-4xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,229,204,0.08) 0%, rgba(127,255,0,0.05) 100%)', border: '1px solid rgba(0,229,204,0.2)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,204,0.1) 0%, transparent 70%)' }} />
            <h2 className="text-4xl md:text-5xl font-black mb-4 relative" style={{ fontFamily: 'var(--font-display)' }}>Ready to take control?</h2>
              <p className="text-[#7aafc4] text-lg mb-8 max-w-xl mx-auto relative">Join hosts across Canada running professional events with stronger compliance and ownership.</p>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-[#020408] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(0,229,204,0.4)] relative" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </AnimSection>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid rgba(0,229,204,0.08)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#020408" strokeWidth="2.5" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <span className="font-bold gradient-text-static" style={{ fontFamily: 'var(--font-display)' }}>Gatewise Events</span>
              </div>
              <p className="text-xs text-[#2d5268]">Your events. Your data. Your rules.</p>
              <p className="text-xs text-[#2d5268] mt-1">Built in Canada 🍁</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[#4d7a90]">
              {[{ href: '/events', label: 'Browse Events' }, { href: '/register', label: 'Create Account' }, { href: '/login', label: 'Sign In' }, { href: '/dashboard', label: 'Dashboard' }].map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-[#00e5cc] transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#2d5268]" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p>© {new Date().getFullYear()} Gatewise Events. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-[#00e5cc] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#00e5cc] transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
