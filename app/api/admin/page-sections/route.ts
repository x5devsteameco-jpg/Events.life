import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { DEFAULT_MANAGED_SECTIONS } from '@/lib/admin-defaults';
import { recordAdminChange, requireAdmin } from '@/lib/admin';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const existing = await db.managedPageSection.findMany({ orderBy: [{ pageKey: 'asc' }, { sortOrder: 'asc' }] });
  if (existing.length > 0) return NextResponse.json({ data: existing });

  const seeded = await Promise.all(
    DEFAULT_MANAGED_SECTIONS.map((section) =>
      db.managedPageSection.create({ data: { id: crypto.randomUUID(), ...section, updatedBy: session.user.id } })
    )
  );
  return NextResponse.json({ data: seeded });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as {
    pageKey: string;
    sectionKey: string;
    label: string;
    variant?: string;
    enabled: boolean;
    sortOrder?: number;
    config?: string;
  };

  if (!body.pageKey || !body.sectionKey || !body.label || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const before = await db.managedPageSection.findUnique({
    where: { pageKey_sectionKey: { pageKey: body.pageKey, sectionKey: body.sectionKey } },
  });
  const updated = await db.managedPageSection.upsert({
    where: { pageKey_sectionKey: { pageKey: body.pageKey, sectionKey: body.sectionKey } },
    update: {
      label: body.label,
      variant: body.variant ?? 'default',
      enabled: body.enabled,
      sortOrder: body.sortOrder ?? 0,
      config: body.config,
      updatedBy: session.user.id,
    },
    create: {
      id: crypto.randomUUID(),
      pageKey: body.pageKey,
      sectionKey: body.sectionKey,
      label: body.label,
      variant: body.variant ?? 'default',
      enabled: body.enabled,
      sortOrder: body.sortOrder ?? 0,
      config: body.config,
      updatedBy: session.user.id,
    },
  });

  await recordAdminChange({
    actorUserId: session.user.id,
    targetType: 'ManagedPageSection',
    targetId: updated.id,
    action: before ? 'update' : 'create',
    summary: `${before ? 'Updated' : 'Created'} page section ${updated.pageKey}/${updated.sectionKey}`,
    payloadBefore: before,
    payloadAfter: updated,
  });

  return NextResponse.json({ data: updated });
}
