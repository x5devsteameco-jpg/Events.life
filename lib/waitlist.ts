import { db } from '@/lib/db';
import { sendWaitlistPromotion } from '@/lib/email';
import type { Event } from '@/lib/types';

/**
 * If the event has a waitlist enabled and an open spot, promote the oldest
 * WAITLISTED RSVP to CONFIRMED and send them a notification email.
 *
 * Call this after any CONFIRMED RSVP is moved to CANCELLED.
 */
export async function promoteFromWaitlist(event: Event): Promise<void> {
  if (!event.waitlistEnabled || !event.maxAttendees) return;

  // Count current confirmed attendees
  const confirmedCount = await db.rSVP.count({
    where: { eventId: event.id, status: 'CONFIRMED' },
  });

  if (confirmedCount >= event.maxAttendees) return; // Still full

  // Find the next person on the waitlist (oldest first)
  const next = await db.rSVP.findFirst({
    where: { eventId: event.id, status: 'WAITLISTED' },
    orderBy: { createdAt: 'asc' },
  });

  if (!next) return;

  await db.rSVP.update({
    where: { id: next.id },
    data: { status: 'CONFIRMED' },
  });

  sendWaitlistPromotion(next, event).catch((err) =>
    console.error('[waitlist] promotion email failed:', err)
  );
}
