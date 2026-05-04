'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FollowOrganizerButtonProps {
  organizerId: string;
  initialFollowing: boolean;
  initialCount: number;
}

export function FollowOrganizerButton({ organizerId, initialFollowing, initialCount }: FollowOrganizerButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const method = following ? 'DELETE' : 'POST';
      try {
        const res = await fetch(`/api/organizers/${organizerId}/follow`, { method });
        if (res.ok) {
          setFollowing(!following);
          setCount((c) => following ? c - 1 : c + 1);
        } else if (res.status === 401) {
          window.location.href = '/login';
        }
      } catch { /* noop */ }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={toggle}
        disabled={pending}
        whileTap={{ scale: 0.9 }}
        aria-label={following ? 'Unfollow organizer' : 'Follow organizer'}
        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
          following
            ? 'bg-[#00e5cc]/15 text-[#00e5cc] border border-[#00e5cc]/35 hover:bg-[#ff3cac]/10 hover:text-[#ff3cac] hover:border-[#ff3cac]/30'
            : 'bg-[#00e5cc] text-[#020408] hover:bg-[#00c4ae]'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={following ? 'following' : 'follow'}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="block"
          >
            {following ? 'Following' : 'Follow'}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      {count > 0 && (
        <span className="text-xs text-[#4d7a90]">
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              {count.toLocaleString()}
            </motion.span>
          </AnimatePresence>
          {' '}follower{count !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
