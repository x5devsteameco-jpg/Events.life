'use client';

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Stat {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
}

function CountUp({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(motionVal, value, { duration: 0.85, ease: [0.4, 0, 0.2, 1] });
    return ctrl.stop;
  }, [inView, motionVal, value]);

  useEffect(() => {
    return rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
  }, [rounded]);

  return (
    <span
      ref={ref}
      className="text-2xl font-black leading-none"
      style={{ fontFamily: 'var(--font-display)', color }}
    >
      0
    </span>
  );
}

export function AnimatedStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
          whileHover={{ y: -3, boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${stat.color}28` }}
          className="rounded-2xl p-5 relative overflow-hidden cursor-default"
          style={{
            background: 'rgba(12,26,31,0.6)',
            border: '1px solid rgba(0,229,204,0.08)',
            transition: 'border-color 0.2s ease',
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${stat.color}90, ${stat.color}18)` }}
          />
          {/* Subtle glow */}
          <div
            className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${stat.color}08, transparent 70%)` }}
          />
          <div className="flex items-start justify-between mb-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.07 + 0.18, duration: 0.35, type: 'spring', stiffness: 280 }}
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: `${stat.color}14`, color: stat.color }}
            >
              {stat.icon}
            </motion.div>
            <CountUp value={stat.value} color={stat.color} />
          </div>
          <div className="text-xs font-medium text-[#4d7a90] uppercase tracking-wider">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
