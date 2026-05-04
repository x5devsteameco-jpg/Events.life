'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const COOKIE_KEY = 'gw_cookie_consent';

interface ConsentPrefs { necessary: boolean; analytics: boolean; marketing: boolean }

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPrefs>({ necessary: true, analytics: true, marketing: false });

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
    } catch { /* noop - SSR or privacy mode */ }
  }, []);

  const save = (p: ConsentPrefs) => {
    try { localStorage.setItem(COOKIE_KEY, JSON.stringify(p)); } catch { /* noop */ }
    setVisible(false);
  };

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });
  const declineAll = () => save({ necessary: true, analytics: false, marketing: false });
  const saveCustom = () => save(prefs);

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
                  We use cookies to keep you signed in and improve your experience. See our{' '}
                  <Link href="/privacy" className="text-[#00e5cc] underline underline-offset-2 hover:text-[#00c4ae] transition-colors">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            {/* Granular preferences */}
            <AnimatePresence>
              {showManage && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-1 pb-2 border-t border-[rgba(0,229,204,0.08)]">
                    {[
                      { key: 'necessary' as const, label: 'Necessary', desc: 'Required for authentication and security', locked: true },
                      { key: 'analytics' as const, label: 'Analytics', desc: 'Help us improve the product (anonymous)', locked: false },
                      { key: 'marketing' as const, label: 'Marketing', desc: 'Personalised content and ads', locked: false },
                    ].map(({ key, label, desc, locked }) => (
                      <div key={key} className="flex items-start justify-between gap-3 py-1.5">
                        <div>
                          <p className="text-xs font-semibold text-[#e8f4f8]">{label}</p>
                          <p className="text-xs text-[#4d7a90] mt-0.5">{desc}</p>
                        </div>
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => !locked && setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                          className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${prefs[key] ? 'bg-[#00e5cc]' : 'bg-[rgba(255,255,255,0.1)]'} ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          aria-pressed={prefs[key]}
                          aria-label={`Toggle ${label} cookies`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${prefs[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2 justify-between items-center">
              <button
                onClick={() => setShowManage((s) => !s)}
                className="text-xs text-[#4d7a90] hover:text-[#7db3c4] transition-colors underline"
              >
                {showManage ? 'Hide options' : 'Manage preferences'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={declineAll}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#4d7a90] hover:text-[#7db3c4] transition-colors border border-[rgba(0,229,204,0.1)] hover:border-[rgba(0,229,204,0.2)]"
                >
                  Decline all
                </button>
                {showManage && (
                  <button
                    onClick={saveCustom}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#020408] transition-colors"
                    style={{ background: 'rgba(0,229,204,0.7)' }}
                  >
                    Save
                  </button>
                )}
                <button
                  onClick={acceptAll}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#020408] transition-colors"
                  style={{ background: '#00e5cc' }}
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
