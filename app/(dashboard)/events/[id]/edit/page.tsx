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
      router.push(`/dashboard/events/${id}`);
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
        <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>Edit Event</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Status toggle */}
        <div className="glass-strong rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#e8f4f8] mb-3" style={{ fontFamily: 'var(--font-display)' }}>Event Status</h2>
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
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>Basics</h2>
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

        {/* Date & Time */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>Date & Time</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start *" type="datetime-local" value={form.date} onChange={(e) => set({ date: e.target.value })} />
            <Input label="End" type="datetime-local" value={form.endDate} onChange={(e) => set({ endDate: e.target.value })} />
          </div>
          <Select label="Timezone" options={TIMEZONES} value={form.timezone} onChange={(e) => set({ timezone: e.target.value })} />
        </div>

        {/* Location */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>Location</h2>
          <Input label="Venue Name" value={form.location} onChange={(e) => set({ location: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => set({ address: e.target.value })} />
          <Textarea label="Things to Know / Bring" rows={3} value={form.thingsToKnow} onChange={(e) => set({ thingsToKnow: e.target.value })} />
        </div>

        {/* Capacity & Age */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>Capacity & Requirements</h2>
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
          <h2 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>Visibility</h2>
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
