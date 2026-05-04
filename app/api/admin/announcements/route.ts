import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import crypto from 'crypto';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== 'ADMIN') return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { message, type } = await req.json() as { message: string; type: string };
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });
  const validTypes = ['info', 'success', 'warning', 'error'];
  const safeType = validTypes.includes(type) ? type : 'info';

  const ann = await db.announcement.create({
    data: {
      id: crypto.randomUUID(),
      message: message.slice(0, 500),
      type: safeType,
      isActive: true,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return NextResponse.json(ann);
}
