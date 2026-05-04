import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ events: [] });

  const saved = await db.savedEvent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      event: {
        select: {
          id: true, slug: true, title: true, status: true, date: true,
          location: true, isOnline: true, bannerImage: true, category: true,
          ageGate: true, maxAttendees: true, eventTheme: true, dressCode: true,
          host: { select: { name: true, company: true } },
          _count: { select: { rsvps: true } },
        },
      },
    },
  });

  return NextResponse.json({ events: saved.map((s) => s.event) });
}
