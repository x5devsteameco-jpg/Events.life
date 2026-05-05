import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Badge, statusToBadgeVariant } from '@/components/ui/badge';
import { BrandLogo } from '@/components/brand/logo';
import { FadeIn } from '@/components/ui/fade-in';
import { FollowOrganizerButton } from '@/components/events/follow-organizer-button';
import type { EventStatus } from '@/lib/types';

export const revalidate = 60; // ISR

const THEME_ACCENT: Record<string, string> = {
  teal:    '#00c4a8',
  violet:  '#9c6bff',
  rose:    '#e83d9b',
  amber:   '#e8940a',
  sky:     '#29aadf',
  emerald: '#10b981',
};

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const users = await db.user.findMany({
    where: { role: { in: ['HOST', 'ADMIN'] } },
    select: { id: true },
    take: 100,
  });
  return users.map((u) => ({ id: u.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, select: { name: true, company: true } });
  if (!user) return { title: 'Organizer Not Found' };
  return { title: `${user.name ?? user.company ?? 'Organizer'} — Gatewise Events` };
}

export default async function OrganizerProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const [organizer, followerCount, isFollowing] = await Promise.all([
    db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        company: true,
        position: true,
        bio: true,
        image: true,
        organizerLogo: true,
        bannerUrl: true,
        themePreset: true,
        instagram: true,
        linkedin: true,
        website: true,
        twitter: true,
        createdAt: true,
        hostedEvents: {
          where: { status: { in: ['LIVE'] }, visibility: 'PUBLIC' },
          orderBy: { date: 'asc' },
          take: 20,
          include: { _count: { select: { rsvps: true } } },
        },
      },
    }),
    db.organizerFollow.count({ where: { organizerId: id } }),
    session?.user?.id
      ? db.organizerFollow.findUnique({
          where: { followerId_organizerId: { followerId: session.user.id, organizerId: id } },
        }).then(Boolean)
      : Promise.resolve(false),
  ]);

  if (!organizer) notFound();

  const accent = THEME_ACCENT[organizer.themePreset ?? 'teal'] ?? '#00e5cc';
  const accent08 = `${accent}14`;
  const accent20 = `${accent}33`;
  const isSelf = session?.user?.id === id;
  const totalRsvps = organizer.hostedEvents.reduce((sum, e) => sum + e._count.rsvps, 0);

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

      {/* Organizer Hero Banner */}
      <div className="relative overflow-hidden" style={{ minHeight: '240px' }}>
        {organizer.bannerUrl ? (
          <div className="absolute inset-0">
            <Image src={organizer.bannerUrl} alt="Organizer banner" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(2,4,8,0.2) 0%, rgba(2,4,8,0.85) 100%)' }} />
          </div>
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}12 0%, rgba(2,4,8,0) 70%)` }} />
            <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
              <svg width="100%" height="100%"><defs><pattern id="org-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke={accent} strokeWidth="0.6"/></pattern></defs><rect width="100%" height="100%" fill="url(#org-grid)"/></svg>
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto px-6 py-12">
          <FadeIn>
            <div className="flex items-end gap-5 flex-wrap justify-between">
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

            {/* Follow / Edit button */}
            {!isSelf && (
              <div className="flex-shrink-0 mb-1">
                <FollowOrganizerButton organizerId={id} initialFollowing={isFollowing} initialCount={followerCount} />
              </div>
            )}
            {isSelf && (
              <Link href="/dashboard/settings"
                className="px-4 py-2 rounded-full text-sm font-semibold text-[#4d7a90] border transition-colors mb-1"
                style={{ border: `1px solid ${accent20}` }}>
                Edit Profile
              </Link>
            )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="text-xs text-[#4d7a90]"><span className="font-bold text-[#7db3c4]">{organizer.hostedEvents.length}</span> events</span>
              <span className="text-xs text-[#4d7a90]"><span className="font-bold text-[#7db3c4]">{totalRsvps}</span> total attendees</span>
              <span className="text-xs text-[#4d7a90]"><span className="font-bold text-[#7db3c4]">{followerCount}</span> followers</span>
              <span className="text-xs text-[#4d7a90]">Member since {new Date(organizer.createdAt).getFullYear()}</span>
            </div>
            {organizer.bio && (
              <p className="mt-5 text-sm text-[#7aafc4] leading-relaxed max-w-2xl border-t pt-5" style={{ borderColor: accent20 }}>
                {organizer.bio}
              </p>
            )}

            {/* Social links */}
            {(organizer.instagram || organizer.twitter || organizer.linkedin || organizer.website) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {organizer.instagram && (
                  <a href={`https://instagram.com/${organizer.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                    style={{ background: `${accent}12`, border: `1px solid ${accent}28`, color: accent }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
                    @{organizer.instagram.replace(/^@/, '')}
                  </a>
                )}
                {organizer.twitter && (
                  <a href={`https://x.com/${organizer.twitter.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                    style={{ background: `${accent}12`, border: `1px solid ${accent}28`, color: accent }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    @{organizer.twitter.replace(/^@/, '')}
                  </a>
                )}
                {organizer.linkedin && (
                  <a href={organizer.linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                    style={{ background: `${accent}12`, border: `1px solid ${accent}28`, color: accent }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                  </a>
                )}
                {organizer.website && (
                  <a href={organizer.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                    style={{ background: `${accent}12`, border: `1px solid ${accent}28`, color: accent }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Website
                  </a>
                )}
              </div>
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
