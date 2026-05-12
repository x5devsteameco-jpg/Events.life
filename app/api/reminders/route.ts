import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEventReminder } from '@/lib/email';

/**
 * Send event reminders for all events happening in ~24 hours
 * Can be called by:
 * - External cron service (EasyCron, n8n, Make, etc.)
 * - Manual trigger via dashboard
 * - Future: Vercel Cron
 *
 * Query parameters:
 * - token: Admin API token (optional, for security)
 * - eventId: Send reminders for specific event only (optional)
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Validate admin token
    const authToken = req.headers.get('authorization')?.replace('Bearer ', '');
    const apiToken = process.env.REMINDER_API_TOKEN;
    if (apiToken && apiToken !== authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await req.json().catch(() => ({}));

    // Find events happening in approximately 24 hours
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    const events = await db.event.findMany({
      where: {
        ...(eventId && { id: eventId }),
        date: {
          gte: in23Hours,
          lte: in24Hours,
        },
        status: { in: ['LIVE', 'PRIVATE'] },
      },
      include: {
        rsvps: {
          where: { status: 'CONFIRMED' },
          select: { id: true, guestName: true, guestEmail: true },
        },
      },
    });

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No events found in the 24-hour reminder window',
        eventsChecked: 0,
        reminders: 0,
      });
    }

    let totalReminders = 0;
    const results: { eventTitle: string; attendees: number; sent: number; failed: number }[] = [];

    for (const event of events) {
      let sent = 0;
      let failed = 0;

      for (const rsvp of event.rsvps) {
        try {
          await sendEventReminder(
            {
              id: rsvp.id,
              guestName: rsvp.guestName,
              guestEmail: rsvp.guestEmail,
            } as any,
            event as any
          );
          sent++;
          totalReminders++;
        } catch (err) {
          console.error(`[reminder] failed for ${rsvp.guestEmail}:`, err);
          failed++;
        }
      }

      results.push({
        eventTitle: event.title,
        attendees: event.rsvps.length,
        sent,
        failed,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${totalReminders} reminders for ${events.length} event(s)`,
      eventsFound: events.length,
      reminders: totalReminders,
      results,
    });
  } catch (error) {
    console.error('[reminder-api] error:', error);
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for monitoring/testing
 * Returns summary of upcoming events that need reminders
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    const upcomingEvents = await db.event.findMany({
      where: {
        date: {
          gte: in23Hours,
          lte: in24Hours,
        },
        status: { in: ['LIVE', 'PRIVATE'] },
      },
      select: {
        id: true,
        title: true,
        date: true,
        _count: {
          select: {
            rsvps: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
    });

    return NextResponse.json({
      now: now.toISOString(),
      window: `${in23Hours.toISOString()} to ${in24Hours.toISOString()}`,
      eventsNeedingReminders: upcomingEvents.length,
      events: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        confirmedAttendees: e._count.rsvps,
      })),
    });
  } catch (error) {
    console.error('[reminder-api] GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
