import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import { BrandLogo } from '@/components/brand/logo';
import { EventsGrid } from '@/components/events/events-grid';
import type { EventStatus } from '@/lib/types';

export const metadata = {
  title: 'Browse Events',
  description: 'Discover and RSVP to upcoming events on Gatewise Events.',
};

const CANADIAN_CITIES = [
  'Calgary', 'Edmonton', 'Vancouver', 'Toronto', 'Ottawa', 'Montréal',
  'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria',
  'Halifax', 'Saskatoon', 'Regina',
];

async function getPublicEvents(search?: string, category?: string, dateFrom?: string, city?: string, sort?: string) {
  const orderBy = sort === 'popular'
    ? { rsvps: { _count: 'desc' as const } }
    : sort === 'newest'
    ? { createdAt: 'desc' as const }
    : { date: 'asc' as const };

  return db.event.findMany({
    where: {
      status: { in: ['LIVE'] },
      visibility: 'PUBLIC',
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(category ? { category } : {}),
      ...(dateFrom ? { date: { gte: new Date(dateFrom) } } : {}),
      ...(city ? { location: { contains: city, mode: 'insensitive' } } : {}),
    },
    orderBy,
    take: 60,
    include: {
      host: { select: { name: true, company: true } },
      _count: { select: { rsvps: true } },
    },
  });
}

const CATEGORIES = ['Networking', 'Product Demo', 'Private Gathering', 'Industry Event', 'Other'];

export default async function BrowseEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; dateFrom?: string; city?: string; sort?: string }>;
}) {
  const { search, category, dateFrom, city, sort } = await searchParams;
  const events = await getPublicEvents(search, category, dateFrom, city, sort);
  const hasFilter = !!(search || category || city || dateFrom);

  return (
    <div className="min-h-screen" style={{ background: '#020408' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-30 px-6 h-16 flex items-center justify-between"
        style={{ background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,229,204,0.08)' }}
      >
        <Link href="/">
          <BrandLogo size="sm" textClassName="text-sm" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#7aafc4] hover:text-[#00e5cc] transition-colors px-3 py-1.5">Sign In</Link>
          <Link href="/register" className="text-sm font-bold px-4 py-2 rounded-lg text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Hero */}
        <div className="py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)', color: '#00e5cc' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc] animate-pulse" />
            {events.length} event{events.length !== 1 ? 's' : ''} live now
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-[#e8f4f8] mb-4 leading-tight" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)", letterSpacing: '0.04em' }}>
            Discover<br />
            <span className="gradient-text-static">Events Near You</span>
          </h1>
          <p className="text-[#4d7a90] max-w-xl mx-auto mb-8">
            Find networking events, product demos, private gatherings and more. RSVP in seconds — no account needed.
          </p>

          {/* Search filters */}
          <form className="flex flex-wrap gap-3 max-w-3xl mx-auto" method="get">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2d5268]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                name="search"
                defaultValue={search}
                placeholder="Search events…"
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-[#e8f4f8] outline-none focus:ring-2 focus:ring-[rgba(0,229,204,0.3)] transition-all"
                style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)' }}
              />
            </div>

            {/* Category */}
            <select
              name="category"
              defaultValue={category ?? ''}
              className="h-12 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
              style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)' }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* City */}
            <select
              name="city"
              defaultValue={city ?? ''}
              className="h-12 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
              style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)' }}
            >
              <option value="">All Cities</option>
              {CANADIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Date from */}
            <input
              name="dateFrom"
              type="date"
              defaultValue={dateFrom ?? ''}
              className="h-12 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
              style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)', colorScheme: 'dark' }}
            />

            {/* Sort */}
            <select
              name="sort"
              defaultValue={sort ?? ''}
              className="h-12 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
              style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)' }}
            >
              <option value="">Soonest First</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Added</option>
            </select>

            <button
              type="submit"
              className="h-12 px-6 rounded-xl text-sm font-bold text-[#020408] transition-all hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
            >
              Search
            </button>
            {hasFilter && (
              <Link href="/events" className="h-12 px-5 inline-flex items-center rounded-xl text-sm text-[#4d7a90] hover:text-[#e8f4f8] transition-colors" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.08)' }}>
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Active filter chips */}
        {hasFilter && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-[#2d5268]">Filtering by:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.15)', color: '#00e5cc' }}>
                &ldquo;{search}&rdquo;
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(0,229,204,0.06)', border: '1px solid rgba(0,229,204,0.15)', color: '#00e5cc' }}>
                {category}
              </span>
            )}
            {city && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(0,229,204,0.06)', border: '1px solid rgba(0,229,204,0.15)', color: '#00e5cc' }}>
                📍 {city}
              </span>
            )}
          </div>
        )}

        {/* Grid — client component for stagger animation */}
        <EventsGrid events={events} />
      </div>
    </div>
  );
}
