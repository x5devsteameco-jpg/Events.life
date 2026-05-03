'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().max(150).optional().or(z.literal('')),
  position: z.string().max(100).optional().or(z.literal('')),
});
type ProfileForm = z.infer<typeof profileSchema>;

interface Props {
  initialData: {
    name: string | null;
    email: string;
    company: string | null;
    position: string | null;
    role: string;
    policyVersion: string | null;
    termsAcceptedAt: Date | null;
    privacyAcceptedAt: Date | null;
    hostResponsibilityAcceptedAt: Date | null;
    createdAt: Date;
  };
}

export function SettingsForm({ initialData }: Props) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name ?? '',
      company: initialData.company ?? '',
      position: initialData.position ?? '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        toast('Profile updated!', 'success');
      } else {
        const json = await res.json();
        toast(json.error || 'Failed to update', 'error');
      }
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
          Settings
        </h1>
        <p className="text-sm text-[#4d7a90] mt-1">Manage your profile and review your policy acceptance records.</p>
      </div>

      {/* Profile Section */}
      <section className="rounded-2xl p-6" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
        <div className="flex items-center gap-3 mb-6">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-[#020408] flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
            {(initialData.name?.[0] ?? initialData.email[0] ?? 'U').toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[#e8f4f8]">{initialData.name || 'Your Name'}</p>
            <p className="text-sm text-[#4d7a90]">{initialData.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold mt-1" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.15)', color: '#00e5cc' }}>
              {initialData.role}
            </span>
          </div>
        </div>

        <h2 className="text-sm font-bold text-[#00e5cc] uppercase tracking-wider mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="Your name"
              {...register('name')}
              error={errors.name?.message}
            />
            <div>
              <label className="label-base">Email</label>
              <div
                className="h-10 px-3 rounded-lg flex items-center text-sm text-[#4d7a90]"
                style={{ background: 'rgba(6,13,16,0.6)', border: '1px solid rgba(0,229,204,0.06)' }}
              >
                {initialData.email}
                <span className="ml-auto text-[10px] text-[#2d5268] bg-[rgba(0,229,204,0.05)] px-1.5 py-0.5 rounded">cannot change</span>
              </div>
            </div>
            <Input
              label="Company / Store"
              placeholder="Your company name"
              {...register('company')}
              error={errors.company?.message}
            />
            <Input
              label="Position / Title"
              placeholder="e.g. Store Manager, Brand Rep"
              {...register('position')}
              error={errors.position?.message}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty && !isSubmitting}>
              {saved ? '✓ Saved' : 'Save Changes'}
            </Button>
            {saved && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-[#7fff00]">
                Profile updated successfully
              </motion.span>
            )}
          </div>
        </form>
      </section>

      {/* Account Info */}
      <section className="rounded-2xl p-6" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
        <h2 className="text-sm font-bold text-[#00e5cc] uppercase tracking-wider mb-4">Account Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoField label="Member Since" value={new Date(initialData.createdAt).toLocaleDateString('en-CA', { dateStyle: 'long' })} />
          <InfoField label="Role" value={initialData.role} />
        </div>
      </section>

      {/* Legal Compliance */}
      <section className="rounded-2xl p-6" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
        <h2 className="text-sm font-bold text-[#00e5cc] uppercase tracking-wider mb-4">Policy Acceptance Records</h2>
        <p className="text-xs text-[#4d7a90] mb-4">These records are immutable and stored for compliance purposes.</p>
        <div className="space-y-3">
          {[
            { label: 'Policy Version', value: initialData.policyVersion ?? '—' },
            { label: 'Terms of Service', value: initialData.termsAcceptedAt ? new Date(initialData.termsAcceptedAt).toLocaleString('en-CA') : '—', accent: !!initialData.termsAcceptedAt },
            { label: 'Privacy Policy', value: initialData.privacyAcceptedAt ? new Date(initialData.privacyAcceptedAt).toLocaleString('en-CA') : '—', accent: !!initialData.privacyAcceptedAt },
            { label: 'Host Responsibility', value: initialData.hostResponsibilityAcceptedAt ? new Date(initialData.hostResponsibilityAcceptedAt).toLocaleString('en-CA') : '—', accent: !!initialData.hostResponsibilityAcceptedAt },
          ].map(({ label, value, accent }) => (
            <div key={label} className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ background: 'rgba(6,13,16,0.5)', border: '1px solid rgba(0,229,204,0.05)' }}>
              <span className="text-xs text-[#4d7a90]">{label}</span>
              <div className="flex items-center gap-2">
                {accent && <span className="w-1.5 h-1.5 rounded-full bg-[#7fff00]" />}
                <span className="text-xs text-[#e8f4f8] font-medium">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl p-6" style={{ background: 'rgba(255,60,172,0.03)', border: '1px solid rgba(255,60,172,0.1)' }}>
        <h2 className="text-sm font-bold text-[#ff3cac] uppercase tracking-wider mb-2">Security</h2>
        <p className="text-xs text-[#4d7a90] mb-4">Password changes are handled via email. Contact support to reset your password or delete your account.</p>
        <div className="flex items-center gap-3 text-xs text-[#4d7a90]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4d7a90" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Password-based authentication active
        </div>
      </section>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-[#4d7a90]">{label}</span>
      <span className="text-sm text-[#e8f4f8] font-medium">{value}</span>
    </div>
  );
}
