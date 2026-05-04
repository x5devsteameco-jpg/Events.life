import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, recordAdminChange } from '@/lib/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { reportId } = await params;
  const body = await req.json();
  const newStatus = body.status as string;

  if (!['RESOLVED', 'DISMISSED'].includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const report = await db.contentReport.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.contentReport.update({ where: { id: reportId }, data: { status: newStatus } });

  await recordAdminChange({
    actorUserId: session.user.id!,
    targetType: 'contentReport',
    targetId: reportId,
    action: 'status_change',
    summary: `Report marked ${newStatus}`,
    payloadBefore: JSON.stringify({ status: report.status }),
    payloadAfter: JSON.stringify({ status: newStatus }),
  });

  return NextResponse.json({ ok: true });
}
