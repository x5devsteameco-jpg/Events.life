import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await db.event.findUnique({ where: { id }, select: { id: true } });
    if (!event) return NextResponse.json({ ok: false }, { status: 404 });

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
    const referer = req.headers.get('referer') ?? 'Direct';

    await db.eventPageView.create({
      data: {
        id: crypto.randomUUID(),
        eventId: event.id,
        ipHash,
        referer: referer.slice(0, 500),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
