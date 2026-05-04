'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EventCountdownTimerProps {
  eventDate: string;
  accent?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export function EventCountdownTimer({ eventDate, accent = '#00e5cc' }: EventCountdownTimerProps) {
  const target = new Date(eventDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate]);

  if (!timeLeft) return null;

  const units = [
    { label: 'Days',    value: timeLeft.days    },
    { label: 'Hours',   value: timeLeft.hours   },
    { label: 'Min',     value: timeLeft.minutes },
    { label: 'Sec',     value: timeLeft.seconds },
  ];

  return (
    <div
      className="rounded-xl p-4 flex items-center justify-center gap-3 flex-wrap"
      style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}
      aria-label="Countdown to event"
    >
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex flex-col items-center min-w-[44px]">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${label}-${value}`}
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-2xl font-black tabular-nums"
                style={{ color: accent, fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}
              >
                {pad(value)}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] text-[#4d7a90] uppercase tracking-widest mt-0.5">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-xl font-black mb-3" style={{ color: `${accent}50` }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}
