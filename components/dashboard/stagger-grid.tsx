'use client';

import { motion, type Variants, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 260 } },
};

const noMotionItem: Variants = {
  hidden: {},
  show: {},
};

interface Props {
  children: ReactNode;
}

export function StaggerGrid({ children }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const activeItem = shouldReduceMotion ? noMotionItem : item;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={activeItem}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={activeItem}>{children}</motion.div>}
    </motion.div>
  );
}
