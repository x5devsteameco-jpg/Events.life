import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { eventSchema } from '@/lib/validations';
import { generateEventSlug } from '@/lib/utils';
import { sendEventInvite } from '@/lib/email';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const d = parsed.data;
    const baseSlug = d.customSlug?.trim() ? d.customSlug.trim() : generateEventSlug(d.title);

    // Ensure slug uniqueness
    let slug = baseSlug;
    let attempt = 0;
    while (await db.event.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const event = await db.event.create({
      data: {
        title: d.title,
        slug,
        description: d.description,
        date: new Date(d.date),
        endDate: d.endDate ? new Date(d.endDate) : null,
        location: d.location,
        address: d.address,
        isOnline: d.isOnline ?? false,
        onlineLink: d.onlineLink,
        bannerImage: d.bannerImage,
        maxAttendees: d.maxAttendees,
        status: d.status ?? 'DRAFT',
        visibility: d.visibility ?? 'PUBLIC',
        ageGate: d.ageGate ?? 0,
        requiresCertification: d.requiresCertification ?? false,
        certificationNote: d.certificationNote,
        thingsToKnow: d.thingsToKnow,
        dressCode: d.dressCode,
        eventTheme: d.eventTheme,
        category: d.category,
        maxTicketsPerPerson: d.maxTicketsPerPerson,
        customQuestions: d.customQuestions ? JSON.stringify(d.customQuestions) : null,
        faqs: d.faqs ? JSON.stringify(d.faqs) : null,
        speakers: d.speakers ? JSON.stringify(d.speakers) : null,
        agenda: d.agenda ? JSON.stringify(d.agenda) : null,
        promoCodes: d.promoCodes && d.promoCodes.length > 0 ? JSON.stringify(d.promoCodes) : null,
        parkingAvailable: d.parkingAvailable ?? false,
        parkingNotes: d.parkingNotes,
        hostId: session.user.id,
        emailInviteList: d.emailInviteList,
        confirmationMessage: d.confirmationMessage || null,
        publishedAt: d.status === 'LIVE' ? new Date() : null,
        tickets: d.ticketTiers?.length
          ? {
              create: d.ticketTiers.map((t: { name: string; description?: string; price?: string | number; isFree?: boolean; quantity?: string | number; unlimited?: boolean }) => ({
                name: t.name || 'General Admission',
                description: t.description ?? null,
                price: t.isFree ? 0 : parseFloat(String(t.price ?? 0)) || 0,
                isFree: t.isFree ?? true,
                quantity: t.unlimited ? null : (parseInt(String(t.quantity ?? '')) || null),
                quantitySold: 0,
                isVisible: true,
              })),
            }
          : undefined,
      },
    });

    // Auto-send invites when launching LIVE
    if (d.status === 'LIVE' && d.emailInviteList) {
      const emails = d.emailInviteList
        .split(/[\n,]+/)
        .map((e: string) => e.trim())
        .filter((e: string) => e.includes('@'));
      const hostName = session.user.name ?? session.user.email ?? 'Event Host';
      for (const email of emails) {
        sendEventInvite(email, event, hostName).catch(() => null);
      }
    }

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/events]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
  const statusParam = searchParams.get('status');
  const allowedStatuses = ['DRAFT', 'LIVE', 'PRIVATE', 'CANCELLED', 'ENDED'] as const;
  const status = allowedStatuses.includes(statusParam as (typeof allowedStatuses)[number])
    ? (statusParam as (typeof allowedStatuses)[number])
    : undefined;

  try {
    const [events, total] = await Promise.all([
      db.event.findMany({
        where: {
          hostId: session.user.id,
          ...(status ? { status } : {}),
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { rsvps: true } },
        },
      }),
      db.event.count({
        where: { hostId: session.user.id, ...(status ? { status } : {}) },
      }),
    ]);

    return NextResponse.json({ data: events, total, page, limit });
  } catch (error) {
    console.error('[GET /api/events]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
