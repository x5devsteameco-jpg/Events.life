'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const COOKIE_KEY = 'gatewise_cookie_consent';

type ConsentState = 'accepted' | 'declined' | null;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY) as ConsentState | null;
    if (!stored) {
      // Delay showing to avoid flash on first paint
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
    setConsent(stored);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setConsent('accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setConsent('declined');
    setVisible(false);
  };

  if (consent !== null) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[100] max-w-lg mx-auto"
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
        >
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(8, 18, 22, 0.97)',
              border: '1px solid rgba(0,229,204,0.2)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,204,0.04)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(0,229,204,0.1)', border: '1px solid rgba(0,229,204,0.2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#e8f4f8] mb-1">We use cookies</p>
                <p className="text-xs text-[#4d7a90] leading-relaxed">
                  Gatewise uses essential cookies for authentication and performance analytics to improve your experience.
                  We don&apos;t use tracking cookies for advertising.
                  Read our{' '}
                  <Link href="/privacy" className="text-[#00e5cc] hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={accept}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-[#020408] transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
              >
                Accept
              </button>
              <button
                onClick={decline}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4d7a90] hover:text-[#e8f4f8] transition-colors"
                style={{ border: '1px solid rgba(0,229,204,0.1)' }}
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
