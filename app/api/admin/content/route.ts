import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== 'ADMIN') return null;
  return session;
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { key, value } = await req.json() as { key: string; value: string };
  if (!key || typeof value !== 'string') return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  // Ensure max length for safety
  const safeValue = value.slice(0, 2000);

  await db.siteContent.upsert({
    where: { key },
    update: { value: safeValue, updatedAt: new Date(), updatedBy: session.user.id },
    create: { id: crypto.randomUUID(), key, value: safeValue, type: 'text', updatedAt: new Date(), updatedBy: session.user.id },
  });
  return NextResponse.json({ ok: true });
}
