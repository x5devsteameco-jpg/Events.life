'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'Networking', label: 'Networking' },
  { value: 'Product Demo', label: 'Product Demo' },
  { value: 'Private Gathering', label: 'Private Gathering' },
  { value: 'Industry Event', label: 'Industry Event' },
  { value: 'Other', label: 'Other' },
];

const TIMEZONES = [
  { value: 'America/Vancouver', label: 'Pacific (PT)' },
  { value: 'America/Edmonton', label: 'Mountain (MT)' },
  { value: 'America/Winnipeg', label: 'Central (CT)' },
  { value: 'America/Toronto', label: 'Eastern (ET)' },
  { value: 'America/Halifax', label: 'Atlantic (AT)' },
];

const BANNER_PRESETS = [
  { id: 'city-neon', label: 'Neon Skyline', url: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1400&q=80' },
  { id: 'networking-lounge', label: 'Networking Lounge', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80' },
  { id: 'conference-stage', label: 'Conference Stage', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80' },
  { id: 'product-launch', label: 'Product Launch', url: 'https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&w=1400&q=80' },
  { id: 'rooftop-evening', label: 'Rooftop Evening', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80' },
  { id: 'minimal-studio', label: 'Studio Editorial', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80' },
];

interface EventData {
  title: string;
  description: string;
  date: string;
  endDate: string;
  timezone: string;
  location: string;
  address: string;
  category: string;
  eventType: string;
  status: string;
  visibility: string;
  maxAttendees: number | null;
  ageGate: number;
  thingsToKnow: string;
  bannerImage: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EventData>({
    title: '', description: '', date: '', endDate: '', timezone: 'America/Toronto',
    location: '', address: '', category: '', eventType: 'IN_PERSON',
    status: 'DRAFT', visibility: 'PUBLIC', maxAttendees: null,
    ageGate: 0, thingsToKnow: '', bannerImage: '',
  });

  const set = useCallback((updates: Partial<EventData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const d = json.data;
          setForm({
            title: d.title ?? '',
            description: d.description ?? '',
            date: d.date ? new Date(d.date).toISOString().slice(0, 16) : '',
            endDate: d.endDate ? new Date(d.endDate).toISOString().slice(0, 16) : '',
            timezone: d.timezone ?? 'America/Toronto',
            location: d.location ?? '',
            address: d.address ?? '',
            category: d.category ?? '',
            eventType: d.eventType ?? 'IN_PERSON',
            status: d.status ?? 'DRAFT',
            visibility: d.visibility ?? 'PUBLIC',
            maxAttendees: d.maxAttendees ?? null,
            ageGate: d.ageGate ?? 0,
            thingsToKnow: d.thingsToKnow ?? '',
            bannerImage: d.bannerImage ?? '',
          });
        }
        setLoading(false);
      })
      .catch(() => { toast('Failed to load event', 'error'); setLoading(false); });
  }, [id, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: form.date, endDate: form.endDate || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error || 'Failed to save', 'error');
        return;
      }
      toast('Event saved!', 'success');
      router.push(`/events/${id}`);
    } catch {
      toast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2" className="animate-spin" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button type="button" onClick={() => router.back()} className="text-[#4d7a90] hover:text-[#e8f4f8] transition-colors">
          ← Back
        </button>
        <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Edit Event</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Status toggle */}
        <div className="glass-strong rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#e8f4f8] mb-3" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Event Status</h2>
          <div className="flex gap-3">
            {[{ val: 'DRAFT', label: '📝 Draft' }, { val: 'LIVE', label: '🚀 Live' }, { val: 'CANCELLED', label: '🚫 Cancelled' }].map(({ val, label }) => (
              <button key={val} type="button" onClick={() => set({ status: val })}
                className={cn('px-4 py-2 rounded-xl border text-sm font-medium transition-all', form.status === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Basics */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Basics</h2>
          <Input label="Event Name *" value={form.title} onChange={(e) => set({ title: e.target.value })} />
          <Select label="Category" options={CATEGORIES} value={form.category} onChange={(e) => set({ category: e.target.value })} />
          <div>
            <label className="label-base">Event Type</label>
            <div className="flex gap-3">
              {(['IN_PERSON', 'ONLINE', 'HYBRID'] as const).map((type) => (
                <button key={type} type="button" onClick={() => set({ eventType: type })}
                  className={cn('flex-1 py-2 rounded-xl border text-xs font-medium transition-all', form.eventType === type ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}>
                  {type.replace('_', '-')}
                </button>
              ))}
            </div>
          </div>
          <Textarea label="Description" rows={5} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </div>

        {/* Visual Branding */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Visual Branding</h2>
          <Input
            label="Banner URL"
            type="url"
            placeholder="https://images.example.com/banner.jpg"
            value={form.bannerImage}
            onChange={(e) => set({ bannerImage: e.target.value })}
            hint="Paste your own image URL or select one of the curated presets"
          />
          <div>
            <label className="label-base">Banner Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BANNER_PRESETS.map((preset) => {
                const active = form.bannerImage === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => set({ bannerImage: preset.url })}
                    className={cn('relative h-20 rounded-lg overflow-hidden border transition-all text-left', active ? 'border-[#00e5cc] ring-1 ring-[rgba(0,229,204,0.45)]' : 'border-[rgba(0,229,204,0.16)] hover:border-[rgba(0,229,204,0.35)]')}
                  >
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${preset.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,4,8,0.92)] via-[rgba(2,4,8,0.38)] to-transparent" />
                    <span className="absolute left-2 bottom-1.5 text-[10px] font-semibold text-[#d6edf2] tracking-wide">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {form.bannerImage && (
            <div className="relative h-56 rounded-xl overflow-hidden border border-[rgba(0,229,204,0.14)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.bannerImage} alt="Event banner preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,4,8,0.9)] via-[rgba(2,4,8,0.24)] to-transparent" />
              <div className="absolute left-4 bottom-4 right-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#7aafc4] mb-1">Header Preview</p>
                <p className="text-lg font-black text-[#e8f4f8] leading-tight truncate" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
                  {form.title || 'Your Event Title'}
                </p>
                <p className="text-xs text-[#9fc5d3] mt-1 line-clamp-2">{form.description || 'Your event description will layer over this image.'}</p>
              </div>
              <button type="button" onClick={() => set({ bannerImage: '' })} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors" aria-label="Remove banner image">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Date & Time</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start *" type="datetime-local" value={form.date} onChange={(e) => set({ date: e.target.value })} />
            <Input label="End" type="datetime-local" value={form.endDate} onChange={(e) => set({ endDate: e.target.value })} />
          </div>
          <Select label="Timezone" options={TIMEZONES} value={form.timezone} onChange={(e) => set({ timezone: e.target.value })} />
        </div>

        {/* Location */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Location</h2>
          <Input label="Venue Name" value={form.location} onChange={(e) => set({ location: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => set({ address: e.target.value })} />
          <Textarea label="Things to Know / Bring" rows={3} value={form.thingsToKnow} onChange={(e) => set({ thingsToKnow: e.target.value })} />
        </div>

        {/* Capacity & Age */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Capacity & Requirements</h2>
          <Input label="Max Attendees (leave blank for unlimited)" type="number" min="1" value={form.maxAttendees ?? ''} onChange={(e) => set({ maxAttendees: e.target.value ? parseInt(e.target.value) : null })} />
          <div>
            <label className="label-base">Age Gate</label>
            <div className="flex gap-2">
              {[0, 18, 19, 21].map((age) => (
                <button key={age} type="button" onClick={() => set({ ageGate: age })}
                  className={cn('px-4 py-2 rounded-xl border text-sm font-medium transition-all', form.ageGate === age ? 'border-[#ff3cac] bg-[rgba(255,60,172,0.1)] text-[#ff3cac]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}>
                  {age === 0 ? 'None' : `${age}+`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="glass-strong rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Visibility</h2>
          <div className="flex gap-3">
            {[{ val: 'PUBLIC', label: '🌐 Public' }, { val: 'PRIVATE', label: '🔒 Private' }].map(({ val, label }) => (
              <button key={val} type="button" onClick={() => set({ visibility: val })}
                className={cn('flex-1 py-2 rounded-xl border text-sm font-medium transition-all', form.visibility === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>Cancel</Button>
          <Button type="button" variant="primary" className="flex-1" onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </motion.div>
    </div>
  );
}
