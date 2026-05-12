import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { eventSchema } from '@/lib/validations';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const event = await db.event.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, email: true, company: true } },
        rsvps: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        _count: { select: { rsvps: true } },
      },
    });

    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (event.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error('[GET /api/events/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = eventSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const d = parsed.data;
    const updated = await db.event.update({
      where: { id },
      data: {
        ...(d.title !== undefined && { title: d.title }),
        ...(d.description !== undefined && { description: d.description }),
        ...(d.date !== undefined && { date: new Date(d.date) }),
        ...(d.endDate !== undefined && { endDate: d.endDate ? new Date(d.endDate) : null }),
        ...(d.location !== undefined && { location: d.location }),
        ...(d.address !== undefined && { address: d.address }),
        ...(d.isOnline !== undefined && { isOnline: d.isOnline }),
        ...(d.onlineLink !== undefined && { onlineLink: d.onlineLink }),
        ...(d.bannerImage !== undefined && { bannerImage: d.bannerImage }),
        ...(d.maxAttendees !== undefined && { maxAttendees: d.maxAttendees }),
        ...(d.status !== undefined && { status: d.status }),
        ...(d.visibility !== undefined && { visibility: d.visibility }),
        ...(d.ageGate !== undefined && { ageGate: d.ageGate }),
        ...(d.requiresCertification !== undefined && { requiresCertification: d.requiresCertification }),
        ...(d.certificationNote !== undefined && { certificationNote: d.certificationNote }),
        ...(d.thingsToKnow !== undefined && { thingsToKnow: d.thingsToKnow }),
        ...(d.category !== undefined && { category: d.category }),
        ...(d.customQuestions !== undefined && {
          customQuestions: d.customQuestions ? JSON.stringify(d.customQuestions) : null,
        }),
        ...(d.parkingAvailable !== undefined && { parkingAvailable: d.parkingAvailable }),
        ...(d.parkingNotes !== undefined && { parkingNotes: d.parkingNotes }),
        ...(d.waitlistEnabled !== undefined && { waitlistEnabled: d.waitlistEnabled }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PATCH /api/events/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/events/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
