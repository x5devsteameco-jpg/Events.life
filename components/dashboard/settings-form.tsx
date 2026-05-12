'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast';
import { AvatarPicker } from '@/components/dashboard/avatar-picker';
import { AvatarCharacter, DEFAULT_AVATAR_CONFIG, type AvatarConfig } from '@/components/ui/avatar-character';

const THEME_PRESETS = [
  { id: 'teal',    label: 'Teal',    accent: '#00c4a8', dim: '#009e8c', glow: 'rgba(0,196,168,0.3)' },
  { id: 'violet',  label: 'Violet',  accent: '#9c6bff', dim: '#7c4fd4', glow: 'rgba(156,107,255,0.3)' },
  { id: 'rose',    label: 'Rose',    accent: '#e83d9b', dim: '#b82e77', glow: 'rgba(232,61,155,0.3)' },
  { id: 'amber',   label: 'Amber',   accent: '#e8940a', dim: '#b87008', glow: 'rgba(232,148,10,0.3)' },
  { id: 'sky',     label: 'Sky',     accent: '#29aadf', dim: '#0e7eb5', glow: 'rgba(41,170,223,0.3)' },
  { id: 'emerald', label: 'Emerald', accent: '#10b981', dim: '#0a8c61', glow: 'rgba(16,185,129,0.3)' },
] as const;

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
type ThemePreset = typeof THEME_PRESETS[number]['id'];

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().max(150).optional().or(z.literal('')),
  position: z.string().max(100).optional().or(z.literal('')),
  image: z.string().url('Profile image must be a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  organizerLogo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bannerUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  themePreset: z.enum(['teal', 'violet', 'rose', 'amber', 'sky', 'emerald']).optional(),
  avatarConfig: z.string().optional(),
  instagram: z.string().max(100).optional().or(z.literal('')),
  linkedin: z.string().max(200).optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter: z.string().max(100).optional().or(z.literal('')),
});
type ProfileForm = z.infer<typeof profileSchema>;

interface Props {
  initialData: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    company: string | null;
    position: string | null;
    bio: string | null;
    organizerLogo: string | null;
    bannerUrl: string | null;
    themePreset: string | null;
    avatarConfig: string | null;
    instagram: string | null;
    linkedin: string | null;
    website: string | null;
    twitter: string | null;
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
  const [avatarConfig, setAvatarConfig] = useState<Partial<AvatarConfig>>(
    initialData.avatarConfig ? (JSON.parse(initialData.avatarConfig) as Partial<AvatarConfig>) : DEFAULT_AVATAR_CONFIG
  );
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name ?? '',
      company: initialData.company ?? '',
      position: initialData.position ?? '',
      image: initialData.image ?? '',
      bio: initialData.bio ?? '',
      organizerLogo: initialData.organizerLogo ?? '',
      bannerUrl: initialData.bannerUrl ?? '',
      themePreset: (initialData.themePreset as ThemePreset) ?? 'teal',
      avatarConfig: initialData.avatarConfig ?? '',
      instagram: initialData.instagram ?? '',
      linkedin: initialData.linkedin ?? '',
      website: initialData.website ?? '',
      twitter: initialData.twitter ?? '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, avatarConfig: JSON.stringify(avatarConfig) }),
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
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
          {/* Avatar */}
          {watch('image') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={watch('image')} alt="Profile" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-[#020408] flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
              {(initialData.name?.[0] ?? initialData.email[0] ?? 'U').toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-[#e8f4f8]">{initialData.name || 'Your Name'}</p>
            <p className="text-sm text-[#4d7a90]">{initialData.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold mt-1" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.15)', color: '#00e5cc' }}>
              {initialData.role}
            </span>
          </div>
          </div>
          <a
            href={`/organizer/${initialData.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:brightness-110"
            style={{ background: 'rgba(0,229,204,0.07)', border: '1px solid rgba(0,229,204,0.18)', color: '#00e5cc', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            View Public Profile →
          </a>
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
            <Input
              label="Profile Image URL"
              type="url"
              placeholder="https://images.example.com/avatar.jpg"
              {...register('image')}
              error={errors.image?.message}
              hint="Used across your dashboard avatar and profile card"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="label-base">Organizer Bio <span className="text-[#2d5268] text-[10px] font-normal ml-1">shown on public event pages</span></label>
            <textarea
              {...register('bio')}
              placeholder="Tell attendees about yourself, your brand, or what kind of events you host…"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#e8f4f8] placeholder-[#2d5268] resize-none mt-1 focus:outline-none focus:ring-1 focus:ring-[#00e5cc]/40"
              style={{ background: 'rgba(6,13,16,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}
            />
            <div className="text-right text-[10px] text-[#2d5268] mt-0.5">{watch('bio')?.length ?? 0}/500</div>
          </div>

          {/* Banner image */}
          <Input
            label="Profile Banner URL"
            type="url"
            placeholder="https://cdn.example.com/banner.jpg"
            {...register('bannerUrl')}
            error={errors.bannerUrl?.message}
            hint="Wide banner shown at the top of your organizer profile page"
          />

          {/* Organizer logo */}
          <div className="space-y-2">
            <Input
              label="Organizer Logo URL"
              type="url"
              placeholder="https://cdn.example.com/your-logo.png"
              {...register('organizerLogo')}
              error={errors.organizerLogo?.message}
              hint="Square or horizontal logo shown next to your name on event pages"
            />
            {watch('organizerLogo') && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(6,13,16,0.5)', border: '1px solid rgba(0,229,204,0.08)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={watch('organizerLogo')} alt="Logo preview" className="h-10 max-w-[120px] object-contain rounded" />
                <span className="text-xs text-[#4d7a90]">Logo preview</span>
              </div>
            )}
          </div>

          {/* Avatar Character Picker */}
          <div>
            <label className="label-base">Dashboard Avatar Character</label>
            <p className="text-xs text-[#4d7a90] mt-0.5 mb-3">Choose a unique character to represent you throughout the dashboard.</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(6,13,16,0.5)', border: '1px solid rgba(0,229,204,0.1)' }}>
              <button
                type="button"
                onClick={() => setAvatarPickerOpen(v => !v)}
                className="w-full flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[rgba(0,229,204,0.04)]"
              >
                <AvatarCharacter
                  config={{ ...avatarConfig, accentColor: THEME_PRESETS.find(p => p.id === watch('themePreset'))?.accent ?? '#00e5cc' }}
                  size={52}
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#e8f4f8]">Customize your character</p>
                  <p className="text-xs text-[#4d7a90]">{avatarPickerOpen ? 'Click to collapse' : 'Click to open avatar editor'}</p>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d7a90" strokeWidth="2"
                  className="ml-auto transition-transform"
                  style={{ transform: avatarPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {avatarPickerOpen && (
                <div className="px-4 pb-5 pt-2" style={{ borderTop: '1px solid rgba(0,229,204,0.08)' }}>
                  <AvatarPicker
                    value={{ ...avatarConfig, accentColor: THEME_PRESETS.find(p => p.id === watch('themePreset'))?.accent ?? '#00e5cc' }}
                    onChange={setAvatarConfig}
                    accentColor={THEME_PRESETS.find(p => p.id === watch('themePreset'))?.accent ?? '#00e5cc'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Theme preset picker */}
          <div>
            <label className="label-base">Dashboard Accent Colour</label>
            <p className="text-xs text-[#4d7a90] mt-0.5 mb-3">Changes button colours, nav highlights, and accents throughout your dashboard.</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
              {THEME_PRESETS.map((preset) => {
                const selected = watch('themePreset') === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setValue('themePreset', preset.id, { shouldDirty: true });
                      // Apply immediately via CSS var so user sees preview
                      const el = document.querySelector('[data-theme]') as HTMLElement | null;
                      if (el) el.setAttribute('data-theme', preset.id);
                    }}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl text-xs font-medium transition-all"
                    style={{
                      background: selected ? `rgba(${hexToRgb(preset.accent)}, 0.08)` : 'rgba(12,26,31,0.6)',
                      border: `1.5px solid ${selected ? preset.accent : 'rgba(255,255,255,0.06)'}`,
                      color: selected ? preset.accent : '#4d7a90',
                      boxShadow: selected ? `0 0 16px ${preset.glow}` : 'none',
                    }}
                  >
                    {/* Swatch */}
                    <span
                      className="w-7 h-7 rounded-xl flex-shrink-0 transition-transform"
                      style={{
                        background: `linear-gradient(135deg, ${(preset as { dim?: string }).dim ?? preset.accent} 0%, ${preset.accent} 100%)`,
                        transform: selected ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: selected ? `0 0 10px ${preset.glow}` : 'none',
                      }}
                    />
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register('themePreset')} />
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xs font-bold text-[#00e5cc] uppercase tracking-wider mb-3">Social Links <span className="text-[#2d5268] normal-case font-normal">— displayed on your organizer profile</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Instagram"
                placeholder="@yourhandle"
                {...register('instagram')}
                error={errors.instagram?.message}
              />
              <Input
                label="Twitter / X"
                placeholder="@yourhandle"
                {...register('twitter')}
                error={errors.twitter?.message}
              />
              <Input
                label="LinkedIn URL"
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                {...register('linkedin')}
                error={errors.linkedin?.message}
              />
              <Input
                label="Website"
                type="url"
                placeholder="https://yoursite.com"
                {...register('website')}
                error={errors.website?.message}
              />
            </div>
          </div>

          {/* Profile Completeness Meter */}
          {(() => {
            const vals = watch();
            const fields = [vals.name, vals.company, vals.position, vals.bio, vals.image, vals.organizerLogo, vals.instagram || vals.twitter || vals.linkedin || vals.website];
            const filled = fields.filter(Boolean).length;
            const pct = Math.round((filled / fields.length) * 100);
            const color = pct >= 85 ? '#00e5cc' : pct >= 50 ? '#f59e0b' : '#ff3cac';
            return (
              <div className="rounded-xl p-4" style={{ background: 'rgba(6,13,16,0.6)', border: '1px solid rgba(0,229,204,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#7aafc4]">Profile Completeness</span>
                  <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,229,204,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
                </div>
                {pct < 100 && (
                  <p className="text-[10px] text-[#2d5268] mt-1.5">
                    {pct < 50 ? 'Add your bio, logo and social links to build trust with attendees.' : 'Almost there — complete your profile for maximum visibility.'}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Live Profile Preview */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,229,204,0.12)' }}>
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(0,229,204,0.06)', borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
              <span className="w-2 h-2 rounded-full bg-[#00e5cc] animate-pulse" />
              <span className="text-xs font-bold text-[#00e5cc] uppercase tracking-wider">Live Preview — How attendees see your profile</span>
            </div>
            {/* Banner */}
            <div className="relative h-20 overflow-hidden" style={{ background: watch('bannerUrl') ? undefined : 'linear-gradient(135deg, rgba(0,229,204,0.06), rgba(0,180,150,0.03))' }}>
              {watch('bannerUrl') && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={watch('bannerUrl')} alt="" className="w-full h-full object-cover opacity-60" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(6,13,16,0.8)]" aria-hidden="true" />
            </div>
            {/* Profile card body */}
            <div className="px-5 py-4" style={{ background: 'rgba(6,13,16,0.7)' }}>
              <div className="flex items-start gap-4 -mt-8">
                {/* Avatar */}
                {watch('image') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={watch('image')} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 flex-shrink-0" style={{ borderColor: THEME_PRESETS.find(p => p.id === watch('themePreset'))?.accent ?? '#00e5cc' }} aria-hidden="true" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-[#020408] border-2 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)', borderColor: THEME_PRESETS.find(p => p.id === watch('themePreset'))?.accent ?? '#00e5cc' }}>
                    {(watch('name')?.[0] ?? '?').toUpperCase()}
                  </div>
                )}
                <div className="pt-8 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#e8f4f8] text-sm">{watch('name') || 'Your Name'}</p>
                    {watch('organizerLogo') && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={watch('organizerLogo')} alt="" className="h-5 max-w-[60px] object-contain opacity-80" aria-hidden="true" />
                    )}
                  </div>
                  {(watch('position') || watch('company')) && (
                    <p className="text-xs mt-0.5" style={{ color: THEME_PRESETS.find(p => p.id === watch('themePreset'))?.accent ?? '#00e5cc' }}>
                      {[watch('position'), watch('company')].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {watch('bio') && (
                    <p className="text-xs text-[#7aafc4] mt-1.5 line-clamp-2">{watch('bio')}</p>
                  )}
                  {/* Social links preview */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {watch('instagram') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,60,172,0.08)', color: '#ff3cac', border: '1px solid rgba(255,60,172,0.2)' }}>
                        IG {watch('instagram')}
                      </span>
                    )}
                    {watch('twitter') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                        𝕏 {watch('twitter')}
                      </span>
                    )}
                    {watch('linkedin') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,119,181,0.1)', color: '#5ba4cf', border: '1px solid rgba(91,164,207,0.2)' }}>
                        LinkedIn
                      </span>
                    )}
                    {watch('website') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,204,0.06)', color: '#4d7a90', border: '1px solid rgba(0,229,204,0.12)' }}>
                        Website
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty && !isSubmitting}>
              {saved ? 'Saved' : 'Save Changes'}
            </Button>
            {saved && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-[#00e5cc]">
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
                {accent && <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc]" />}
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
