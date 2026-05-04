import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const source = await db.event.findUnique({ where: { id } });
    if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (source.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build a unique slug for the clone
    const baseSlug = `${source.slug}-copy`;
    let slug = baseSlug;
    let suffix = 1;
    while (await db.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const { id: _id, createdAt: _c, updatedAt: _u, slug: _slug, ...rest } = source;

    const clone = await db.event.create({
      data: {
        ...rest,
        slug,
        title: `${source.title} (Copy)`,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ data: { id: clone.id, slug: clone.slug } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/events/[id]/duplicate]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
