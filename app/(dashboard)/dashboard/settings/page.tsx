import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>
          Settings
        </h1>
        <p className="text-sm text-[#4d7a90] mt-1">
          Account profile and policy acceptance records.
        </p>
      </div>

      <section className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
        <h2 className="text-sm font-semibold text-[#00e5cc] uppercase tracking-wider mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Name" value={user.name ?? '—'} />
          <Field label="Email" value={user.email} />
          <Field label="Company" value={user.company ?? '—'} />
          <Field label="Position" value={user.position ?? '—'} />
          <Field label="Role" value={user.role} />
          <Field label="Member Since" value={user.createdAt.toLocaleDateString('en-CA')} />
        </div>
      </section>

      <section className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
        <h2 className="text-sm font-semibold text-[#00e5cc] uppercase tracking-wider mb-4">Policy Acceptance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Policy Version" value={user.policyVersion ?? '—'} />
          <Field label="Terms Accepted" value={user.termsAcceptedAt ? user.termsAcceptedAt.toLocaleString('en-CA') : '—'} />
          <Field label="Privacy Accepted" value={user.privacyAcceptedAt ? user.privacyAcceptedAt.toLocaleString('en-CA') : '—'} />
          <Field label="Host Responsibility Accepted" value={user.hostResponsibilityAcceptedAt ? user.hostResponsibilityAcceptedAt.toLocaleString('en-CA') : '—'} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#4d7a90] mb-1">{label}</p>
      <p className="text-[#e8f4f8]">{value}</p>
    </div>
  );
}
