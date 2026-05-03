import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().max(150).optional().or(z.literal('')),
  position: z.string().max(100).optional().or(z.literal('')),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        company: parsed.data.company || null,
        position: parsed.data.position || null,
      },
      select: { id: true, name: true, email: true, company: true, position: true },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
