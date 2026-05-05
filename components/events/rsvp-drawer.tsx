'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { RSVPForm } from './rsvp-form';
import type { CustomQuestion } from '@/lib/types';

interface Props {
  eventId: string;
  title: string;
  eventDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventSlug?: string;
  requiresCertification: boolean;
  certificationNote: string;
  customQuestions: CustomQuestion[];
  isAccepting: boolean;
  isFull: boolean;
  confirmationMessage?: string;
  promoCodes?: { id: string; code: string; discountType: 'percent' | 'flat'; discountValue: string; usageLimit: string; unlimited: boolean }[];
}

export function RSVPDrawer({
  isAccepting,
  isFull,
  ...formProps
}: Props) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus close button on open
  useEffect(() => {
    if (open) setTimeout(() => closeButtonRef.current?.focus(), 80);
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key !== 'Tab') return;

    const sheet = sheetRef.current;
    if (!sheet) return;
    const focusable = sheet.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, [open]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isAccepting && !isFull) return null;

  return (
    <>
      {/* Sticky bottom bar – only visible on mobile (lg:hidden) */}
      <div
        className="fixed inset-x-0 z-[55] px-4 pt-4 lg:hidden"
        style={{
          bottom: 0,
          paddingBottom: 'max(calc(env(safe-area-inset-bottom) + 4.5rem), 5rem)',
          background: 'linear-gradient(to top, rgba(2,4,8,0.99) 60%, transparent)',
        }}
      >
        {isFull ? (
          <div className="w-full py-3 rounded-2xl text-center text-sm font-semibold text-[#ff3cac]" style={{ background: 'rgba(255,60,172,0.08)', border: '1px solid rgba(255,60,172,0.2)' }}>
            😔 Event is Full
          </div>
        ) : (
          <motion.button
            onClick={() => setOpen(true)}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl text-sm font-bold text-[#020408] min-h-[52px]"
            style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', boxShadow: '0 0 32px rgba(0,229,204,0.35)' }}
            aria-haspopup="dialog"
          >
            RSVP Now →
          </motion.button>
        )}
      </div>

      {/* Bottom-sheet drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[55] lg:hidden"
              style={{ background: 'rgba(2,4,8,0.7)', backdropFilter: 'blur(4px)' }}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={`RSVP for ${formProps.title}`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) setOpen(false);
              }}
              className="fixed bottom-0 inset-x-0 z-[60] lg:hidden rounded-t-3xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(8,18,24,0.98)',
                border: '1px solid rgba(0,229,204,0.15)',
                borderBottom: 'none',
                maxHeight: '92dvh',
              }}
            >
              {/* Drag handle — initiates drag */}
              <div
                className="flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,229,204,0.3)' }} aria-hidden="true" />
              </div>

              {/* Close row */}
              <div className="flex items-center justify-between px-6 py-2 flex-shrink-0">
                <p className="text-sm font-bold text-[#e8f4f8] truncate max-w-[70%]">RSVP for {formProps.title}</p>
                <button
                  ref={closeButtonRef}
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#4d7a90] hover:text-[#e8f4f8] transition-colors flex-shrink-0"
                  style={{ background: 'rgba(0,229,204,0.06)', minHeight: 44, minWidth: 44 }}
                  aria-label="Close RSVP drawer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-6 pb-8" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                <RSVPForm {...formProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
