'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <h3 className="text-sm font-bold text-[#00e5cc] mb-3 flex items-center gap-2">
        <span style={{ color: '#00e5cc' }}>◬</span> FAQ
      </h3>
      <div className="space-y-2">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${isOpen ? 'rgba(0,229,204,0.2)' : 'rgba(0,229,204,0.08)'}`, transition: 'border-color 0.2s' }}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-[#e8f4f8] flex items-center justify-between gap-2 hover:bg-[rgba(0,229,204,0.04)] transition-colors"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <motion.svg
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="flex-shrink-0"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isOpen ? '#00e5cc' : 'currentColor'}
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </motion.svg>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 30, opacity: { duration: 0.15 } }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-3 pt-1 text-sm text-[#6b9bb0] leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
