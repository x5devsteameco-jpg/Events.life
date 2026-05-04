'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function AnimatedListItem({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number], delay }}
    >
      {children}
    </motion.div>
  );
}
