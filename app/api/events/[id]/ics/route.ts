import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

function escapeICS(str: string): string {
  return str.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
}

function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return parts.join('\r\n');
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      endDate: true,
      location: true,
      isOnline: true,
      onlineLink: true,
      slug: true,
      status: true,
    },
  });

  if (!event || event.status === 'DRAFT' || event.status === 'CANCELLED') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const now = new Date();
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://gatewise-events.vercel.app';

  const locationStr = event.isOnline
    ? (event.onlineLink ?? 'Online Event')
    : (event.location ?? '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Events.life//Events.life//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@events.life`,
    `DTSTAMP:${toICSDate(now)}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    foldLine(`SUMMARY:${escapeICS(event.title)}`),
    event.description ? foldLine(`DESCRIPTION:${escapeICS(event.description)}`) : '',
    locationStr ? foldLine(`LOCATION:${escapeICS(locationStr)}`) : '',
    foldLine(`URL:${baseUrl}/event/${event.slug}`),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return new NextResponse(lines, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
