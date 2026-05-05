import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/user/data-export
 * Returns a structured JSON export of all personal data (PIPEDA data portability).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        position: true,
        bio: true,
        website: true,
        instagram: true,
        linkedin: true,
        createdAt: true,
        role: true,
        hostedEvents: {
          select: {
            id: true,
            title: true,
            slug: true,
            date: true,
            status: true,
            category: true,
            createdAt: true,
          },
        },
        rsvps: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            event: { select: { title: true, date: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      notice: 'This export contains all personal data associated with your Gatewise Events account.',
      account: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        position: user.position,
        bio: user.bio,
        website: user.website,
        instagram: user.instagram,
        linkedin: user.linkedin,
        memberSince: user.createdAt,
        role: user.role,
      },
      events: user.hostedEvents,
      rsvps: user.rsvps,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="gatewise-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/user/data-export]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
