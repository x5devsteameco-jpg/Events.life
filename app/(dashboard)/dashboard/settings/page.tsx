import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SettingsForm } from '@/components/dashboard/settings-form';

export const metadata = {
  title: 'Settings | Gatewise Events',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      company: true,
      position: true,
      role: true,
      termsAcceptedAt: true,
      privacyAcceptedAt: true,
      hostResponsibilityAcceptedAt: true,
      policyVersion: true,
      createdAt: true,
    },
  });

  if (!user) redirect('/login');

  return <SettingsForm initialData={user} />;
}
