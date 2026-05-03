'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Props {
  minAge: number;
  children: ReactNode;
}

export function AgeGate({ minAge, children }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [denied, setDenied] = useState(false);

  if (denied) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(12,26,31,0.85)', border: '1px solid rgba(255,60,172,0.2)' }}>
        <p className="text-4xl mb-3">🚫</p>
        <h3 className="text-lg font-black text-[#ff3cac] mb-2" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Access Restricted</h3>
        <p className="text-sm text-[#4d7a90]">You must be {minAge}+ years old to attend this event.</p>
      </div>
    );
  }

  if (confirmed) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(255,60,172,0.25)' }}
      >
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(255,60,172,0.1)', border: '1px solid rgba(255,60,172,0.3)' }}>
          <span className="text-2xl">🔞</span>
        </div>
        <h3 className="text-xl font-black text-[#e8f4f8] mb-2" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Age Verification</h3>
        <p className="text-sm text-[#4d7a90] mb-6 leading-relaxed">
          This event is restricted to guests who are <span className="text-[#ff3cac] font-semibold">{minAge} years of age or older</span>.
          <br />Please confirm your age to continue.
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={() => setDenied(true)}
          >
            I&apos;m under {minAge}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            onClick={() => setConfirmed(true)}
          >
            I&apos;m {minAge}+
          </Button>
        </div>
        <p className="text-xs text-[#2d5268] mt-4">
          By confirming you understand misrepresenting your age may result in refusal of entry.
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
