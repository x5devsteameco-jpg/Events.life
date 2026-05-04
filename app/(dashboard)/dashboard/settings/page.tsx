import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SettingsForm } from '@/components/dashboard/settings-form';
import { DataDeletionSection } from '@/components/dashboard/data-deletion-section';

export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      company: true,
      position: true,
      bio: true,
      organizerLogo: true,
      themePreset: true,
      instagram: true,
      linkedin: true,
      website: true,
      twitter: true,
      role: true,
      termsAcceptedAt: true,
      privacyAcceptedAt: true,
      hostResponsibilityAcceptedAt: true,
      policyVersion: true,
      createdAt: true,
    },
  });

  if (!user) redirect('/login');

  return (
    <div className="space-y-10">
      <SettingsForm initialData={user} />
      <DataDeletionSection />
    </div>
  );
}
