import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const ADMIN_NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Overview', icon: '◈' },
  { href: '/admin/events', label: 'Events', icon: '◉' },
  { href: '/admin/users', label: 'Users', icon: '◎' },
  { href: '/admin/reports', label: 'Reports', icon: '⚑' },
  { href: '/admin/content', label: 'Site Content', icon: '✦' },
  { href: '/admin/assets', label: 'Assets', icon: '▣' },
  { href: '/admin/sections', label: 'Sections', icon: '▤' },
  { href: '/admin/ads', label: 'Ads', icon: '◌' },
  { href: '/admin/flags', label: 'Feature Flags', icon: '⬢' },
  { href: '/admin/announcements', label: 'Announcements', icon: '◆' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: '⋯' },
] as const;

export const IMMUTABLE_ACCOUNT_HOLDER_FIELDS = [
  'user.email',
  'user.password',
  'user.image',
  'user.company',
  'user.position',
  'user.bio',
  'user.instagram',
  'user.linkedin',
  'user.website',
  'user.twitter',
  'account.provider',
  'account.providerAccountId',
  'session.sessionToken',
  'verification.token',
] as const;

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== 'ADMIN') return null;
  return session;
}

export async function recordAdminChange(input: {
  actorUserId: string;
  targetType: string;
  targetId: string;
  action: string;
  summary: string;
  payloadBefore?: unknown;
  payloadAfter?: unknown;
}) {
  await db.adminChangeLog.create({
    data: {
      actorUserId: input.actorUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      action: input.action,
      summary: input.summary,
      payloadBefore: input.payloadBefore ? JSON.stringify(input.payloadBefore) : null,
      payloadAfter: input.payloadAfter ? JSON.stringify(input.payloadAfter) : null,
    },
  });
}
