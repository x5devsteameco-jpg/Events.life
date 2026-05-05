import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import { RSVPForm } from '@/components/events/rsvp-form';
import { AgeGate } from '@/components/events/age-gate';
import { ShareButton } from '@/components/events/share-button';
import { BrandLogo } from '@/components/brand/logo';
import { FadeIn } from '@/components/ui/fade-in';
import type { EventStatus } from '@/lib/types';
import { FAQAccordion } from '@/components/events/faq-accordion';
import { RSVPDrawer } from '@/components/events/rsvp-drawer';
import { PageViewTracker } from '@/components/events/page-view-tracker';
import { EventCountdownTimer } from '@/components/events/event-countdown-timer';
import { SaveEventButton } from '@/components/events/save-event-button';
import { auth } from '@/lib/auth';

export const revalidate = 60; // ISR: regenerate at most once per minute

const THEME_ACCENT: Record<string, string> = {
  teal:    '#00e5cc',
  violet:  '#9c6bff',
  rose:    '#ff3cac',
  amber:   '#f59e0b',
  sky:     '#38bdf8',
  emerald: '#34d399',
};

type Props = { params: Promise<{ slug: string }> };


export async function generateStaticParams() {
  try {
    const events = await db.event.findMany({
      where: { status: 'LIVE', visibility: 'PUBLIC' },
      select: { slug: true },
      take: 200,
    });
    return events.map((e) => ({ slug: e.slug }));
  } catch {
    // DB may not have updated schema during local builds — render all pages on-demand
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const event = await db.event.findUnique({ where: { slug } });
    if (!event) return { title: 'Event Not Found' };
    return {
      title: event.title,
      description: event.description ?? `RSVP to ${event.title}`,
      openGraph: {
        title: event.title,
        description: event.description ?? '',
        images: event.bannerImage ? [event.bannerImage] : [],
      },
    };
  } catch {
    return { title: 'Event' };
  }
}

export default async function PublicEventPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      host: { select: { id: true, name: true, company: true, image: true, position: true, bio: true, organizerLogo: true, themePreset: true, instagram: true, linkedin: true, website: true, twitter: true } },
      _count: { select: { rsvps: true } },
      tickets: { where: { isVisible: true }, orderBy: { price: 'asc' } },
    },
  });

  if (!event || event.status === 'DRAFT') notFound();

  const [confirmedCount, isSaved] = await Promise.all([
    db.rSVP.count({ where: { eventId: event.id, status: 'CONFIRMED' } }),
    session?.user?.id
      ? db.savedEvent.findUnique({
          where: { userId_eventId: { userId: session.user.id, eventId: event.id } },
        }).then(Boolean)
      : Promise.resolve(false),
  ]);
  const isFull = event.maxAttendees ? confirmedCount >= event.maxAttendees : false;
  const isAccepting = event.status === 'LIVE' && !isFull;

  // Fetch similar events - improved matching on category + location/online status
  const similarEvents = event.category
    ? await db.event.findMany({
        where: {
          status: 'LIVE',
          visibility: 'PUBLIC',
          category: event.category,
          id: { not: event.id },
          date: { gte: new Date() },
          // Match on event type (online/in-person) when possible
          isOnline: event.isOnline,
          // If not online, optionally match location (removed for more variety)
        },
        orderBy: [
          { date: 'asc' }, // Soonest first
          { rsvps: { _count: 'desc' } }, // Then by popularity
        ],
        take: 4,
        select: {
          id: true,
          slug: true,
          title: true,
          date: true,
          location: true,
          isOnline: true,
          bannerImage: true,
          eventTheme: true,
          host: { select: { name: true, company: true } },
          _count: { select: { rsvps: true } },
        },
      })
    : [];

  const parsedQuestions = (() => {
    try { return event.customQuestions ? JSON.parse(event.customQuestions as string) : []; }
    catch { return []; }
  })();

  const parsedPromoCodes = (() => {
    try { return event.promoCodes ? JSON.parse(event.promoCodes as string) : []; }
    catch { return []; }
  })();

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description ?? undefined,
    startDate: event.date.toISOString(),
    endDate: event.endDate?.toISOString() ?? undefined,
    eventStatus: event.status === 'LIVE' ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCancelled',
    eventAttendanceMode: event.isOnline
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: event.isOnline
      ? { '@type': 'VirtualLocation', url: event.onlineLink ?? undefined }
      : { '@type': 'Place', name: event.location ?? 'TBD', address: event.location ?? undefined },
    organizer: { '@type': 'Organization', name: event.host.name ?? event.host.company ?? 'Event Organizer' },
    image: event.bannerImage ? [event.bannerImage] : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <PageViewTracker id={event.id} />
      <div
      className="min-h-screen"
      style={{
        background: '#020408',
        '--theme-accent': THEME_ACCENT[event.eventTheme ?? event.host.themePreset ?? 'teal'] ?? '#00e5cc',
        '--theme-accent-08': `${THEME_ACCENT[event.eventTheme ?? event.host.themePreset ?? 'teal'] ?? '#00e5cc'}14`,
        '--theme-accent-20': `${THEME_ACCENT[event.eventTheme ?? event.host.themePreset ?? 'teal'] ?? '#00e5cc'}33`,
      } as React.CSSProperties}
    >
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30" style={{ background: 'rgba(2,4,8,0.88)', backdropFilter: 'blur(20px)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <Link href="/">
          <BrandLogo size="sm" textClassName="text-sm" />
        </Link>
        <div className="flex items-center gap-3">
          <SaveEventButton eventId={event.id} initialSaved={isSaved} size="sm" />
          <a
            href={`/api/events/${event.id}/ics`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[rgba(0,229,204,0.2)] text-[#00e5cc] hover:bg-[rgba(0,229,204,0.08)] transition-all"
            title="Add to Calendar"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Add to Calendar
          </a>
          <ShareButton title={event.title} />
          <Badge variant={statusToBadgeVariant(event.status as EventStatus)}>{event.status}</Badge>
        </div>
      </nav>

      {/* Cinematic Banner Hero */}
      <div className="relative overflow-hidden" style={{ height: event.bannerImage ? '420px' : '240px' }}>
        {event.bannerImage ? (
          <>
            <Image
              src={event.bannerImage}
              alt={`${event.title} banner`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Multi-stop cinematic gradient overlay */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,4,8,0.28) 0%, rgba(2,4,8,0.5) 45%, rgba(2,4,8,0.95) 85%, #020408 100%)' }} />
            {/* Left edge vignette */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(2,4,8,0.5) 0%, transparent 40%)' }} />
            {/* Event title overlaid on banner */}
            <div className="absolute left-6 right-6 bottom-8 max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={statusToBadgeVariant(event.status as EventStatus)}>{event.status === 'LIVE' ? 'Live' : event.status}</Badge>
                {event.category && <Badge variant="default">{event.category}</Badge>}
                {event.ageGate > 0 && <Badge variant="cancelled">{event.ageGate}+ Only</Badge>}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#e8f4f8] leading-tight" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)", textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}>
                {event.title}
              </h1>
              <p className="text-[#9fc5d3] text-sm mt-2">
                Hosted by{' '}
                <span className="text-[#00e5cc] font-medium">{event.host.name ?? event.host.company ?? 'Anonymous'}</span>
                {event.host.company && event.host.name && (
                  <span className="text-[#4d7a90]"> · {event.host.company}</span>
                )}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,229,204,0.08), rgba(0,180,150,0.04), rgba(255,60,172,0.06))' }}>
              {/* Grid pattern */}
              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }} aria-hidden="true">
                <defs><pattern id="event-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#00e5cc" strokeWidth="0.6"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#event-grid)"/>
              </svg>
              {/* Centre mark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="88" height="88" viewBox="0 0 48 48" fill="none" opacity="0.12" aria-hidden="true">
                  <path d="M24 6L38 13.5V28.5L24 36L10 28.5V13.5L24 6Z" stroke="#00e5cc" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M24 14L30.5 17.8V25.2L24 29L17.5 25.2V17.8L24 14Z" fill="#00e5cc"/>
                </svg>
              </div>
            </div>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(2,4,8,0.9) 85%, #020408 100%)' }} />
            <div className="absolute left-6 right-6 bottom-8">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={statusToBadgeVariant(event.status as EventStatus)}>{event.status === 'LIVE' ? 'Live' : event.status}</Badge>
                {event.category && <Badge variant="default">{event.category}</Badge>}
                {event.ageGate > 0 && <Badge variant="cancelled">{event.ageGate}+ Only</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#e8f4f8] leading-tight" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
                {event.title}
              </h1>
              <p className="text-[#4d7a90] text-sm mt-2">
                Hosted by{' '}
                <span className="text-[#00e5cc] font-medium">{event.host.name ?? event.host.company ?? 'Anonymous'}</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Mobile bottom-sheet RSVP (hidden on lg+) */}
      <RSVPDrawer
        eventId={event.id}
        title={event.title}
        eventDate={event.date.toISOString()}
        eventEndDate={event.endDate?.toISOString()}
        eventLocation={event.isOnline ? 'Online Event' : (event.location ?? undefined)}
        eventSlug={event.slug}
        isAccepting={isAccepting}
        isFull={isFull}
        requiresCertification={event.requiresCertification}
        certificationNote={event.certificationNote ?? ''}
        customQuestions={parsedQuestions}
        confirmationMessage={event.confirmationMessage ?? undefined}
        promoCodes={parsedPromoCodes}
      />

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-24 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Host / Organizer block */}
            <FadeIn delay={0.05}>
            <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid var(--theme-accent-20)' }}>
              <div className="flex items-center gap-3">
                {event.host.organizerLogo ? (
                  <Image src={event.host.organizerLogo} alt="Organizer logo" width={100} height={40} className="h-10 max-w-[100px] object-contain rounded flex-shrink-0" />
                ) : event.host.image ? (
                  <Image src={event.host.image} alt={event.host.name ?? 'Host'} width={40} height={40} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#020408] flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
                    {(event.host.name?.[0] ?? 'H').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#e8f4f8] truncate">{event.host.name ?? 'Anonymous Host'}</p>
                  {(event.host.company || event.host.position) && (
                    <p className="text-xs text-[#4d7a90] truncate">
                      {[event.host.position, event.host.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <Link href={`/organizer/${event.host.id}`} className="ml-2 text-[10px] uppercase tracking-wider text-[#00e5cc] hover:underline flex-shrink-0">Profile →</Link>
              </div>
              {event.host.bio && (
                <p className="text-xs text-[#6b9bb0] leading-relaxed border-t border-[rgba(0,229,204,0.06)] pt-3">{event.host.bio}</p>
              )}
              {(event.host.instagram || event.host.linkedin || event.host.website || event.host.twitter) && (
                <div className="flex gap-2 pt-2 border-t border-[rgba(0,229,204,0.06)]">
                  {event.host.website && (
                    <a href={event.host.website.startsWith('http') ? event.host.website : `https://${event.host.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#00e5cc] hover:bg-[rgba(0,229,204,0.1)] transition-all" title="Website">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </a>
                  )}
                  {event.host.instagram && (
                    <a href={`https://instagram.com/${event.host.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#00e5cc] hover:bg-[rgba(0,229,204,0.1)] transition-all" title="Instagram">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0" fill="currentColor"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
                    </a>
                  )}
                  {event.host.linkedin && (
                    <a href={`https://linkedin.com/in/${event.host.linkedin.replace('@', '').split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#00e5cc] hover:bg-[rgba(0,229,204,0.1)] transition-all" title="LinkedIn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.5v8.5h2.5v-4.34c0-.77.62-1.4 1.4-1.4.77 0 1.4.63 1.4 1.4v4.34h2.5M6.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m-1 13.5h2v-8.5h-2v8.5z"/></svg>
                    </a>
                  )}
                  {event.host.twitter && (
                    <a href={`https://twitter.com/${event.host.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#00e5cc] hover:bg-[rgba(0,229,204,0.1)] transition-all" title="Twitter/X">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2s9 5 20 5a9.5 9.5 0 0 0-9-5.5c4.75 2.25 9-1.5 11-5-4.5 1.5-9 1.5-11-1"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
            </FadeIn>

            {/* Key details */}
            <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl space-y-1" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
                <p className="text-xs text-[#4d7a90] font-medium uppercase tracking-wider">Date & Time</p>
                <p className="text-sm text-[#e8f4f8] font-semibold">{formatDate(event.date)}</p>
                  {event.endDate && new Date(event.endDate).toDateString() !== new Date(event.date).toDateString() && (
                    <p className="text-xs text-[#4d7a90]">Until {formatDate(event.endDate)}</p>
                  )}
              </div>

              <div className="p-4 rounded-xl space-y-1" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
                <p className="text-xs text-[#4d7a90] font-medium uppercase tracking-wider">Location</p>
                {event.isOnline ? (
                  <p className="text-sm text-[#e8f4f8] font-semibold">Online Event</p>
                ) : (
                  <>
                    {event.location && <p className="text-sm text-[#e8f4f8] font-semibold">{event.location}</p>}
                    {event.address && <p className="text-xs text-[#4d7a90]">{event.address}</p>}
                    {event.parkingAvailable && <p className="text-xs text-[#00e5cc]">Parking available</p>}
                    {(event.location || event.address) && (
                      <>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.location, event.address].filter(Boolean).join(', '))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ background: 'rgba(0,229,204,0.06)', border: '1px solid rgba(0,229,204,0.18)', color: '#00e5cc' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          Get Directions ↗
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            </FadeIn>

            {/* Description */}
            {event.description && (
              <FadeIn delay={0.15}>
                <div className="space-y-2">
                {/* Countdown timer — only show if event is in the future */}
                {event.status === 'LIVE' && new Date(event.date) > new Date() && (
                  <FadeIn delay={0.08}>
                    <EventCountdownTimer
                      eventDate={event.date.toISOString()}
                      accent={THEME_ACCENT[event.eventTheme ?? event.host.themePreset ?? 'teal'] ?? '#00e5cc'}
                    />
                  </FadeIn>
                )}
                <h2 className="text-sm font-bold text-[#e8f4f8] uppercase tracking-wider">About This Event</h2>
                <p className="text-sm text-[#6b9bb0] leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              </FadeIn>
            )}

            {/* Things to Know */}
            {event.thingsToKnow && (
              <FadeIn delay={0.18}>
                <div className="p-5 rounded-xl" style={{ background: 'rgba(0,229,204,0.04)', border: '1px solid rgba(0,229,204,0.15)' }}>
                <h3 className="text-sm font-bold text-[#00e5cc] mb-2 flex items-center gap-2">
                  <span> ◫</span> Things to Know / Bring
                </h3>
                <p className="text-sm text-[#6b9bb0] whitespace-pre-line leading-relaxed">{event.thingsToKnow}</p>
                </div>
              </FadeIn>
            )}

            {/* Ticket Tiers */}
            {event.tickets && event.tickets.length > 0 && (
              <FadeIn delay={0.1}>
                <div>
                  <h2 className="text-sm font-bold text-[#e8f4f8] uppercase tracking-wider mb-3">Tickets</h2>
                  <div className="space-y-2">
                    {event.tickets.map((tier) => {
                      const sold = tier.quantitySold ?? 0;
                      const cap = tier.quantity;
                      const remaining = cap != null ? cap - sold : null;
                      const pct = cap != null ? Math.min(100, Math.round((sold / cap) * 100)) : 0;
                      return (
                        <div key={tier.id} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[#e8f4f8]">{tier.name}</span>
                              {tier.isFree && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)', color: '#00e5cc' }}>FREE</span>
                              )}
                            </div>
                            {tier.description && <p className="text-xs text-[#4d7a90] mt-0.5">{tier.description}</p>}
                            {cap != null && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-[10px] text-[#2d5268] mb-1">
                                  <span>{sold} claimed</span>
                                  {remaining != null && <span>{remaining} remaining</span>}
                                </div>
                                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,229,204,0.08)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? '#ff3cac' : 'linear-gradient(90deg, #00c4a8, #00e5cc)' }} />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-black text-lg" style={{ color: tier.isFree ? '#00e5cc' : '#f59e0b' }}>
                              {tier.isFree ? 'Free' : `$${tier.price.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Certification */}
            {event.requiresCertification && event.certificationNote && (
              <div className="p-5 rounded-xl" style={{ background: 'rgba(255,60,172,0.04)', border: '1px solid rgba(255,60,172,0.12)' }}>
                <h3 className="text-sm font-bold text-[#ff3cac] mb-1 flex items-center gap-2">
                  <span>🪪</span> Certification Required
                </h3>
                <p className="text-sm text-[#6b9bb0]">Attendees must hold a valid {event.certificationNote} to attend this event.</p>
              </div>
            )}

            {(event.dressCode || event.maxTicketsPerPerson) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.dressCode && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
                    <p className="text-xs text-[#4d7a90] font-medium uppercase tracking-wider">Dress Code</p>
                    <p className="mt-1 text-sm text-[#e8f4f8] font-semibold">{event.dressCode}</p>
                  </div>
                )}
                {event.maxTicketsPerPerson && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
                    <p className="text-xs text-[#4d7a90] font-medium uppercase tracking-wider">Max Tickets Per Person</p>
                    <p className="mt-1 text-sm text-[#e8f4f8] font-semibold">{event.maxTicketsPerPerson}</p>
                  </div>
                )}
              </div>
            )}

            {/* FAQ */}
            {event.faqs && (() => {
              let faqList: { id: string; question: string; answer: string }[] = [];
              try { faqList = JSON.parse(event.faqs as string); } catch { /* ignore */ }
              return faqList.length > 0 ? <FAQAccordion faqs={faqList} /> : null;
            })()}

            {/* Speakers */}
            {event.speakers && (() => {
              type Speaker = { id: string; name: string; title: string; bio: string; photoUrl: string; linkedin: string; twitter: string };
              let speakerList: Speaker[] = [];
              try { speakerList = JSON.parse(event.speakers as string); } catch { /* ignore */ }
              return speakerList.length > 0 ? (
                <FadeIn>
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-[#e8f4f8]">Speakers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {speakerList.map((s) => (
                        <div key={s.id} className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.1)' }}>
                          {s.photoUrl ? (
                            <Image src={s.photoUrl} alt={s.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-[#020408] flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
                              {s.name[0]?.toUpperCase() ?? '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#e8f4f8] truncate">{s.name}</p>
                            {s.title && <p className="text-xs text-[#4d7a90] truncate">{s.title}</p>}
                            {s.bio && <p className="text-xs text-[#7ba3b5] mt-1 line-clamp-2">{s.bio}</p>}
                            <div className="flex gap-2 mt-2">
                              {s.linkedin && <a href={s.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00e5cc] hover:underline">LinkedIn</a>}
                              {s.twitter && <a href={s.twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00e5cc] hover:underline">Twitter</a>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ) : null;
            })()}

            {/* Agenda */}
            {event.agenda && (() => {
              type AgendaItem = { id: string; time: string; title: string; description: string; speakerId: string; duration: string };
              type Speaker = { id: string; name: string };
              let agendaList: AgendaItem[] = [];
              let speakerMap: Record<string, string> = {};
              try { agendaList = JSON.parse(event.agenda as string); } catch { /* ignore */ }
              if (event.speakers) {
                try {
                  const sp: Speaker[] = JSON.parse(event.speakers as string);
                  speakerMap = Object.fromEntries(sp.map((s) => [s.id, s.name]));
                } catch { /* ignore */ }
              }
              return agendaList.length > 0 ? (
                <FadeIn>
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-[#e8f4f8]">Agenda</h3>
                    <div className="space-y-2">
                      {agendaList.map((item, idx) => (
                        <div key={item.id ?? idx} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(12,26,31,0.5)', border: '1px solid rgba(0,229,204,0.08)' }}>
                          <div className="text-xs font-mono text-[#00e5cc] w-14 flex-shrink-0 pt-0.5">{item.time}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#e8f4f8]">{item.title}</p>
                            {item.description && <p className="text-xs text-[#7ba3b5] mt-0.5">{item.description}</p>}
                            <div className="flex items-center gap-3 mt-1">
                              {item.speakerId && speakerMap[item.speakerId] && (
                                <span className="text-xs text-[#4d7a90]">{speakerMap[item.speakerId]}</span>
                              )}
                              {item.duration && <span className="text-xs text-[#4d7a90]">· {item.duration}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ) : null;
            })()}

            {/* Capacity */}
            {event.maxAttendees && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1 h-1.5 rounded-full bg-[rgba(0,229,204,0.1)] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00c4a8] to-[#00e5cc] transition-all" style={{ width: `${Math.min(100, (confirmedCount / event.maxAttendees) * 100)}%` }} />
                </div>
                <span className="text-[#4d7a90] text-xs whitespace-nowrap">{confirmedCount} / {event.maxAttendees} attending</span>
              </div>
            )}

              {/* Share callout - shows when content is sparse */}
              {!event.description && !event.faqs && !event.thingsToKnow && (
                <div className="p-5 rounded-xl flex items-center gap-4" style={{ background: 'rgba(0,229,204,0.04)', border: '1px solid rgba(0,229,204,0.12)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,229,204,0.1)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#e8f4f8]">Know someone who should attend?</p>
                    <p className="text-xs text-[#4d7a90] mt-0.5">Share this event link with your network.</p>
                  </div>
                </div>
              )}
          </div>

          {/* Right — RSVP */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              {event.ageGate > 0 ? (
                <AgeGate minAge={event.ageGate}>
                  <RSVPFormWrapper
                    eventId={event.id}
                    title={event.title}
                    eventDate={event.date.toISOString()}
                    eventEndDate={event.endDate?.toISOString()}
                    eventLocation={event.isOnline ? 'Online Event' : (event.location ?? undefined)}
                    eventSlug={event.slug}
                    isAccepting={isAccepting}
                    isFull={isFull}
                    requiresCertification={event.requiresCertification}
                    certificationNote={event.certificationNote ?? ''}
                    customQuestions={parsedQuestions}
                    confirmationMessage={event.confirmationMessage ?? undefined}
                    promoCodes={parsedPromoCodes}
                  />
                </AgeGate>
              ) : (
                <RSVPFormWrapper
                  eventId={event.id}
                  title={event.title}
                  eventDate={event.date.toISOString()}
                  eventEndDate={event.endDate?.toISOString()}
                  eventLocation={event.isOnline ? 'Online Event' : (event.location ?? undefined)}
                  eventSlug={event.slug}
                  isAccepting={isAccepting}
                  isFull={isFull}
                  requiresCertification={event.requiresCertification}
                  certificationNote={event.certificationNote ?? ''}
                  customQuestions={parsedQuestions}
                  confirmationMessage={event.confirmationMessage ?? undefined}
                  promoCodes={parsedPromoCodes}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function RSVPFormWrapper(props: {
  eventId: string;
  title: string;
  eventDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventSlug?: string;
  isAccepting: boolean;
  isFull: boolean;
  requiresCertification: boolean;
  certificationNote: string;
  customQuestions: import('@/lib/types').CustomQuestion[];
  confirmationMessage?: string;
  promoCodes?: { id: string; code: string; discountType: 'percent' | 'flat'; discountValue: string; usageLimit: string; unlimited: boolean }[];
}) {
  if (props.isFull) {
    return (
      <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(12,26,31,0.8)', border: '1px solid rgba(255,60,172,0.2)' }}>
        <p className="text-2xl mb-2">😔</p>
        <p className="text-sm font-semibold text-[#ff3cac]">Event is Full</p>
        <p className="text-xs text-[#4d7a90] mt-1">No spots remaining</p>
      </div>
    );
  }

  if (!props.isAccepting) {
    return (
      <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(12,26,31,0.8)', border: '1px solid rgba(0,229,204,0.08)' }}>
        <p className="text-2xl mb-2" style={{ color: '#ff3cac' }}>⊗</p>
        <p className="text-sm font-semibold text-[#4d7a90]">RSVPs Closed</p>
      </div>
    );
  }
  return <RSVPForm eventId={props.eventId} title={props.title} eventDate={props.eventDate} eventEndDate={props.eventEndDate} eventLocation={props.eventLocation} eventSlug={props.eventSlug} requiresCertification={props.requiresCertification} certificationNote={props.certificationNote} customQuestions={props.customQuestions} confirmationMessage={props.confirmationMessage} promoCodes={props.promoCodes} />;

}
