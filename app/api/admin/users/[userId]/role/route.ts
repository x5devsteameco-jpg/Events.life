import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, recordAdminChange } from '@/lib/admin';

const ALLOWED_ROLES = ['ADMIN', 'HOST', 'ATTENDEE'] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId } = await params;
  const body = await req.json();
  const newRole = body.role as string;

  if (!ALLOWED_ROLES.includes(newRole as AllowedRole)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Prevent self-demotion
  if (userId === session.user.id && newRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Cannot demote your own admin account' }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await db.user.update({ where: { id: userId }, data: { role: newRole as AllowedRole } });

  await recordAdminChange({
    actorUserId: session.user.id!,
    targetType: 'user',
    targetId: userId,
    action: 'role_change',
    summary: `Changed role from ${target.role} to ${newRole}`,
    payloadBefore: JSON.stringify({ role: target.role }),
    payloadAfter: JSON.stringify({ role: newRole }),
  });

  return NextResponse.json({ ok: true });
}
