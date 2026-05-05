'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const SHORTCUTS = [
  { keys: ['G', 'H'], label: 'Go to Dashboard', path: '/dashboard' },
  { keys: ['G', 'E'], label: 'Go to My Events', path: '/dashboard/events' },
  { keys: ['G', 'A'], label: 'Go to Analytics', path: '/dashboard/analytics' },
  { keys: ['G', 'S'], label: 'Go to Settings', path: '/dashboard/settings' },
  { keys: ['N'], label: 'Create New Event', path: '/events/new' },
  { keys: ['?'], label: 'Show shortcuts', path: null },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea/select
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.target as HTMLElement).isContentEditable) return;

      const key = e.key.toUpperCase();

      if (key === '?') {
        setShowHelp((v) => !v);
        return;
      }

      if (key === 'ESCAPE') {
        setShowHelp(false);
        setSequence([]);
        return;
      }

      const next = [...sequence, key];
      setSequence(next);

      clearTimeout(timer);
      timer = setTimeout(() => setSequence([]), 1500);

      // Check single-key shortcuts
      const singleMatch = SHORTCUTS.find((s) => s.keys.length === 1 && s.keys[0] === key && s.path);
      if (singleMatch) {
        router.push(singleMatch.path!);
        setSequence([]);
        return;
      }

      // Check 2-key sequences
      if (next.length === 2) {
        const match = SHORTCUTS.find((s) => s.keys.length === 2 && s.keys[0] === next[0] && s.keys[1] === next[1] && s.path);
        if (match) {
          router.push(match.path!);
          setSequence([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [sequence, router]);

  return (
    <>
      {/* Help modal */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(2,4,8,0.8)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowHelp(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 rounded-2xl"
              style={{ background: 'rgba(8,18,22,0.98)', border: '1px solid rgba(0,229,204,0.15)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}
              role="dialog"
              aria-label="Keyboard shortcuts"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-[#e8f4f8] uppercase tracking-wider">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1.5 rounded-lg text-[#4d7a90] hover:text-[#e8f4f8] transition-colors"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {SHORTCUTS.map((s) => (
                  <div key={s.keys.join('+')} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-[#7aafc4]">{s.label}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i}>
                          <kbd
                            className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md text-[11px] font-bold"
                            style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)', color: '#00e5cc', fontFamily: 'monospace' }}
                          >
                            {k}
                          </kbd>
                          {i < s.keys.length - 1 && <span className="text-[10px] text-[#2d5268] mx-0.5">then</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#2d5268] mt-4">Press <kbd className="text-[#4d7a90]">?</kbd> to toggle, <kbd className="text-[#4d7a90]">Esc</kbd> to close</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating hint */}
      <div className="fixed bottom-20 right-4 lg:bottom-4 z-30 hidden lg:flex items-center gap-1.5">
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all hover:opacity-80"
          style={{ background: 'rgba(12,26,31,0.8)', border: '1px solid rgba(0,229,204,0.12)', color: '#2d5268', backdropFilter: 'blur(8px)' }}
          aria-label="Show keyboard shortcuts"
        >
          <kbd className="font-mono">?</kbd>
          <span>shortcuts</span>
        </button>
      </div>
    </>
  );
}
