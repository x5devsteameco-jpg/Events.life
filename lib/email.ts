import { Resend } from 'resend';
import type { Event, RSVP } from '@/lib/types';
import { formatDate, formatDateRange } from '@/lib/utils';

const FROM_EMAIL = process.env.FROM_EMAIL || 'Gatewise Events <noreply@gatewise.events>';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

async function sendEmail(payload: Parameters<Resend['emails']['send']>[0]) {
  const resend = getResendClient();
  await resend.emails.send(payload);
}

function emailFrame(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#020408;color:#e8f4f8;font-family:Inter,-apple-system,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
    <div style="font-size:24px;font-weight:800;color:#00e5cc;margin-bottom:20px;">Gatewise Events</div>
    <div style="background:#0c1a1f;border:1px solid rgba(0,229,204,0.2);border-radius:14px;padding:24px;">
      ${body}
    </div>
    <p style="font-size:12px;color:#4d7a90;margin-top:16px;">Built in Canada 🍁</p>
  </div>
</body>
</html>`;
}

export async function sendRSVPConfirmation(rsvp: RSVP, event: Event): Promise<void> {
  const eventUrl = `${BASE_URL}/event/${event.slug}`;
  const dateStr = event.endDate
    ? formatDateRange(event.date, event.endDate)
    : formatDate(event.date, 'EEE, MMM d, yyyy · h:mm a');

  const html = emailFrame(
    `RSVP Confirmed — ${event.title}`,
    `
      <h1 style="margin:0 0 8px;font-size:24px;">${event.title}</h1>
      <p style="margin:0 0 16px;color:#7aafc4;">📅 ${dateStr}</p>
      <p style="margin:0 0 12px;color:#00e5cc;font-weight:700;">✅ You're on the list, ${rsvp.guestName}!</p>
      <p style="margin:0 0 20px;color:#7aafc4;">Status: ${rsvp.status}</p>
      <a href="${eventUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:linear-gradient(135deg,#00c4a8,#00e5cc);color:#020408;text-decoration:none;font-weight:700;">View Event Details</a>
      <p style="margin-top:18px;font-size:12px;color:#4d7a90;">You're receiving this because you RSVP'd to an event on Gatewise Events.</p>
    `
  );

  await sendEmail({
    from: FROM_EMAIL,
    to: rsvp.guestEmail,
    subject: `✅ RSVP Confirmed: ${event.title}`,
    html,
  });
}

export async function sendEventInvite(email: string, event: Event, hostName: string): Promise<void> {
  const rsvpUrl = `${BASE_URL}/event/${event.slug}`;
  const dateStr = event.endDate
    ? formatDateRange(event.date, event.endDate)
    : formatDate(event.date, 'EEE, MMM d, yyyy · h:mm a');

  const html = emailFrame(
    `You're Invited — ${event.title}`,
    `
      <p style="margin:0 0 8px;color:#7aafc4;">${hostName} invited you to:</p>
      <h1 style="margin:0 0 8px;font-size:24px;">${event.title}</h1>
      <p style="margin:0 0 16px;color:#7aafc4;">📅 ${dateStr}</p>
      <a href="${rsvpUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:linear-gradient(135deg,#00c4a8,#00e5cc);color:#020408;text-decoration:none;font-weight:700;">RSVP Now</a>
      <p style="margin-top:18px;font-size:12px;color:#4d7a90;">You were invited by ${hostName} via Gatewise Events.</p>
    `
  );

  await sendEmail({
    from: FROM_EMAIL,
    to: email,
    subject: `🎟️ You're invited: ${event.title}`,
    html,
  });
}

export async function sendEventUpdate(rsvp: RSVP, event: Event, updateMessage: string): Promise<void> {
  const eventUrl = `${BASE_URL}/event/${event.slug}`;

  const html = emailFrame(
    `Event Update — ${event.title}`,
    `
      <h1 style="margin:0 0 8px;font-size:24px;">${event.title}</h1>
      <p style="margin:0 0 16px;color:#7aafc4;">${updateMessage}</p>
      <a href="${eventUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:linear-gradient(135deg,#00c4a8,#00e5cc);color:#020408;text-decoration:none;font-weight:700;">View Event Details</a>
      <p style="margin-top:18px;font-size:12px;color:#4d7a90;">You're receiving this because you RSVP'd to an event on Gatewise Events.</p>
    `
  );

  await sendEmail({
    from: FROM_EMAIL,
    to: rsvp.guestEmail,
    subject: `📢 Update: ${event.title}`,
    html,
  });
}
