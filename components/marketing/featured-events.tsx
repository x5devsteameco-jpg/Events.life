'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type FeaturedEvent = {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string | null;
  isOnline: boolean;
  bannerImage: string | null;
  category: string | null;
  maxAttendees: number | null;
  _count: { rsvps: number };
  host: { name: string | null; organizerLogo: string | null } | null;
};

const CINZEL = "var(--font-heading, 'Cinzel', Georgia, serif)";
const BEBAS = "var(--font-label, 'Bebas Neue', 'Arial Narrow', sans-serif)";

export function FeaturedEvents() {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch('/api/featured-events')
      .then((r) => r.json())
      .then((data: FeaturedEvent[]) => setEvents(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!events.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [events]);

  if (!events.length) return null;

  return (
    <section ref={sectionRef} style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(0,229,204,0.08)' }}>
      <style>{`.fe-card:hover{border-color:rgba(0,229,204,0.28)!important;box-shadow:0 16px 56px rgba(0,0,0,0.6),0 0 40px rgba(0,229,204,0.06)!important}.fe-stagger{opacity:0;transform:translateY(24px);transition:opacity 0.5s ease,transform 0.5s ease}.fe-stagger.fe-in{opacity:1;transform:none}`}</style>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p style={{ fontFamily: BEBAS, fontSize: '0.85rem', letterSpacing: '0.2em', color: '#00e5cc', textTransform: 'uppercase', marginBottom: '8px' }}>
              Happening Now
            </p>
            <h2 style={{ fontFamily: CINZEL, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#e8f4f8', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-[#00e5cc] hover:text-[#00b8a3] transition-colors flex items-center gap-1.5"
          >
            Browse All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map((event, index) => {
            const spotsLeft = event.maxAttendees ? event.maxAttendees - event._count.rsvps : null;
            const soldOut = spotsLeft !== null && spotsLeft <= 0;
            const fewLeft = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10;
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
            const timeStr = eventDate.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true });

            return (
              <Link
                key={event.id}
                href={`/event/${event.slug}`}
                className={`fe-card fe-stagger${visible ? ' fe-in' : ''} group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1`}
                style={{
                  background: 'rgba(12,26,31,0.7)',
                  border: '1px solid rgba(0,229,204,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                  transitionDelay: visible ? `${index * 80}ms` : '0ms',
                }}
              >
                {/* Banner */}
                <div className="relative h-36 overflow-hidden">
                  {event.bannerImage ? (
                    <Image
                      src={event.bannerImage}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, #060d10 0%, #132530 100%)' }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,4,8,0.8)] to-transparent" />

                  {/* Category chip */}
                  {event.category && (
                    <span
                      className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: 'rgba(0,229,204,0.15)', border: '1px solid rgba(0,229,204,0.3)', color: '#00e5cc' }}
                    >
                      {event.category}
                    </span>
                  )}

                  {/* Capacity badge */}
                  {soldOut && (
                    <span
                      className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(255,60,172,0.15)', border: '1px solid rgba(255,60,172,0.3)', color: '#ff3cac' }}
                    >
                      SOLD OUT
                    </span>
                  )}
                  {fewLeft && !soldOut && (
                    <span
                      className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}
                    >
                      {spotsLeft} left
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5">
                  <p
                    className="font-bold text-[#e8f4f8] text-sm line-clamp-1 mb-1.5"
                    style={{ fontFamily: CINZEL, letterSpacing: '0.02em' }}
                  >
                    {event.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#4d7a90] mb-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{dateStr} · {timeStr}</span>
                  </div>
                  {(event.location || event.isOnline) && (
                    <div className="flex items-center gap-1.5 text-xs text-[#4d7a90]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="truncate">{event.isOnline ? 'Online' : event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-2.5" style={{ borderTop: '1px solid rgba(0,229,204,0.06)' }}>
                    <span className="text-xs text-[#4d7a90]">{event._count.rsvps} RSVPs</span>
                    <span
                      className="text-xs font-semibold text-[#00e5cc] group-hover:text-[#00b8a3] transition-colors"
                    >
                      RSVP →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
