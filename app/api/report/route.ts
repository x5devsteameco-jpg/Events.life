import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json() as { targetType: string; targetId: string; reason: string; details?: string };

  const { targetType, targetId, reason, details } = body;
  if (!targetType || !targetId || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await db.contentReport.create({
    data: {
      reporterId: session?.user?.id ?? null,
      targetType,
      targetId,
      reason,
      details: details ?? null,
    },
  });
  return NextResponse.json({ reported: true }, { status: 201 });
}
