import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { DEFAULT_FEATURE_FLAGS } from '@/lib/admin-defaults';
import { recordAdminChange, requireAdmin } from '@/lib/admin';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const existing = await db.featureFlag.findMany({ orderBy: [{ scope: 'asc' }, { label: 'asc' }] });
  if (existing.length > 0) return NextResponse.json({ data: existing });

  const seeded = await Promise.all(
    DEFAULT_FEATURE_FLAGS.map((flag) =>
      db.featureFlag.create({
        data: { id: crypto.randomUUID(), ...flag, updatedBy: session.user.id },
      })
    )
  );

  return NextResponse.json({ data: seeded });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { key, label, description, enabled, scope } = (await req.json()) as {
    key: string;
    label: string;
    description?: string;
    enabled: boolean;
    scope?: string;
  };

  if (!key || !label || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const before = await db.featureFlag.findUnique({ where: { key } });
  const updated = await db.featureFlag.upsert({
    where: { key },
    update: { label, description, enabled, scope: scope ?? 'global', updatedBy: session.user.id },
    create: { id: crypto.randomUUID(), key, label, description, enabled, scope: scope ?? 'global', updatedBy: session.user.id },
  });

  await recordAdminChange({
    actorUserId: session.user.id,
    targetType: 'FeatureFlag',
    targetId: updated.id,
    action: before ? 'update' : 'create',
    summary: `${before ? 'Updated' : 'Created'} feature flag ${updated.key}`,
    payloadBefore: before,
    payloadAfter: updated,
  });

  return NextResponse.json({ data: updated });
}
