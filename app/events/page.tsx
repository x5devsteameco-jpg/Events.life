import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { BrandLogo } from '@/components/brand/logo';
import { EventsGrid } from '@/components/events/events-grid';

export const metadata = {
  title: 'Browse Events',
  description: 'Discover and RSVP to upcoming events on Gatewise Events.',
};

const CANADIAN_CITIES = [
  'Calgary', 'Edmonton', 'Vancouver', 'Toronto', 'Ottawa', 'Montréal',
  'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria',
  'Halifax', 'Saskatoon', 'Regina',
];

const CATEGORIES = ['Networking', 'Product Demo', 'Private Gathering', 'Industry Event', 'Other'];

async function getTrendingEvents() {
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return db.event.findMany({
    where: {
      status: { in: ['LIVE'] },
      visibility: 'PUBLIC',
      date: { lte: weekFromNow, gte: new Date() },
    },
    orderBy: { rsvps: { _count: 'desc' } },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      date: true,
      location: true,
      isOnline: true,
      bannerImage: true,
      category: true,
      ageGate: true,
      maxAttendees: true,
      eventTheme: true,
      dressCode: true,
      host: { select: { name: true, company: true } },
      _count: { select: { rsvps: true } },
    },
  });
}

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
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      date: true,
      location: true,
      isOnline: true,
      bannerImage: true,
      category: true,
      ageGate: true,
      maxAttendees: true,
      eventTheme: true,
      dressCode: true,
      host: { select: { name: true, company: true } },
      _count: { select: { rsvps: true } },
    },
  });
}

export default async function BrowseEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; dateFrom?: string; city?: string; sort?: string }>;
}) {
  const { search, category, dateFrom, city, sort } = await searchParams;
  const [events, trendingEvents] = await Promise.all([
    getPublicEvents(search, category, dateFrom, city, sort),
    getTrendingEvents(),
  ]);
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
            Find networking events, product demos, private gatherings and more.{' '}
            <span className="text-[#00e5cc] font-semibold">RSVP in seconds — no account needed.</span>
          </p>

          {/* Search filters — responsive grid on mobile */}
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 max-w-3xl mx-auto" method="get">
            {/* Search */}
            <div className="sm:col-span-2 lg:flex-1 lg:min-w-[200px] relative">
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
              className="w-full h-12 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
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
              className="w-full h-12 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
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
              className="w-full h-12 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
              style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)', colorScheme: 'dark' }}
            />

            {/* Sort */}
            <select
              name="sort"
              defaultValue={sort ?? ''}
              className="w-full h-12 px-4 rounded-xl text-sm text-[#e8f4f8] outline-none"
              style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)' }}
            >
              <option value="">Soonest First</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Added</option>
            </select>

            <button
              type="submit"
              className="w-full sm:col-span-2 lg:w-auto h-12 px-6 rounded-xl text-sm font-bold text-[#020408] transition-all hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
            >
              Search
            </button>
            {hasFilter && (
              <Link
                href="/events"
                className="w-full sm:col-span-2 lg:w-auto h-12 px-5 inline-flex items-center justify-center rounded-xl text-sm text-[#4d7a90] hover:text-[#e8f4f8] transition-colors"
                style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.08)' }}
              >
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

        {/* Discovery sections — hidden when a filter is active */}
        {!hasFilter && (
          <>
            {/* Trending this week */}
            {trendingEvents.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(0,229,204,0.0), rgba(0,229,204,0.15))' }} />
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#00e5cc', fontFamily: "var(--font-label, 'Bebas Neue', 'Arial Narrow', sans-serif)", letterSpacing: '0.18em' }}
                  >
                    🔥 Trending This Week
                  </span>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(0,229,204,0.0), rgba(0,229,204,0.15))' }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {trendingEvents.map((ev) => (
                    <Link
                      key={ev.id}
                      href={`/event/${ev.slug}`}
                      className="group flex gap-3 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}
                    >
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: 'rgba(0,229,204,0.06)' }}
                      >
                        🎪
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#e8f4f8] truncate group-hover:text-[#00e5cc] transition-colors">{ev.title}</p>
                        <p className="text-xs text-[#4d7a90] mt-0.5">{formatDate(ev.date)}</p>
                        <p className="text-xs text-[#00e5cc] mt-1">
                          {ev._count.rsvps} RSVP{ev._count.rsvps !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Category quick-filter chips */}
            <div className="flex gap-2 flex-wrap justify-center mb-8">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat}
                  href={`/events?category=${encodeURIComponent(cat)}`}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all hover:text-[#00e5cc]"
                  style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.1)', color: '#4d7a90' }}
                >
                  {cat}
                </a>
              ))}
            </div>
          </>
        )}

        {/* All events grid */}
        <EventsGrid events={events} />

        {/* Footer CTA */}
        <div className="text-center py-12 text-xs text-[#2d5268]">
          <p>
            Can&apos;t find what you&apos;re looking for?{' '}
            <Link href="/register" className="text-[#4d7a90] hover:text-[#00e5cc] underline transition-colors">
              Create your own event →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
