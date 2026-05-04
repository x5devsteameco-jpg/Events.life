import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { DEFAULT_SITE_ASSETS } from '@/lib/admin-defaults';
import { recordAdminChange, requireAdmin } from '@/lib/admin';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const existing = await db.siteAsset.findMany({ orderBy: { label: 'asc' } });
  if (existing.length > 0) return NextResponse.json({ data: existing });

  const seeded = await Promise.all(
    DEFAULT_SITE_ASSETS.map((asset) =>
      db.siteAsset.create({ data: { id: crypto.randomUUID(), ...asset, metadata: null, updatedBy: session.user.id } })
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
    type: string;
    url: string;
    alt?: string;
    metadata?: string;
  };

  if (!body.key || !body.label || !body.url || !body.type) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const before = await db.siteAsset.findUnique({ where: { key: body.key } });
  const updated = await db.siteAsset.upsert({
    where: { key: body.key },
    update: { label: body.label, type: body.type, url: body.url, alt: body.alt, metadata: body.metadata, updatedBy: session.user.id },
    create: { id: crypto.randomUUID(), key: body.key, label: body.label, type: body.type, url: body.url, alt: body.alt, metadata: body.metadata, updatedBy: session.user.id },
  });

  await recordAdminChange({
    actorUserId: session.user.id,
    targetType: 'SiteAsset',
    targetId: updated.id,
    action: before ? 'update' : 'create',
    summary: `${before ? 'Updated' : 'Created'} site asset ${updated.key}`,
    payloadBefore: before,
    payloadAfter: updated,
  });

  return NextResponse.json({ data: updated });
}
