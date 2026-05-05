import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const revalidate = 60;

export async function GET() {
  try {
    const events = await db.event.findMany({
      where: { status: 'LIVE', visibility: 'PUBLIC', date: { gte: new Date() } },
      orderBy: [{ rsvps: { _count: 'desc' } }, { date: 'asc' }],
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        date: true,
        location: true,
        isOnline: true,
        bannerImage: true,
        category: true,
        maxAttendees: true,
        _count: { select: { rsvps: true } },
        host: { select: { name: true, organizerLogo: true } },
      },
    });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json([]);
  }
}
