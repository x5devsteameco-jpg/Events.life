import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promoteFromWaitlist } from '@/lib/waitlist';

// GET /api/rsvp/lookup?email=...&slug=...
// Allows a guest to look up their RSVP status by email + event slug (no auth required)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.trim().toLowerCase();
  const slug = searchParams.get('slug')?.trim();

  if (!email || !slug) {
    return NextResponse.json({ error: 'email and slug are required' }, { status: 400 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  try {
    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, title: true, date: true, slug: true, status: true, location: true, isOnline: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const rsvp = await db.rSVP.findFirst({
      where: { eventId: event.id, guestEmail: email },
      select: { id: true, guestName: true, guestEmail: true, status: true, createdAt: true },
    });

    if (!rsvp) {
      return NextResponse.json({ error: 'No RSVP found for this email and event' }, { status: 404 });
    }

    // Calculate waitlist position if waitlisted
    let waitlistPosition: number | null = null;
    if (rsvp.status === 'WAITLISTED') {
      const earlier = await db.rSVP.count({
        where: {
          eventId: event.id,
          status: 'WAITLISTED',
          createdAt: { lt: rsvp.createdAt },
        },
      });
      waitlistPosition = earlier + 1;
    }

    return NextResponse.json({
      data: {
        rsvp: { id: rsvp.id, guestName: rsvp.guestName, status: rsvp.status, createdAt: rsvp.createdAt, waitlistPosition },
        event: { title: event.title, date: event.date, slug: event.slug, location: event.location, isOnline: event.isOnline },
      },
    });
  } catch (error) {
    console.error('[GET /api/rsvp/lookup]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/rsvp/lookup  — cancel RSVP
// Body: { email, slug }  — no auth needed; matched by email + event
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; slug?: string };
    const email = body.email?.trim().toLowerCase();
    const slug = body.slug?.trim();

    if (!email || !slug) {
      return NextResponse.json({ error: 'email and slug are required' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, title: true, date: true, slug: true, waitlistEnabled: true, maxAttendees: true, status: true, visibility: true, isOnline: true, hostId: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const rsvp = await db.rSVP.findFirst({
      where: { eventId: event.id, guestEmail: email },
    });

    if (!rsvp) {
      return NextResponse.json({ error: 'No RSVP found for this email and event' }, { status: 404 });
    }

    if (rsvp.status === 'CANCELLED') {
      return NextResponse.json({ error: 'RSVP is already cancelled' }, { status: 400 });
    }

    // Check if event already passed
    if (event.date < new Date()) {
      return NextResponse.json({ error: 'Cannot cancel RSVP for a past event' }, { status: 400 });
    }

    await db.rSVP.update({
      where: { id: rsvp.id },
      data: { status: 'CANCELLED' },
    });

    // If they were confirmed, try to promote next waitlisted person
    if (rsvp.status === 'CONFIRMED') {
      promoteFromWaitlist(event as import('@/lib/types').Event).catch((err) =>
        console.error('[waitlist] promote after guest cancel:', err)
      );
    }

    return NextResponse.json({ data: { message: 'RSVP cancelled successfully' } });
  } catch (error) {
    console.error('[DELETE /api/rsvp/lookup]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
