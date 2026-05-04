import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import { BrandLogo } from '@/components/brand/logo';
import { FadeIn } from '@/components/ui/fade-in';
import type { EventStatus } from '@/lib/types';

const THEME_ACCENT: Record<string, string> = {
  teal:    '#00e5cc',
  violet:  '#9c6bff',
  rose:    '#ff3cac',
  amber:   '#f59e0b',
  sky:     '#38bdf8',
  emerald: '#34d399',
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, select: { name: true, company: true } });
  if (!user) return { title: 'Organizer Not Found' };
  return { title: `${user.name ?? user.company ?? 'Organizer'} — Gatewise Events` };
}

export default async function OrganizerProfilePage({ params }: Props) {
  const { id } = await params;

  const organizer = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      company: true,
      position: true,
      bio: true,
      image: true,
      organizerLogo: true,
      themePreset: true,
      hostedEvents: {
        where: { status: { in: ['LIVE'] }, visibility: 'PUBLIC' },
        orderBy: { date: 'asc' },
        take: 20,
        include: {
          _count: { select: { rsvps: true } },
        },
      },
    },
  });

  if (!organizer) notFound();

  const accent = THEME_ACCENT[organizer.themePreset ?? 'teal'] ?? '#00e5cc';
  const accent08 = `${accent}14`;
  const accent20 = `${accent}33`;

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#020408',
        '--theme-accent': accent,
        '--theme-accent-08': accent08,
        '--theme-accent-20': accent20,
      } as React.CSSProperties}
    >
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30"
        style={{ background: 'rgba(2,4,8,0.88)', backdropFilter: 'blur(20px)', borderColor: 'rgba(0,229,204,0.1)' }}>
        <Link href="/">
          <BrandLogo size="sm" textClassName="text-sm" />
        </Link>
        <Link
          href="/events"
          className="text-xs text-[#4d7a90] hover:text-[#00e5cc] transition-colors"
        >
          Browse Events →
        </Link>
      </nav>

      {/* Organizer Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: '200px', background: `linear-gradient(135deg, ${accent}0d 0%, rgba(2,4,8,0) 60%)` }}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <FadeIn>
            <div className="flex items-center gap-5 flex-wrap">
              {organizer.organizerLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={organizer.organizerLogo}
                  alt={`${organizer.name ?? organizer.company} logo`}
                  className="h-16 max-w-[140px] object-contain rounded-xl flex-shrink-0"
                />
              ) : organizer.image ? (
                <Image
                  src={organizer.image}
                  alt={organizer.name ?? 'Organizer'}
                  width={64}
                  height={64}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-[#020408] flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}
                >
                  {(organizer.name?.[0] ?? organizer.company?.[0] ?? 'O').toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
                  {organizer.name ?? organizer.company ?? 'Anonymous Organizer'}
                </h1>
                {(organizer.position || organizer.company) && (
                  <p className="text-sm text-[#4d7a90] mt-1">
                    {[organizer.position, organizer.company].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
            {organizer.bio && (
              <p className="mt-5 text-sm text-[#7aafc4] leading-relaxed max-w-2xl border-t pt-5" style={{ borderColor: accent20 }}>
                {organizer.bio}
              </p>
            )}
          </FadeIn>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <FadeIn delay={0.1}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: accent }}>
            Upcoming Events ({organizer.hostedEvents.length})
          </h2>
        </FadeIn>

        {organizer.hostedEvents.length === 0 ? (
          <FadeIn delay={0.15}>
            <p className="text-sm text-[#4d7a90]">No public events at this time.</p>
          </FadeIn>
        ) : (
          <div className="space-y-4">
            {organizer.hostedEvents.map((event, i) => (
              <FadeIn key={event.id} delay={0.1 + i * 0.05}>
                <Link href={`/event/${event.slug}`} className="block group">
                  <div
                    className="p-5 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: 'rgba(12,26,31,0.6)',
                      border: `1px solid ${accent20}`,
                    }}
                  >
                    {event.bannerImage && (
                      <div className="relative rounded-xl overflow-hidden mb-4 aspect-[3/1]">
                        <Image src={event.bannerImage} alt={event.title} fill className="object-cover" sizes="680px" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,26,31,0.6) 0%, transparent 60%)' }} />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant={statusToBadgeVariant(event.status as EventStatus)}>{event.status}</Badge>
                          {event.category && <Badge variant="default">{event.category}</Badge>}
                          {event.ageGate > 0 && <Badge variant="cancelled">{event.ageGate}+</Badge>}
                        </div>
                        <h3 className="text-base font-bold text-[#e8f4f8] group-hover:text-[var(--theme-accent)] transition-colors truncate">{event.title}</h3>
                        <p className="text-xs text-[#4d7a90] mt-1">{formatDate(event.date)}</p>
                        {!event.isOnline && event.location && (
                          <p className="text-xs text-[#4d7a90]">{event.location}</p>
                        )}
                        {event.isOnline && <p className="text-xs text-[#4d7a90]">Online Event</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#4d7a90]">{event._count.rsvps} going</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
