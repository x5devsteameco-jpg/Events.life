'use client';

import { motion } from 'framer-motion';

const cards = [
  {
    eyebrow: 'Frontier Visuals',
    title: 'Cinematic launch sequences',
    body: 'Build event pages that feel closer to an editorial campaign than a plain registration form.',
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=80',
    accent: '#00e5cc',
  },
  {
    eyebrow: 'High-Intent Moments',
    title: 'VIP lounges, night sessions, private drops',
    body: 'Use richer imagery and layered copy to sell exclusivity before the first RSVP lands.',
    image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1400&q=80',
    accent: '#ff3cac',
  },
  {
    eyebrow: 'Operational Clarity',
    title: 'Visual structure for complex programs',
    body: 'Editorial cards, spotlight rails, and clear information hierarchy for dense event programs.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80',
    accent: '#9c6bff',
  },
];

export function FrontierShowcase() {
  return (
    <section className="relative overflow-hidden px-6 py-24" style={{ background: 'linear-gradient(180deg, rgba(2,4,8,0.98), rgba(7,15,20,0.96))' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(0,229,204,0.12), transparent 24%), radial-gradient(circle at 85% 30%, rgba(156,107,255,0.12), transparent 24%), radial-gradient(circle at 50% 80%, rgba(255,60,172,0.1), transparent 28%)' }} />
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#00e5cc]">Experience Direction</p>
            <h2 className="max-w-3xl text-4xl font-black leading-[0.95] text-[#e8f4f8] sm:text-5xl" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
              Stronger picture systems. Stronger atmosphere. Stronger reasons to RSVP.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#8fb3c1] sm:text-base">
            Top-tier event products don’t just list information. They stage anticipation with motion, art direction, and dense visual cues. This section raises that floor.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[30px] border"
            style={{ borderColor: 'rgba(0,229,204,0.14)', minHeight: '520px', boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }}
          >
            <div className="absolute inset-0" style={{ backgroundImage: `url(${cards[0].image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(2,4,8,0.18), rgba(2,4,8,0.94) 70%)' }} />
            <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-5">
              <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ background: 'rgba(0,229,204,0.1)', color: '#00e5cc' }}>Visual Storyboard</span>
              <span className="text-xs text-[#9ac9d8]">Campaign-ready</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="grid gap-5 lg:grid-cols-[1fr_220px] lg:items-end">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#7dd9cd]">{cards[0].eyebrow}</p>
                  <h3 className="max-w-2xl text-3xl font-black text-[#e8f4f8] sm:text-4xl" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>{cards[0].title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#b8d2db] sm:text-base">{cards[0].body}</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                  className="rounded-[24px] border p-4"
                  style={{ background: 'rgba(4,14,18,0.82)', borderColor: 'rgba(0,229,204,0.15)', backdropFilter: 'blur(14px)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#4d7a90]">Live Stack</p>
                  <div className="mt-4 space-y-3">
                    {['Hero banner', 'Editorial card rail', 'VIP spotlight block', 'Program teaser strip'].map((item, index) => (
                      <motion.div key={item} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + index * 0.06, duration: 0.35 }} className="flex items-center justify-between rounded-2xl px-3 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-sm text-[#d8edf2]">{item}</span>
                        <span className="h-2 w-2 rounded-full" style={{ background: index % 2 === 0 ? '#00e5cc' : '#ff3cac' }} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-5">
            {cards.slice(1).map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="relative overflow-hidden rounded-[26px] border p-5"
                style={{ minHeight: '248px', borderColor: `${card.accent}33`, background: 'rgba(9,18,24,0.82)' }}
              >
                <div className="absolute inset-0 opacity-35" style={{ backgroundImage: `url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,4,8,0.08), rgba(2,4,8,0.9) 68%)' }} />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ background: `${card.accent}18`, color: card.accent }}>{card.eyebrow}</span>
                    <span className="text-xs text-[#6d95a5]">0{index + 2}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#bbd4dd]">{card.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
