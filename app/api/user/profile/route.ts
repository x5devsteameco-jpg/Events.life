import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().max(150).optional().or(z.literal('')),
  position: z.string().max(100).optional().or(z.literal('')),
  image: z.string().url('Profile image must be a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  organizerLogo: z.string().url('Organizer logo must be a valid URL').optional().or(z.literal('')),
  bannerUrl: z.string().url('Banner must be a valid URL').optional().or(z.literal('')),
  themePreset: z.enum(['teal', 'violet', 'rose', 'amber', 'sky', 'emerald']).optional(),
  avatarConfig: z.string().max(2000).optional().or(z.literal('')),
  instagram: z.string().max(100).optional().or(z.literal('')),
  linkedin: z.string().max(200).optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter: z.string().max(100).optional().or(z.literal('')),
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
        image: parsed.data.image || null,
        bio: parsed.data.bio || null,
        organizerLogo: parsed.data.organizerLogo || null,
        bannerUrl: parsed.data.bannerUrl || null,
        themePreset: parsed.data.themePreset ?? 'teal',
        avatarConfig: parsed.data.avatarConfig || null,
        instagram: parsed.data.instagram || null,
        linkedin: parsed.data.linkedin || null,
        website: parsed.data.website || null,
        twitter: parsed.data.twitter || null,
      },
      select: { id: true, name: true, email: true, company: true, position: true, image: true, bio: true, organizerLogo: true, bannerUrl: true, themePreset: true, avatarConfig: true, instagram: true, linkedin: true, website: true, twitter: true },
    });

    const response = NextResponse.json({ user: updated });
    // Set theme cookie so ThemeApply can update the UI immediately without re-login
    response.cookies.set('gw_theme', updated.themePreset ?? 'teal', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false, // must be readable by client JS
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
