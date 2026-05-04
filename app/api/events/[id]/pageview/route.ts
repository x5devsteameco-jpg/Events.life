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
    const body = await req.json().catch(() => ({}));

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
        path: typeof body.path === 'string' ? body.path.slice(0, 500) : null,
        utmSource: typeof body.utmSource === 'string' ? body.utmSource.slice(0, 120) : null,
        utmMedium: typeof body.utmMedium === 'string' ? body.utmMedium.slice(0, 120) : null,
        utmCampaign: typeof body.utmCampaign === 'string' ? body.utmCampaign.slice(0, 160) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
