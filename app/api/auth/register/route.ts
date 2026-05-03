import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { db } from '@/lib/db';
import { signUpSchema } from '@/lib/validations';
import { POLICY_VERSION } from '@/lib/legal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      company,
      position,
      acceptedTerms,
      acceptedPrivacy,
      acceptedHostResponsibility,
    } = parsed.data;

    if (!acceptedTerms || !acceptedPrivacy || !acceptedHostResponsibility) {
      return NextResponse.json(
        { error: 'You must accept all required policies to create an account.' },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const forwardedFor = req.headers.get('x-forwarded-for');
    const signupIp = forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company: company ?? null,
        position: position ?? null,
        role: 'HOST',
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
        hostResponsibilityAcceptedAt: new Date(),
        policyVersion: POLICY_VERSION,
        signupIp,
      },
    });

    return NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
