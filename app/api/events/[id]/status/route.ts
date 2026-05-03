import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendEventInvite } from '@/lib/email';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = await db.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { status } = await req.json();
  const allowed = ['DRAFT', 'LIVE', 'PRIVATE', 'CANCELLED', 'ENDED'] as const;
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const wasLive = event.status !== 'LIVE' && status === 'LIVE';

  const updated = await db.event.update({
    where: { id },
    data: {
      status,
      publishedAt: wasLive ? new Date() : event.publishedAt,
    },
  });

  // Auto-send invites when first publishing to LIVE
  if (wasLive && event.emailInviteList) {
    const emails = event.emailInviteList
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@'));
    const hostName = session.user.name ?? session.user.email ?? 'Event Host';
    for (const email of emails) {
      sendEventInvite(email, event, hostName).catch(() => null);
    }
  }

  return NextResponse.json({ data: updated });
}
