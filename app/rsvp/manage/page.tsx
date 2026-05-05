'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/logo';
import { QRCodeDisplay } from '@/components/events/qr-code-display';

type RSVPStatus = 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'PENDING';

interface RSVPData {
  rsvp: { id: string; guestName: string; status: RSVPStatus; createdAt: string; waitlistPosition?: number | null };
  event: { title: string; date: string; slug: string; location: string | null; isOnline: boolean };
}

const STATUS_CONFIG: Record<RSVPStatus, { label: string; color: string; bg: string; icon: string }> = {
  CONFIRMED: { label: 'Confirmed', color: '#00e5cc', bg: 'rgba(0,229,204,0.1)', icon: '✓' },
  WAITLISTED: { label: 'Waitlisted', color: '#9dd8ea', bg: 'rgba(157,216,234,0.1)', icon: '⏳' },
  CANCELLED: { label: 'Cancelled', color: '#ff3cac', bg: 'rgba(255,60,172,0.1)', icon: '✕' },
  PENDING: { label: 'Pending', color: '#4d7a90', bg: 'rgba(77,122,144,0.1)', icon: '…' },
};

export default function RSVPManagePage() {
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<RSVPData | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setData(null);
    setCancelled(false);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/rsvp/lookup?email=${encodeURIComponent(email)}&slug=${encodeURIComponent(slug)}`
      );
      const json = await res.json() as { data?: RSVPData; error?: string };
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please check your details and try again.');
      } else {
        setData(json.data ?? null);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!data) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/rsvp/lookup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, slug }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setError(json.error ?? 'Could not cancel RSVP. Please try again.');
      } else {
        setCancelled(true);
        setData((prev) => prev ? { ...prev, rsvp: { ...prev.rsvp, status: 'CANCELLED' } } : prev);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const eventDate = data ? new Date(data.event.date) : null;
  const isPast = eventDate ? eventDate < new Date() : false;
  const canCancel = data && data.rsvp.status !== 'CANCELLED' && !isPast && !cancelled;
  const statusCfg = data ? STATUS_CONFIG[data.rsvp.status] : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void, #020408)' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-30 px-6 h-16 flex items-center justify-between"
        style={{ background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,229,204,0.08)' }}
      >
        <Link href="/">
          <BrandLogo size="sm" textClassName="text-sm" />
        </Link>
        <Link href="/events" className="text-sm text-[#7aafc4] hover:text-[#00e5cc] transition-colors">
          Browse Events →
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)', color: '#00e5cc' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc]" />
              RSVP Self-Service
            </div>
            <h1
              className="text-3xl font-black text-[#e8f4f8] mb-3"
              style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)", letterSpacing: '0.04em' }}
            >
              Manage Your RSVP
            </h1>
            <p className="text-[#4d7a90] text-sm">
              Look up your registration status or cancel your spot.
            </p>
          </div>

          {/* Lookup form */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: 'rgba(12,26,31,0.8)', border: '1px solid rgba(0,229,204,0.12)' }}
          >
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#7aafc4] uppercase tracking-widest mb-1.5">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none focus:ring-2 focus:ring-[rgba(0,229,204,0.3)] transition-all"
                  style={{ background: 'rgba(2,4,8,0.8)', border: '1px solid rgba(0,229,204,0.2)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7aafc4] uppercase tracking-widest mb-1.5">
                  Event Slug / ID
                  <span className="ml-2 text-[#2d5268] normal-case font-normal">
                    (from the event URL, e.g. <code className="text-[#4d7a90]">summer-launch-2025</code>)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="event-slug-here"
                  className="w-full h-11 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none focus:ring-2 focus:ring-[rgba(0,229,204,0.3)] transition-all"
                  style={{ background: 'rgba(2,4,8,0.8)', border: '1px solid rgba(0,229,204,0.2)' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-bold text-[#020408] transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
              >
                {loading ? 'Looking up…' : 'Find My RSVP'}
              </button>
            </form>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl text-sm text-[#ff3cac]"
                  style={{ background: 'rgba(255,60,172,0.06)', border: '1px solid rgba(255,60,172,0.15)' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RSVP result */}
          <AnimatePresence>
            {data && statusCfg && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="mt-6 rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(0,229,204,0.12)', background: 'rgba(12,26,31,0.6)' }}
              >
                {/* Status badge row */}
                <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
                  <div>
                    <p className="text-xs text-[#4d7a90] mb-1">Registered as</p>
                    <p className="font-bold text-[#e8f4f8]">{data.rsvp.guestName}</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ color: statusCfg.color, background: statusCfg.bg }}
                  >
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                </div>

                {/* Event details */}
                <div className="p-5 space-y-2">
                  {data.rsvp.status === 'WAITLISTED' && data.rsvp.waitlistPosition != null && (
                    <div className="rounded-xl p-3 mb-2" style={{ background: 'rgba(157,216,234,0.06)', border: '1px solid rgba(157,216,234,0.15)' }}>
                      <p className="text-xs text-[#7aafc4] mb-0.5">Your position in the waitlist</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black" style={{ color: '#9dd8ea' }}>#{data.rsvp.waitlistPosition}</span>
                        <span className="text-xs text-[#4d7a90]">You&apos;ll be notified if a spot opens up.</span>
                      </div>
                    </div>
                  )}
                  <p className="font-semibold text-[#e8f4f8]">{data.event.title}</p>
                  <p className="text-sm text-[#4d7a90]">
                    {eventDate?.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {' '}at{' '}
                    {eventDate?.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {data.event.isOnline ? (
                    <p className="text-sm text-[#00e5cc]">🎥 Online Event</p>
                  ) : data.event.location ? (
                    <p className="text-sm text-[#4d7a90]">📍 {data.event.location}</p>
                  ) : null}
                </div>

                {/* QR Code for confirmed attendees */}
                {data.rsvp.status === 'CONFIRMED' && (
                  <div className="px-5 pb-5 flex justify-center">
                    <div className="text-center">
                      <p className="text-xs text-[#4d7a90] mb-3">Show this at the door</p>
                      <QRCodeDisplay value={`${typeof window !== 'undefined' ? window.location.origin : ''}/event/${data.event.slug}`} size={140} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 pb-5 space-y-3">
                  <Link
                    href={`/event/${data.event.slug}`}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-[#00e5cc] transition-all hover:bg-[rgba(0,229,204,0.06)]"
                    style={{ border: '1px solid rgba(0,229,204,0.2)' }}
                  >
                    View Event Page →
                  </Link>

                  {cancelled ? (
                    <div
                      className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-[#ff3cac]"
                      style={{ background: 'rgba(255,60,172,0.06)', border: '1px solid rgba(255,60,172,0.15)' }}
                    >
                      ✕ RSVP Cancelled
                    </div>
                  ) : canCancel ? (
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{ color: '#ff3cac', border: '1px solid rgba(255,60,172,0.2)', background: 'transparent' }}
                    >
                      {cancelling ? 'Cancelling…' : 'Cancel My RSVP'}
                    </button>
                  ) : isPast ? (
                    <p className="text-xs text-center text-[#2d5268]">This event has already passed.</p>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-xs text-center text-[#2d5268] mt-8">
            Need help?{' '}
            <a href="mailto:support@events.life" className="underline hover:text-[#4d7a90]">
              Contact support
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
