import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const event = await db.event.findUnique({
      where: { id },
      select: { id: true, hostId: true, title: true },
    });

    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (event.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rsvps = await db.rSVP.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'asc' },
    });

    if (!rsvps.length) {
      return NextResponse.json({ error: 'No RSVPs found' }, { status: 404 });
    }

    // Build CSV header
    const headers = ['Name', 'Email', 'Store Name', 'Brand', 'Position', 'Status', 'Checked In', 'RSVP Date'];
    
    // Add custom question fields
    const sampleAnswers = (rsvps[0]?.answers as unknown as Record<string, string>) || {};
    const questionKeys = Object.keys(sampleAnswers).sort();
    headers.push(...questionKeys);

    // Build CSV rows
    const rows = rsvps.map((rsvp) => {
      const answers = (rsvp.answers as unknown as Record<string, string>) || {};
      const baseRow = [
        `"${rsvp.guestName.replace(/"/g, '""')}"`,
        `"${rsvp.guestEmail.replace(/"/g, '""')}"`,
        `"${(rsvp.storeName || '').replace(/"/g, '""')}"`,
        `"${(rsvp.brand || '').replace(/"/g, '""')}"`,
        `"${(rsvp.position || '').replace(/"/g, '""')}"`,
        rsvp.status,
        rsvp.checkedIn ? 'Yes' : 'No',
        rsvp.createdAt.toISOString().split('T')[0],
      ];
      const answerValues = questionKeys.map(
        (key) => `"${(answers[key] || '').replace(/"/g, '""')}"`,
      );
      return [...baseRow, ...answerValues].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    const filename = `${event.title.replace(/\s+/g, '-').toLowerCase()}-rsvps-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[export-rsvp] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
