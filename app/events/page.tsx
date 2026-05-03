import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import type { EventStatus } from '@/lib/types';

export const metadata = {
  title: 'Browse Events | Gatewise Events',
  description: 'Discover and RSVP to upcoming events on Gatewise Events.',
};

async function getPublicEvents(search?: string, category?: string) {
  return db.event.findMany({
    where: {
      status: { in: ['LIVE'] },
      visibility: 'PUBLIC',
      ...(search ? { title: { contains: search } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { date: 'asc' },
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
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;
  const events = await getPublicEvents(search, category);

  return (
    <div className="min-h-screen" style={{ background: '#020408' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-30 px-6 h-16 flex items-center justify-between"
        style={{ background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,229,204,0.08)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#020408" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="font-black text-sm gradient-text-static" style={{ fontFamily: 'var(--font-display)' }}>
            Gatewise Events
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#7aafc4] hover:text-[#00e5cc] transition-colors px-3 py-1.5">Sign In</Link>
          <Link href="/register" className="text-sm font-bold px-4 py-2 rounded-lg text-[#020408]" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4">
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

          {/* Prominent search */}
          <form className="flex flex-wrap gap-3 max-w-2xl mx-auto" method="get">
            <div className="flex-1 min-w-[200px] relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2d5268]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                name="search"
                defaultValue={search}
                placeholder="Search events by name…"
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-[#e8f4f8] outline-none focus:ring-2 focus:ring-[rgba(0,229,204,0.3)] transition-all"
                style={{ background: 'rgba(12,26,31,0.9)', border: '1px solid rgba(0,229,204,0.2)' }}
              />
            </div>
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
            <button
              type="submit"
              className="h-12 px-6 rounded-xl text-sm font-bold text-[#020408] transition-all hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}
            >
              Search
            </button>
            {(search || category) && (
              <Link href="/events" className="h-12 px-5 inline-flex items-center rounded-xl text-sm text-[#4d7a90] hover:text-[#e8f4f8] transition-colors" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.08)' }}>
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Active filter chips */}
        {(search || category) && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-[#2d5268]">Filtering by:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.15)', color: '#00e5cc' }}>
                &ldquo;{search}&rdquo;
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(127,255,0,0.06)', border: '1px solid rgba(127,255,0,0.15)', color: '#7fff00' }}>
                {category}
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {events.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ background: 'rgba(12,26,31,0.3)', border: '1px dashed rgba(0,229,204,0.1)' }}>
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-[#e8f4f8] mb-2" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>No events found</h2>
            <p className="text-sm text-[#4d7a90] mb-6">Try adjusting your search or check back later.</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#020408]" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>
              Host Your Own Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => {
              const confirmedCount = event._count?.rsvps ?? 0;
              const isFull = event.maxAttendees ? confirmedCount >= event.maxAttendees : false;

              return (
                <Link
                  key={event.id}
                  href={`/event/${event.slug}`}
                  className="group rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,229,204,0.12)]"
                  style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}
                >
                  {/* Banner */}
                  <div className="h-44 relative overflow-hidden flex-shrink-0">
                    {event.bannerImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,229,204,0.12), rgba(127,255,0,0.06))' }}>
                        <span className="text-4xl opacity-60">🎉</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant={statusToBadgeVariant(event.status as EventStatus)} size="sm">{event.status}</Badge>
                      {event.ageGate > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'rgba(255,60,172,0.15)', border: '1px solid rgba(255,60,172,0.3)', color: '#ff3cac' }}>
                          {event.ageGate}+
                        </span>
                      )}
                    </div>
                    {isFull && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(255,60,172,0.8)', color: 'white' }}>
                        SOLD OUT
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {event.category && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#00e5cc] mb-1">{event.category}</span>
                    )}
                    <h3 className="font-bold text-[#e8f4f8] line-clamp-2 mb-2 leading-snug" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-[#4d7a90] mb-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatDate(event.date)}
                    </div>

                    {(event.location || event.isOnline) && (
                      <div className="flex items-center gap-1.5 text-xs text-[#4d7a90] mb-3">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {event.isOnline ? 'Online Event' : event.location}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(0,229,204,0.06)' }}>
                      <div className="text-xs text-[#4d7a90]">
                        By <span className="text-[#7aafc4]">{event.host.name ?? event.host.company ?? 'Anonymous'}</span>
                      </div>
                      <div className="text-xs text-[#4d7a90]">
                        {confirmedCount} attending
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
