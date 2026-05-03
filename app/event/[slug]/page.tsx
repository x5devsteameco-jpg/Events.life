import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import { RSVPForm } from '@/components/events/rsvp-form';
import { AgeGate } from '@/components/events/age-gate';
import { ShareButton } from '@/components/events/share-button';
import type { EventStatus } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await db.event.findUnique({ where: { slug } });
  if (!event) return { title: 'Event Not Found' };
  return {
    title: `${event.title} | Gatewise Events`,
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
      host: { select: { name: true, company: true } },
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

  return (
    <div className="min-h-screen" style={{ background: '#020408' }}>
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30" style={{ background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <Link href="/" className="text-[#00e5cc] font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>Gatewise Events</Link>
        <div className="flex items-center gap-3">
          <ShareButton title={event.title} />
          <Badge variant={statusToBadgeVariant(event.status as EventStatus)}>{event.status}</Badge>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Banner */}
        {event.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.bannerImage} alt={`${event.title} banner`} className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8" />
        ) : (
          <div className="w-full h-48 rounded-2xl mb-8 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,229,204,0.15), rgba(127,255,0,0.08), rgba(255,60,172,0.1))' }}>
            <span className="text-5xl">🎉</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Event Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start gap-3 mb-3 flex-wrap">
                <Badge variant={statusToBadgeVariant(event.status as EventStatus)}>{event.status === 'LIVE' ? 'Live' : event.status}</Badge>
                {event.category && <Badge variant="default">{event.category}</Badge>}
                {event.ageGate > 0 && <Badge variant="cancelled">{event.ageGate}+ Only</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#e8f4f8] leading-tight mb-3" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
                {event.title}
              </h1>
              <p className="text-[#4d7a90] text-sm">
                Hosted by <span className="text-[#00e5cc] font-medium">{event.host.name ?? event.host.company ?? 'Anonymous'}</span>
              </p>
            </div>

            {/* Key details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl space-y-1" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
                <p className="text-xs text-[#4d7a90] font-medium uppercase tracking-wider">Date & Time</p>
                <p className="text-sm text-[#e8f4f8] font-semibold">{formatDate(event.date)}</p>
                {event.endDate && <p className="text-xs text-[#4d7a90]">Until {formatDate(event.endDate)}</p>}
              </div>

              <div className="p-4 rounded-xl space-y-1" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
                <p className="text-xs text-[#4d7a90] font-medium uppercase tracking-wider">Location</p>
                {event.isOnline ? (
                  <p className="text-sm text-[#e8f4f8] font-semibold">Online Event</p>
                ) : (
                  <>
                    {event.location && <p className="text-sm text-[#e8f4f8] font-semibold">{event.location}</p>}
                    {event.address && <p className="text-xs text-[#4d7a90]">{event.address}</p>}
                    {event.parkingAvailable && <p className="text-xs text-[#7fff00]">Parking available</p>}
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-[#e8f4f8] uppercase tracking-wider">About This Event</h2>
                <p className="text-sm text-[#6b9bb0] leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Things to Know */}
            {event.thingsToKnow && (
              <div className="p-5 rounded-xl" style={{ background: 'rgba(127,255,0,0.04)', border: '1px solid rgba(127,255,0,0.12)' }}>
                <h3 className="text-sm font-bold text-[#7fff00] mb-2 flex items-center gap-2">
                  <span>📋</span> Things to Know / Bring
                </h3>
                <p className="text-sm text-[#6b9bb0] whitespace-pre-line leading-relaxed">{event.thingsToKnow}</p>
              </div>
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
              return faqList.length > 0 ? (
                <div>
                  <h3 className="text-sm font-bold text-[#00e5cc] mb-3 flex items-center gap-2"><span>❓</span> FAQ</h3>
                  <div className="space-y-2">
                    {faqList.map((faq) => (
                      <details key={faq.id} className="group rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,229,204,0.1)' }}>
                        <summary className="px-4 py-3 text-sm font-semibold text-[#e8f4f8] cursor-pointer flex items-center justify-between gap-2 hover:bg-[rgba(0,229,204,0.04)] transition-colors list-none">
                          <span>{faq.question}</span>
                          <svg className="flex-shrink-0 group-open:rotate-180 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                        </summary>
                        <div className="px-4 pb-3 pt-1 text-sm text-[#6b9bb0] leading-relaxed">{faq.answer}</div>
                      </details>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Capacity */}
            {event.maxAttendees && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1 h-1.5 rounded-full bg-[rgba(0,229,204,0.1)] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00e5cc] to-[#7fff00] transition-all" style={{ width: `${Math.min(100, (confirmedCount / event.maxAttendees) * 100)}%` }} />
                </div>
                <span className="text-[#4d7a90] text-xs whitespace-nowrap">{confirmedCount} / {event.maxAttendees} attending</span>
              </div>
            )}
          </div>

          {/* Right — RSVP */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {event.ageGate > 0 ? (
                <AgeGate minAge={event.ageGate}>
                  <RSVPFormWrapper
                    eventId={event.id}
                    title={event.title}
                    isAccepting={isAccepting}
                    isFull={isFull}
                    requiresCertification={event.requiresCertification}
                    certificationNote={event.certificationNote ?? ''}
                    customQuestions={parsedQuestions}
                  />
                </AgeGate>
              ) : (
                <RSVPFormWrapper
                  eventId={event.id}
                  title={event.title}
                  isAccepting={isAccepting}
                  isFull={isFull}
                  requiresCertification={event.requiresCertification}
                  certificationNote={event.certificationNote ?? ''}
                  customQuestions={parsedQuestions}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RSVPFormWrapper(props: {
  eventId: string;
  title: string;
  isAccepting: boolean;
  isFull: boolean;
  requiresCertification: boolean;
  certificationNote: string;
  customQuestions: import('@/lib/types').CustomQuestion[];
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

  return <RSVPForm eventId={props.eventId} title={props.title} requiresCertification={props.requiresCertification} certificationNote={props.certificationNote} customQuestions={props.customQuestions} />;
}
