import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { inviteSchema } from '@/lib/validations';
import { sendEventInvite } from '@/lib/email';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
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

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const { emails } = parsed.data;
    // Send invites in batches of 10
    const results: { email: string; sent: boolean }[] = [];
    for (const email of emails) {
      try {
        await sendEventInvite(email, event, session.user.name ?? session.user.email ?? 'Event Host');
        results.push({ email, sent: true });
      } catch {
        results.push({ email, sent: false });
      }
    }

    const sent = results.filter((r) => r.sent).length;
    return NextResponse.json({ success: true, sent, failed: emails.length - sent });
  } catch (error) {
    console.error('[POST /api/events/[id]/invite]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
