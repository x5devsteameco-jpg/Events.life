import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: eventId } = await params;

  const existing = await db.savedEvent.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  });
  if (existing) return NextResponse.json({ saved: true });

  await db.savedEvent.create({ data: { userId: session.user.id, eventId } });
  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: eventId } = await params;

  await db.savedEvent.deleteMany({
    where: { userId: session.user.id, eventId },
  });
  return NextResponse.json({ saved: false });
}
