'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const COOKIE_KEY = 'gw_cookie_consent';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
    } catch { /* noop - SSR or privacy mode */ }
  }, []);

  const accept = () => {
    try { localStorage.setItem(COOKIE_KEY, 'accepted'); } catch { /* noop */ }
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem(COOKIE_KEY, 'declined'); } catch { /* noop */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 z-50 max-w-lg mx-auto"
          role="dialog"
          aria-label="Cookie consent"
          aria-modal="false"
        >
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{
              background: 'rgba(12, 26, 31, 0.97)',
              border: '1px solid rgba(0,229,204,0.18)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#c4dde6] leading-relaxed">
                  We use essential cookies to keep you signed in and to improve your experience. By continuing you agree to our{' '}
                  <Link href="/privacy" className="text-[#00e5cc] underline underline-offset-2 hover:text-[#00c4ae] transition-colors">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={decline}
                className="px-4 py-2 rounded-lg text-sm text-[#4d7a90] hover:text-[#7db3c4] transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="px-5 py-2 rounded-lg text-sm font-bold text-[#020408] transition-colors"
                style={{ background: '#00e5cc' }}
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
