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
  const events = await db.event.findMany({
    where: { status: 'LIVE', visibility: 'PUBLIC' },
    select: { slug: true },
    take: 200,
  });
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
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
}

export default async function PublicEventPage({ params }: Props) {
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      host: { select: { id: true, name: true, company: true, image: true, position: true, bio: true, organizerLogo: true, themePreset: true } },
      _count: { select: { rsvps: true } },
    },
  });

  if (!event || event.status === 'DRAFT') notFound();

  const confirmedCount = await db.rSVP.count({ where: { eventId: event.id, status: 'CONFIRMED' } });
  const isFull = event.maxAttendees ? confirmedCount >= event.maxAttendees : false;
  const isAccepting = event.status === 'LIVE' && !isFull;

  const parsedQuestions = (() => {
    try { return event.customQuestions ? JSON.parse(event.customQuestions as string) : []; }
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
      <div
      className="min-h-screen"
      style={{
        background: '#020408',
        '--theme-accent': THEME_ACCENT[event.host.themePreset ?? 'teal'] ?? '#00e5cc',
        '--theme-accent-08': `${THEME_ACCENT[event.host.themePreset ?? 'teal'] ?? '#00e5cc'}14`,
        '--theme-accent-20': `${THEME_ACCENT[event.host.themePreset ?? 'teal'] ?? '#00e5cc'}33`,
      } as React.CSSProperties}
    >
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30" style={{ background: 'rgba(2,4,8,0.88)', backdropFilter: 'blur(20px)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <Link href="/">
          <BrandLogo size="sm" textClassName="text-sm" />
        </Link>
        <div className="flex items-center gap-3">
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.host.organizerLogo} alt="Organizer logo" className="h-10 max-w-[100px] object-contain rounded flex-shrink-0" />
                ) : event.host.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.host.image} alt={event.host.name ?? 'Host'} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
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
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.location, event.address].filter(Boolean).join(', '))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#00e5cc] hover:underline"
                      >
                        View on Maps ↗
                      </a>
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
                  <span>📋</span> Things to Know / Bring
                </h3>
                <p className="text-sm text-[#6b9bb0] whitespace-pre-line leading-relaxed">{event.thingsToKnow}</p>
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

            {/* FAQ */}
            {event.faqs && (() => {
              let faqList: { id: string; question: string; answer: string }[] = [];
              try { faqList = JSON.parse(event.faqs as string); } catch { /* ignore */ }
              return faqList.length > 0 ? <FAQAccordion faqs={faqList} /> : null;
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
        <p className="text-2xl mb-2">🚫</p>
        <p className="text-sm font-semibold text-[#4d7a90]">RSVPs Closed</p>
      </div>
    );
  }
  return <RSVPForm eventId={props.eventId} title={props.title} eventDate={props.eventDate} eventEndDate={props.eventEndDate} eventLocation={props.eventLocation} eventSlug={props.eventSlug} requiresCertification={props.requiresCertification} certificationNote={props.certificationNote} customQuestions={props.customQuestions} confirmationMessage={props.confirmationMessage} />;

}
