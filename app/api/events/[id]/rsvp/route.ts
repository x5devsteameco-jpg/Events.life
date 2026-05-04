import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rsvpSchema } from '@/lib/validations';
import { sendRSVPConfirmation } from '@/lib/email';
import { auth } from '@/lib/auth';

// ── In-process rate limiter (per IP, resets on server restart) ─────────────
// For production use Upstash Redis or similar distributed store
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 RSVPs per IP per minute
const ipBucket = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipBucket.get(ip);
  if (!entry || entry.reset < now) {
    ipBucket.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// Prune old entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipBucket.entries()) {
    if (val.reset < now) ipBucket.delete(key);
  }
}, 5 * 60_000);

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment and try again.' }, { status: 429 });
  }

  try {
    const event = await db.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    if (event.status !== 'LIVE') {
      return NextResponse.json({ error: 'This event is not accepting RSVPs' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = rsvpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const { guestName, guestEmail, storeName, storeAddress, brand, position, answers } = parsed.data;

    // Check for duplicate RSVP
    const existing = await db.rSVP.findFirst({ where: { eventId: id, guestEmail: guestEmail.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'You have already RSVP\'d to this event' }, { status: 409 });
    }

    // Check capacity
    let status: 'CONFIRMED' | 'WAITLISTED' = 'CONFIRMED';
    if (event.maxAttendees) {
      const count = await db.rSVP.count({ where: { eventId: id, status: 'CONFIRMED' } });
      if (count >= event.maxAttendees) {
        status = 'WAITLISTED';
      }
    }

    const rsvp = await db.rSVP.create({
      data: {
        eventId: id,
        guestName,
        guestEmail: guestEmail.toLowerCase(),
        storeName,
        storeAddress,
        brand,
        position,
        answers: answers ? JSON.stringify(answers) : undefined,
        status,
      },
    });

    // Send confirmation email (non-blocking)
    sendRSVPConfirmation(rsvp, event).catch((err) => console.error('[email] RSVP confirmation:', err));

    return NextResponse.json({ data: rsvp }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/events/[id]/rsvp]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const event = await db.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (event.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const allowedStatuses = ['PENDING', 'CONFIRMED', 'WAITLISTED', 'CANCELLED'] as const;
    const statusFilter = allowedStatuses.includes(statusParam as (typeof allowedStatuses)[number])
      ? (statusParam as (typeof allowedStatuses)[number])
      : undefined;
    const search = searchParams.get('q')?.trim() ?? '';

    const rsvps = await db.rSVP.findMany({
      where: {
        eventId: id,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search ? {
          OR: [
            { guestName: { contains: search } },
            { guestEmail: { contains: search } },
            { storeName: { contains: search } },
            { brand: { contains: search } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: rsvps });
  } catch (error) {
    console.error('[GET /api/events/[id]/rsvp]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
