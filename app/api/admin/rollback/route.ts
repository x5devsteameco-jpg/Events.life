import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recordAdminChange, requireAdmin } from '@/lib/admin';

type JsonMap = Record<string, unknown>;

function parsePayload(value: string | null): JsonMap | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') return parsed as JsonMap;
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { logId } = (await req.json()) as { logId?: string };
  if (!logId) return NextResponse.json({ error: 'Missing logId' }, { status: 400 });

  const entry = await db.adminChangeLog.findUnique({ where: { id: logId } });
  if (!entry) return NextResponse.json({ error: 'Audit log entry not found' }, { status: 404 });

  const before = parsePayload(entry.payloadBefore);
  if (!before) return NextResponse.json({ error: 'Rollback not available for this entry' }, { status: 400 });

  let updated: unknown = null;

  if (entry.targetType === 'FeatureFlag') {
    updated = await db.featureFlag.update({
      where: { id: entry.targetId },
      data: {
        label: (before.label as string) ?? '',
        description: (before.description as string | null) ?? null,
        enabled: Boolean(before.enabled),
        scope: (before.scope as string) ?? 'global',
        updatedBy: session.user.id,
      },
    });
  } else if (entry.targetType === 'AdSlot') {
    updated = await db.adSlot.update({
      where: { id: entry.targetId },
      data: {
        label: (before.label as string) ?? '',
        headline: (before.headline as string | null) ?? null,
        body: (before.body as string | null) ?? null,
        ctaLabel: (before.ctaLabel as string | null) ?? null,
        ctaHref: (before.ctaHref as string | null) ?? null,
        imageUrl: (before.imageUrl as string | null) ?? null,
        active: Boolean(before.active),
        priority: Number(before.priority ?? 0),
        updatedBy: session.user.id,
      },
    });
  } else if (entry.targetType === 'SiteAsset') {
    updated = await db.siteAsset.update({
      where: { id: entry.targetId },
      data: {
        label: (before.label as string) ?? '',
        type: (before.type as string) ?? 'image',
        url: (before.url as string) ?? '',
        alt: (before.alt as string | null) ?? null,
        metadata: (before.metadata as string | null) ?? null,
        updatedBy: session.user.id,
      },
    });
  } else if (entry.targetType === 'ManagedPageSection') {
    updated = await db.managedPageSection.update({
      where: { id: entry.targetId },
      data: {
        label: (before.label as string) ?? '',
        variant: (before.variant as string) ?? 'default',
        enabled: Boolean(before.enabled),
        sortOrder: Number(before.sortOrder ?? 0),
        config: (before.config as string | null) ?? null,
        updatedBy: session.user.id,
      },
    });
  } else {
    return NextResponse.json({ error: 'Rollback is unsupported for this target type' }, { status: 400 });
  }

  await recordAdminChange({
    actorUserId: session.user.id,
    targetType: entry.targetType,
    targetId: entry.targetId,
    action: 'rollback',
    summary: `Rolled back ${entry.targetType} from audit entry ${entry.id}`,
    payloadBefore: entry.payloadAfter,
    payloadAfter: updated,
  });

  return NextResponse.json({ ok: true, data: updated });
}
