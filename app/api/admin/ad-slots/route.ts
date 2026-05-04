import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { DEFAULT_AD_SLOTS } from '@/lib/admin-defaults';
import { recordAdminChange, requireAdmin } from '@/lib/admin';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const existing = await db.adSlot.findMany({ orderBy: [{ priority: 'desc' }, { label: 'asc' }] });
  if (existing.length > 0) return NextResponse.json({ data: existing });

  const seeded = await Promise.all(
    DEFAULT_AD_SLOTS.map((slot) =>
      db.adSlot.create({ data: { id: crypto.randomUUID(), ...slot, updatedBy: session.user.id } })
    )
  );
  return NextResponse.json({ data: seeded });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as {
    key: string;
    label: string;
    headline?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    imageUrl?: string;
    active: boolean;
    priority?: number;
  };

  if (!body.key || !body.label || typeof body.active !== 'boolean') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const before = await db.adSlot.findUnique({ where: { key: body.key } });
  const updated = await db.adSlot.upsert({
    where: { key: body.key },
    update: {
      label: body.label,
      headline: body.headline,
      body: body.body,
      ctaLabel: body.ctaLabel,
      ctaHref: body.ctaHref,
      imageUrl: body.imageUrl,
      active: body.active,
      priority: body.priority ?? 0,
      updatedBy: session.user.id,
    },
    create: {
      id: crypto.randomUUID(),
      key: body.key,
      label: body.label,
      headline: body.headline,
      body: body.body,
      ctaLabel: body.ctaLabel,
      ctaHref: body.ctaHref,
      imageUrl: body.imageUrl,
      active: body.active,
      priority: body.priority ?? 0,
      updatedBy: session.user.id,
    },
  });

  await recordAdminChange({
    actorUserId: session.user.id,
    targetType: 'AdSlot',
    targetId: updated.id,
    action: before ? 'update' : 'create',
    summary: `${before ? 'Updated' : 'Created'} ad slot ${updated.key}`,
    payloadBefore: before,
    payloadAfter: updated,
  });

  return NextResponse.json({ data: updated });
}
