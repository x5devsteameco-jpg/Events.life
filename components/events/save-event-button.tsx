'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveEventButtonProps {
  eventId: string;
  initialSaved: boolean;
  size?: 'sm' | 'md';
}

export function SaveEventButton({ eventId, initialSaved, size = 'md' }: SaveEventButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const method = saved ? 'DELETE' : 'POST';
      try {
        const res = await fetch(`/api/events/${eventId}/save`, { method });
        if (res.ok) setSaved(!saved);
        else if (res.status === 401) window.location.href = '/login';
      } catch { /* noop */ }
    });
  };

  const isSmall = size === 'sm';

  return (
    <motion.button
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? 'Unsave event' : 'Save event'}
      whileTap={{ scale: 0.85 }}
      className={`relative flex items-center gap-1.5 rounded-full font-semibold transition-all ${
        isSmall ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
      } ${
        saved
          ? 'bg-[#00e5cc]/15 text-[#00e5cc] border border-[#00e5cc]/30'
          : 'bg-white/5 text-[#7db3c4] border border-white/10 hover:border-[#00e5cc]/20 hover:text-[#00e5cc]'
      }`}
      style={{ minWidth: isSmall ? 80 : 100 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={saved ? 'saved' : 'unsaved'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-1.5"
        >
          <svg
            width={isSmall ? 13 : 15}
            height={isSmall ? 13 : 15}
            viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          {saved ? 'Saved' : 'Save'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
