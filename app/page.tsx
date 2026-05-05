'use client';

import React, { useRef, Suspense } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/brand/logo';
import { FrontierShowcase } from '@/components/marketing/frontier-showcase';
import { FeaturedEvents } from '@/components/marketing/featured-events';

const CINZEL = "var(--font-heading, 'Cinzel', Georgia, serif)";
const BEBAS = "var(--font-label, 'Bebas Neue', 'Arial Narrow', sans-serif)";

// Floating particle animation particles
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 2 + (i % 3),
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  delay: (i * 0.37) % 3.5,
  duration: 5 + (i % 4) * 1.5,
}));

function HeroParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.id % 3 === 0 ? '#00e5cc' : p.id % 3 === 1 ? '#9c6bff' : '#ff3cac',
            opacity: 0.35,
          }}
          animate={{
            y: [-12, 12, -12],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function AnimSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navLinks = [
    { href: '/events', label: 'Explore' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#for-hosts', label: 'For Hosts' },
  ];
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(2,4,8,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,229,204,0.1)',
        boxShadow: '0 1px 40px rgba(0,0,0,0.4)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <BrandLogo size="sm" textClassName="uppercase" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors" style={{ color: '#7aafc4', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 500 }}>{link.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-sm font-medium px-4 py-2 rounded-xl" style={{ color: '#7aafc4', border: '1px solid rgba(0,229,204,0.12)' }}>Sign In</Link>
          <Link href="/register" className="hidden md:block text-sm font-bold px-5 py-2.5 rounded-xl text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', boxShadow: '0 0 20px rgba(0,229,204,0.25)' }}>Get Started</Link>
          <button type="button" className="md:hidden p-2 rounded-xl" style={{ color: '#7aafc4', border: '1px solid rgba(0,229,204,0.12)' }} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="md:hidden overflow-hidden" style={{ borderTop: '1px solid rgba(0,229,204,0.08)' }}>
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium" style={{ color: '#7aafc4', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>{link.label}</Link>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2.5 text-center text-sm font-medium rounded-xl" style={{ border: '1px solid rgba(0,229,204,0.18)', color: '#7aafc4' }}>Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block py-2.5 text-center text-sm font-bold rounded-xl text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default function HomePage() {
  const features = [
    { icon: '\u26a1', title: 'Full Event Control', body: 'Draft, publish, pause or end events at any time. Set visibility, capacity, and attendee requirements exactly how you need.', accent: '#00e5cc' },
    { icon: '🔞', title: 'Age Gates Built-In', body: 'Set minimum age requirements (18, 19, 21+). Attendees verify before seeing event details. Fully compliance-ready.', accent: '#ff3cac' },
    { icon: '📋', title: 'RSVP & Lead Capture', body: 'Collect store name, brand, position, and certifications from every attendee. Export to CSV at any time.', accent: '#00e5cc' },
    { icon: '❓', title: 'Custom Questions', body: 'Add your own RSVP fields — text, dropdowns, or checkboxes. Perfect for dietary needs, product preferences, or compliance checks.', accent: '#00e5cc' },
    { icon: '📧', title: 'Email Blast Invites', body: 'Paste a list of emails and send personalized invites instantly. Track RSVPs directly from your dashboard.', accent: '#00e5cc' },
    { icon: '👥', title: 'Team Sharing', body: 'Invite team members to co-manage events with view or edit permissions. No extra seats to purchase.', accent: '#00e5cc' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Event', body: 'Use our 9-step wizard: set name, date, location, age gates, certification requirements, custom RSVP questions, FAQs, ticket tiers, and more.' },
    { num: '02', title: 'Invite & Share', body: 'Blast personalized email invites, share a public link, or keep it invite-only. Full visibility control — always.' },
    { num: '03', title: 'Manage & Grow', body: 'Confirm RSVPs, manage attendees, check compliance, export your lead list, and use real data to grow your brand.' },
  ];

  const visualShowcase = [
    {
      title: 'Immersive Landing Banners',
      body: 'Hero-grade visuals for launches, summits, and invite-only experiences.',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80',
    },
    {
      title: 'Branded Room Atmosphere',
      body: 'Give every event its own mood and energy before guests even RSVP.',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
    },
    {
      title: 'Editorial Product Moments',
      body: 'Highlight product tables, tasting stations, and spotlight activations.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    },
    {
      title: 'Night Programs & VIP',
      body: 'From private lounges to night sessions, your page can match the venue.',
      image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1400&q=80',
    },
  ];

  const industries = ['Cannabis Retail', 'Adult Beverage', 'Nightlife & Clubs', 'Trade Shows', 'Dispensary B2B', 'Brand Activation', 'Private Networking', 'Certification Events', 'Product Launches', 'VIP Experiences'];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#020408' }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[86vh] md:min-h-[90vh] flex items-center justify-center pt-20 md:pt-16 overflow-hidden">
        {/* Floating particles */}
        <HeroParticles />
        {/* Decorative orbs */}
        <div className="orb orb-teal" style={{ width: '700px', height: '700px', top: '-15%', left: '-12%', opacity: 0.55 }}
        />
        <div className="orb orb-teal" style={{ width: '500px', height: '500px', top: '30%', right: '-10%', opacity: 0.25 }}
        />
        <div className="orb orb-pink" style={{ width: '400px', height: '400px', bottom: '-5%', left: '40%', opacity: 0.5 }} />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.025 }} aria-hidden="true">
          <defs><pattern id="hero-grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M 64 0 L 0 0 0 64" fill="none" stroke="#00e5cc" strokeWidth="0.8" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10"
            style={{ background: 'rgba(0,229,204,0.06)', border: '1px solid rgba(0,229,204,0.22)', color: '#00e5cc', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: BEBAS }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc] animate-pulse" />
            Industry-Neutral · Compliance-Grade · Built for Canada 🍁
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <h1 style={{
              fontFamily: CINZEL,
              fontSize: 'clamp(3.2rem, 10vw, 7.5rem)',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: '0.03em',
              marginBottom: '0.12em',
              background: 'linear-gradient(135deg, #00b89e 0%, #00e5cc 60%, #00b89e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 5s ease infinite',
            }}>
              YOUR EVENTS.
            </h1>
            <h2 style={{
              fontFamily: CINZEL,
              fontSize: 'clamp(2.6rem, 7.5vw, 6rem)',
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '0.05em',
              color: '#e8f4f8',
                opacity: 0.92,
              marginBottom: '0.7em',
            }}>
              YOUR RULES.
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ color: '#7aafc4', fontSize: '1.12rem', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto 2.5rem' }}
          >
            The industry-neutral event platform for Canadian hosts. Age gates, RSVP collection, compliance workflows, and full data ownership — all free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold text-[#04181d]" style={{ background: 'linear-gradient(135deg, #00d1b3, #00f0d3)', padding: '14px 32px', borderRadius: '14px', fontSize: '1rem', boxShadow: '0 0 32px rgba(0,229,204,0.3), 0 8px 24px rgba(0,0,0,0.4)', minHeight: '52px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                Create Your First Event
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Link href="/events" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold" style={{ color: '#00e5cc', border: '1px solid rgba(0,229,204,0.45)', padding: '14px 32px', borderRadius: '14px', fontSize: '1rem', background: 'rgba(0,229,204,0.06)', minHeight: '52px' }}>
                Browse Events
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6"
            style={{ fontSize: '0.78rem', color: '#2d5268', letterSpacing: '0.04em' }}
          >
            {['Free to start', 'No credit card required', 'PIPEDA compliant', 'Canadian hosted'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                {item}
              </div>
            ))}
          </motion.div>
        </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: '#2d5268', textTransform: 'uppercase' }}>Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d5268" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 15l7 7 7-7"/></svg>
            </motion.div>
          </motion.div>
      </section>

      <FrontierShowcase />

      {/* ═══ STATS BAND ═══ */}
      <section style={{ borderTop: '1px solid rgba(0,229,204,0.1)', borderBottom: '1px solid rgba(0,229,204,0.1)', background: 'linear-gradient(180deg, rgba(6,13,16,0.96), rgba(10,20,28,0.98))' }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: '100%', label: 'Data Ownership', color: '#00e5cc' },
              { value: '9-Step', label: 'Event Wizard', color: '#00e5cc' },
              { value: 'Free', label: 'Forever to Start', color: '#00e5cc' },
              { value: '🍁', label: 'Canadian Built', color: '#ff3cac' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-5 rounded-[22px]" style={{ border: '1px solid rgba(0,229,204,0.1)', background: 'rgba(10,22,30,0.6)' }}>
                <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontFamily: CINZEL, fontWeight: 900, color: stat.color, lineHeight: 1.1, marginBottom: '6px' }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: '#4d7a90', fontFamily: BEBAS, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VISUAL SHOWCASE ═══ */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, rgba(6,13,16,0.88), rgba(2,4,8,0.98))', borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
        <div className="max-w-6xl mx-auto">
          <AnimSection className="text-center mb-12">
            <p style={{ fontFamily: BEBAS, fontSize: '0.88rem', letterSpacing: '0.2em', color: '#00e5cc', textTransform: 'uppercase', marginBottom: '12px' }}>Visual Direction</p>
            <h2 style={{ fontFamily: CINZEL, fontSize: 'clamp(1.9rem, 4.6vw, 3.4rem)', fontWeight: 800, color: '#e8f4f8', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: '14px' }}>
              Picture-First Event
              <span className="block" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Storytelling</span>
            </h2>
            <p style={{ color: '#7aafc4', maxWidth: '560px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.65 }}>
              Replace generic placeholders with cinematic visuals that feel closer to premium event platforms.
            </p>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {visualShowcase.map((item, i) => (
              <AnimSection key={item.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="relative overflow-hidden rounded-[24px] h-[260px] sm:h-[290px]"
                  style={{ border: '1px solid rgba(0,229,204,0.14)', boxShadow: '0 18px 50px rgba(0,0,0,0.45)' }}
                >
                  <div className="absolute inset-0" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,4,8,0.15), rgba(2,4,8,0.82) 68%, rgba(2,4,8,0.95))' }} />
                  <div className="absolute left-5 right-5 bottom-5">
                    <p style={{ fontSize: '0.68rem', letterSpacing: '0.14em', color: '#7aafc4', textTransform: 'uppercase', marginBottom: '8px' }}>Design Kit {String(i + 1).padStart(2, '0')}</p>
                    <h3 style={{ fontFamily: CINZEL, fontSize: '1.35rem', fontWeight: 800, color: '#e8f4f8', letterSpacing: '0.03em', lineHeight: 1.1, marginBottom: '8px' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.86rem', color: '#9fc5d3', lineHeight: 1.55, maxWidth: '90%' }}>{item.body}</p>
                  </div>
                </motion.div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="for-hosts" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimSection className="text-center mb-16">
            <p style={{ fontFamily: BEBAS, fontSize: '0.88rem', letterSpacing: '0.2em', color: '#00e5cc', textTransform: 'uppercase', marginBottom: '12px' }}>Platform Features</p>
            <h2 style={{ fontFamily: CINZEL, fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 800, color: '#e8f4f8', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: '16px' }}>
              Everything You Need.{' '}
              <span style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nothing You Don&apos;t.</span>
            </h2>
            <p style={{ color: '#7aafc4', maxWidth: '520px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.65 }}>
              Built from the ground up for hosts who need modern event tools and clear compliance controls.
            </p>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <AnimSection key={f.title} delay={i * 0.06}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
                  style={{ padding: '24px 26px', borderRadius: '22px', border: `1px solid ${f.accent}28`, background: 'linear-gradient(180deg, rgba(12,24,32,0.94), rgba(6,13,16,0.98))', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', height: '100%', display: 'flex', flexDirection: 'column' as const, gap: '12px' }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', background: `${f.accent}10`, border: `1px solid ${f.accent}24`, flexShrink: 0 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: CINZEL, fontSize: '1.05rem', fontWeight: 700, color: '#e8f4f8', letterSpacing: '0.04em' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#7aafc4', lineHeight: 1.6, flex: 1 }}>{f.body}</p>
                </motion.div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{ padding: '7rem 1.5rem', background: 'linear-gradient(180deg, rgba(4,10,14,0.95) 0%, rgba(2,4,8,0.98) 100%)', borderTop: '1px solid rgba(0,229,204,0.06)', borderBottom: '1px solid rgba(0,229,204,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <AnimSection className="text-center mb-16">
            <p style={{ fontFamily: BEBAS, fontSize: '0.88rem', letterSpacing: '0.2em', color: '#00e5cc', textTransform: 'uppercase', marginBottom: '12px' }}>How It Works</p>
            <h2 style={{ fontFamily: CINZEL, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#e8f4f8', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              Up and running in{' '}
              <span style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>minutes.</span>
            </h2>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <AnimSection key={step.num} delay={i * 0.12}>
                <div style={{ padding: '32px 28px', borderRadius: '28px', border: '1px solid rgba(0,229,204,0.14)', background: 'linear-gradient(180deg, rgba(10,22,30,0.96), rgba(5,12,18,0.98))', boxShadow: '0 16px 56px rgba(0,0,0,0.55)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '140px', height: '80px', background: 'radial-gradient(ellipse, rgba(0,229,204,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ width: 64, height: 64, borderRadius: '9999px', border: '1px solid rgba(0,229,204,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'rgba(0,229,204,0.05)' }}>
                    <span style={{ fontFamily: CINZEL, fontSize: '1.4rem', fontWeight: 700, color: '#00e5cc' }}>{step.num}</span>
                  </div>
                  <h3 style={{ fontFamily: CINZEL, fontSize: '1.15rem', fontWeight: 700, color: '#e8f4f8', letterSpacing: '0.04em', marginBottom: '12px' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#7aafc4', lineHeight: 1.65 }}>{step.body}</p>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INDUSTRIES ═══ */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div className="max-w-4xl mx-auto text-center">
          <AnimSection>
            <p style={{ fontFamily: BEBAS, fontSize: '0.88rem', letterSpacing: '0.2em', color: '#ff3cac', textTransform: 'uppercase', marginBottom: '12px' }}>Who It&apos;s For</p>
            <h2 style={{ fontFamily: CINZEL, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#e8f4f8', letterSpacing: '0.04em', lineHeight: 1.15, marginBottom: '28px' }}>
              Any Industry That Needs{' '}
              <span style={{ color: '#ff3cac' }}>Access Control.</span>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {industries.map((industry) => (
                <span key={industry} style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.84rem', fontWeight: 500, background: 'rgba(255,60,172,0.05)', border: '1px solid rgba(255,60,172,0.18)', color: '#c87a9e' }}>
                  {industry}
                </span>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ═══ FEATURED EVENTS ═══ */}
      <Suspense fallback={null}>
        <FeaturedEvents />
      </Suspense>

      {/* ═══ CATEGORY BROWSE GRID ═══ */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <AnimSection>
            <div className="text-center mb-10">
              <p style={{ fontFamily: BEBAS, fontSize: '0.88rem', letterSpacing: '0.2em', color: '#00e5cc', textTransform: 'uppercase', marginBottom: '10px' }}>Browse By Category</p>
              <h2 style={{ fontFamily: CINZEL, fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#e8f4f8', letterSpacing: '0.04em', lineHeight: 1.2 }}>
                Find Your Kind of Event
              </h2>
            </div>
          </AnimSection>
          <AnimSection delay={0.12}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { label: 'Networking', icon: '🤝', slug: 'NETWORKING' },
                { label: 'Product Demo', icon: '🎯', slug: 'PRODUCT_DEMO' },
                { label: 'Private Gathering', icon: '🔒', slug: 'PRIVATE_GATHERING' },
                { label: 'Industry Event', icon: '🏭', slug: 'INDUSTRY_EVENT' },
                { label: 'Trade Show', icon: '🏛️', slug: 'TRADE_SHOW' },
                { label: 'Tech & Innovation', icon: '💡', slug: 'TECH' },
                { label: 'Arts & Culture', icon: '🎨', slug: 'ARTS' },
                { label: 'VIP Experience', icon: '⭐', slug: 'VIP' },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/events?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200 hover:scale-[1.03]"
                  style={{
                    background: 'rgba(10,22,28,0.7)',
                    border: '1px solid rgba(0,229,204,0.1)',
                    textDecoration: 'none',
                  }}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                  <span className="text-sm font-semibold text-center leading-tight" style={{ color: '#a8c8d8', fontFamily: 'Space Grotesk, sans-serif' }}>{cat.label}</span>
                </Link>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: '7rem 1.5rem' }}>
        <AnimSection>
          <div className="max-w-4xl mx-auto text-center relative overflow-hidden" style={{ padding: '4rem 3rem', borderRadius: '32px', border: '1px solid rgba(0,229,204,0.22)', background: 'linear-gradient(180deg, rgba(10,24,32,0.96), rgba(5,12,18,0.98))', boxShadow: '0 28px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(0,229,204,0.1) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(20px)' }} />
            <p style={{ fontFamily: BEBAS, fontSize: '0.88rem', letterSpacing: '0.2em', color: '#00e5cc', textTransform: 'uppercase', marginBottom: '16px' }}>Get Started Today</p>
            <h2 style={{ fontFamily: CINZEL, fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 900, color: '#e8f4f8', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: '16px' }}>
              Ready to Take Control?
            </h2>
            <p style={{ color: '#7aafc4', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
              Join hosts across Canada running professional events with stronger compliance and full data ownership.
            </p>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 font-bold text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', padding: '16px 40px', borderRadius: '14px', fontSize: '1.05rem', boxShadow: '0 0 40px rgba(0,229,204,0.3), 0 8px 32px rgba(0,0,0,0.5)' }}>
              Start for Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </AnimSection>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: '1px solid rgba(0,229,204,0.08)', padding: '3rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div style={{ marginBottom: '8px' }}>
                <BrandLogo size="sm" textClassName="uppercase tracking-[0.1em] text-[0.88rem]" />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#2d5268' }}>Your events. Your data. Your rules.</p>
              <p style={{ fontSize: '0.75rem', color: '#2d5268', marginTop: '2px' }}>Built in Canada 🍁</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.875rem', color: '#4d7a90' }}>
              {[{ href: '/events', label: 'Browse Events' }, { href: '/register', label: 'Create Account' }, { href: '/login', label: 'Sign In' }, { href: '/dashboard', label: 'Dashboard' }].map((link) => (
                <Link key={link.href} href={link.href} style={{ color: '#4d7a90' }}>{link.label}</Link>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' as const, gap: '6px', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#2d5268' }} className="sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Gatewise Events. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/privacy" style={{ color: '#2d5268' }}>Privacy</Link>
              <Link href="/terms" style={{ color: '#2d5268' }}>Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
