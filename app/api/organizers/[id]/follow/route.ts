import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organizerId } = await params;
  if (organizerId === session.user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  const existing = await db.organizerFollow.findUnique({
    where: { followerId_organizerId: { followerId: session.user.id, organizerId } },
  });
  if (existing) return NextResponse.json({ following: true });

  await db.organizerFollow.create({ data: { followerId: session.user.id, organizerId } });
  return NextResponse.json({ following: true }, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: organizerId } = await params;

  await db.organizerFollow.deleteMany({
    where: { followerId: session.user.id, organizerId },
  });
  return NextResponse.json({ following: false });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  const { id: organizerId } = await params;

  const followerCount = await db.organizerFollow.count({ where: { organizerId } });

  if (!session?.user?.id) return NextResponse.json({ followerCount, following: false });

  const record = await db.organizerFollow.findUnique({
    where: { followerId_organizerId: { followerId: session.user.id, organizerId } },
  });
  return NextResponse.json({ followerCount, following: !!record });
}
