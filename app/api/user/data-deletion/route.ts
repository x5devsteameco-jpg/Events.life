import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * POST /api/user/data-deletion
 * Submits a data deletion (right-to-erasure / PIPEDA access-to-deletion) request.
 * Creates a record in the DeletionRequest table for manual review within 30 days.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check for an existing pending request
    const existing = await db.deletionRequest.findFirst({
      where: { userId: session.user.id, status: 'PENDING' },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A deletion request is already pending for this account.' },
        { status: 409 }
      );
    }

    await db.deletionRequest.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: 'Your data deletion request has been received. We will process it within 30 days as required by PIPEDA.',
    });
  } catch (error) {
    console.error('[POST /api/user/data-deletion]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/user/data-deletion
 * Returns the status of the current user's data deletion request, if any.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const request = await db.deletionRequest.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { status: true, createdAt: true },
    });

    return NextResponse.json({ data: request ?? null });
  } catch (error) {
    console.error('[GET /api/user/data-deletion]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
