import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendAnnouncement } from '@/lib/email';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const event = await db.event.findUnique({
    where: { id },
    select: { hostId: true, title: true, slug: true },
  });
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.hostId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { subject?: string; message?: string; statusFilter?: string };
  if (!body.subject?.trim() || !body.message?.trim()) {
    return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
  }
  if (body.subject.length > 120) {
    return NextResponse.json({ error: 'Subject must be 120 characters or fewer' }, { status: 400 });
  }

  const statusFilter = body.statusFilter ?? 'CONFIRMED';
  const allowedStatuses = ['CONFIRMED', 'WAITLISTED', 'ALL'];
  if (!allowedStatuses.includes(statusFilter)) {
    return NextResponse.json({ error: 'Invalid statusFilter' }, { status: 400 });
  }

  const whereStatus = statusFilter === 'ALL'
    ? { in: ['CONFIRMED', 'WAITLISTED'] }
    : { equals: statusFilter };

  const rsvps = await db.rSVP.findMany({
    where: { eventId: id, status: whereStatus as never },
    select: { guestEmail: true, guestName: true },
  });

  if (rsvps.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const rsvp of rsvps) {
    try {
      await sendAnnouncement({
        to: rsvp.guestEmail,
        name: rsvp.guestName,
        subject: body.subject.trim(),
        message: body.message.trim(),
        eventTitle: event.title,
        eventSlug: event.slug,
        organizerName: session.user.name ?? session.user.email ?? 'Your Event Organizer',
      });
      sent++;
    } catch {
      errors.push(rsvp.guestEmail);
    }
  }

  return NextResponse.json({ ok: true, sent, failed: errors.length });
}
