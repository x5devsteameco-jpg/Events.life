'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CustomQuestion, FAQ, Speaker, AgendaItem } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TicketTier {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
  price: string;
  quantity: string;
  unlimited: boolean;
}

interface WizardData {
  // Step 1
  title: string;
  category: string;
  eventType: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  eventTheme: 'teal' | 'violet' | 'rose' | 'amber' | 'sky' | 'emerald';
  // Step 2
  description: string;
  bannerImage: string;
  // Step 3
  date: string;
  endDate: string;
  timezone: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurrenceEnd: string;
  // Step 4
  location: string;
  address: string;
  parkingAvailable: boolean;
  parkingNotes: string;
  onlineLink: string;
  thingsToKnow: string;
  // Step 5
  ticketName: string;
  ticketDescription: string;
  ticketQuantity: string;
  ticketUnlimited: boolean;
  maxTicketsPerPerson: string;
  ticketTiers: TicketTier[];
  // Step 6
  ageGate: number;
  requiresCertification: boolean;
  certificationNote: string;
  dressCode: string;
  customQuestions: CustomQuestion[];
  // Step 7 — FAQ
  faqs: FAQ[];
  // Step 8 — Speakers & Agenda
  speakers: Speaker[];
  agenda: AgendaItem[];
  // Promo codes (stored on event as JSON)
  promoCodes: { id: string; code: string; discountType: 'percent' | 'flat'; discountValue: string; usageLimit: string; unlimited: boolean }[];
  // Step 9 (preview / field toggles)
  requiredFields: string[];
  // Step 10
  emailInviteList: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  confirmationMessage: string;
}

const INITIAL: WizardData = {
  title: '', category: '', eventType: 'IN_PERSON', eventTheme: 'teal',
  description: '', bannerImage: '',
  date: '', endDate: '', timezone: 'America/Toronto', recurrence: 'none', recurrenceEnd: '',
  location: '', address: '', parkingAvailable: false, parkingNotes: '', onlineLink: '', thingsToKnow: '',
  ticketName: 'General Admission', ticketDescription: '', ticketQuantity: '', ticketUnlimited: true, maxTicketsPerPerson: '',
  ticketTiers: [{ id: '1', name: 'General Admission', description: '', isFree: true, price: '', quantity: '', unlimited: true }],
  ageGate: 0, requiresCertification: false, certificationNote: '', dressCode: '', customQuestions: [],
  faqs: [],
  speakers: [],
  agenda: [],
  promoCodes: [],
  requiredFields: ['guestName', 'guestEmail'],
  emailInviteList: '', visibility: 'PUBLIC', confirmationMessage: '',
};

const STEPS = [
  { num: 1, label: 'Basics' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Date & Time' },
  { num: 4, label: 'Location' },
  { num: 5, label: 'Tickets' },
  { num: 6, label: 'Requirements' },
  { num: 7, label: 'FAQ' },
  { num: 8, label: 'Speakers' },
  { num: 9, label: 'RSVP Form' },
  { num: 10, label: 'Launch' },
];

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
  { value: 'America/St_Johns', label: 'Newfoundland (NT)' },
];

const EVENT_THEMES = [
  { value: 'teal', label: 'Teal Pulse' },
  { value: 'violet', label: 'Violet Luxe' },
  { value: 'rose', label: 'Rose Night' },
  { value: 'amber', label: 'Amber Glow' },
  { value: 'sky', label: 'Sky Signal' },
  { value: 'emerald', label: 'Emerald Room' },
];

const BANNER_PRESETS = [
  { id: 'city-neon', label: 'Neon Skyline', url: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1400&q=80' },
  { id: 'networking-lounge', label: 'Networking Lounge', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80' },
  { id: 'conference-stage', label: 'Conference Stage', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80' },
  { id: 'product-launch', label: 'Product Launch', url: 'https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&w=1400&q=80' },
  { id: 'rooftop-evening', label: 'Rooftop Evening', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80' },
  { id: 'minimal-studio', label: 'Studio Editorial', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80' },
];

const EVENT_TEMPLATES: { id: string; label: string; emoji: string; desc: string; preset: Partial<WizardData> }[] = [
  {
    id: 'networking',
    label: 'Networking Mixer',
    emoji: '🤝',
    desc: 'Industry meetup, drinks & conversations',
    preset: {
      category: 'Networking',
      eventTheme: 'teal',
      eventType: 'IN_PERSON',
      ticketName: 'General Admission',
      ticketUnlimited: true,
      dressCode: 'Business Casual',
      requiredFields: ['guestName', 'guestEmail', 'company'],
      confirmationMessage: 'Your spot is confirmed! We look forward to meeting you. Check in at the door with your name.',
    },
  },
  {
    id: 'product-demo',
    label: 'Product Demo',
    emoji: '🚀',
    desc: 'Brand showcase or product launch',
    preset: {
      category: 'Product Demo',
      eventTheme: 'violet',
      eventType: 'IN_PERSON',
      ticketName: 'Demo Seat',
      ticketUnlimited: false,
      ticketQuantity: '50',
      maxTicketsPerPerson: '2',
      requiredFields: ['guestName', 'guestEmail', 'company'],
      confirmationMessage: 'You\'re registered for the demo! We\'ll follow up with a calendar invite and product brief.',
    },
  },
  {
    id: 'private-gathering',
    label: 'Private Gathering',
    emoji: '🥂',
    desc: 'Exclusive invite-only event',
    preset: {
      category: 'Private Gathering',
      eventTheme: 'rose',
      eventType: 'IN_PERSON',
      visibility: 'PRIVATE',
      ageGate: 19,
      ticketName: 'Exclusive Pass',
      ticketUnlimited: false,
      ticketQuantity: '30',
      dressCode: 'Smart Casual',
      confirmationMessage: 'You\'re on the exclusive guest list. Please do not share this invite.',
    },
  },
  {
    id: 'webinar',
    label: 'Online Webinar',
    emoji: '💻',
    desc: 'Virtual presentation or workshop',
    preset: {
      category: 'Industry Event',
      eventTheme: 'sky',
      eventType: 'ONLINE',
      ticketName: 'Virtual Ticket',
      ticketUnlimited: true,
      requiredFields: ['guestName', 'guestEmail'],
      confirmationMessage: 'You\'re registered! The Zoom link will be emailed 24 hours before the event.',
    },
  },
  {
    id: 'blank',
    label: 'Start from Scratch',
    emoji: '✏️',
    desc: 'Build a fully custom event',
    preset: {},
  },
];

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Event Basics</h2>
        <p className="text-sm text-[#4d7a90]">Give your event a name and tell us what kind of event it is.</p>
      </div>
      <Input label="Event Name *" placeholder="e.g. Summer Brand Showcase 2025" value={data.title} onChange={(e) => setData({ title: e.target.value })} />
      <Select label="Category *" options={CATEGORIES} placeholder="Select category" value={data.category} onChange={(e) => setData({ category: e.target.value })} />
      <div>
        <label className="label-base">Event Theme</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EVENT_THEMES.map((theme) => {
            const active = data.eventTheme === theme.value;
            return (
              <button
                key={theme.value}
                type="button"
                onClick={() => setData({ eventTheme: theme.value as WizardData['eventTheme'] })}
                className={cn('rounded-xl border px-4 py-3 text-left transition-all', active ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)]' : 'border-[rgba(0,229,204,0.08)] hover:border-[rgba(0,229,204,0.2)]')}
              >
                <p className={cn('text-sm font-semibold', active ? 'text-[#00e5cc]' : 'text-[#e8f4f8]')}>{theme.label}</p>
                <p className="text-xs text-[#4d7a90] mt-1">Theme preset for the public event page</p>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="label-base">Event Type *</label>
        <div className="grid grid-cols-3 gap-3">
          {(['IN_PERSON', 'ONLINE', 'HYBRID'] as const).map((type) => {
            const labels = { IN_PERSON: 'In-Person', ONLINE: 'Online', HYBRID: 'Hybrid' };
            const icons = { IN_PERSON: '📍', ONLINE: '💻', HYBRID: '🌐' };
            const active = data.eventType === type;
            return (
              <button key={type} type="button" onClick={() => setData({ eventType: type })}
                className={cn('p-4 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2', active ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)] hover:text-[#e8f4f8]')}
              >
                <span className="text-2xl">{icons[type]}</span>
                {labels[type]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (res.ok) {
        setData({ bannerImage: json.url });
        toast('Banner uploaded!', 'success');
      } else {
        toast(json.error || 'Upload failed', 'error');
      }
    } catch {
      toast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  }, [setData, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 5_242_880,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Event Details</h2>
        <p className="text-sm text-[#4d7a90]">Describe your event and add a banner image.</p>
      </div>
      <Textarea
        label="Description" placeholder="Tell attendees what to expect…" rows={6}
        value={data.description} onChange={(e) => setData({ description: e.target.value })}
        showCount maxLength={2000}
      />
      <div>
        <label className="label-base">Quick Banner Presets</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {BANNER_PRESETS.map((preset) => {
            const active = data.bannerImage === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setData({ bannerImage: preset.url })}
                className={cn('relative h-20 rounded-lg overflow-hidden border transition-all text-left', active ? 'border-[#00e5cc] ring-1 ring-[rgba(0,229,204,0.45)]' : 'border-[rgba(0,229,204,0.16)] hover:border-[rgba(0,229,204,0.35)]')}
              >
                <div className="absolute inset-0" style={{ backgroundImage: `url(${preset.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,4,8,0.92)] via-[rgba(2,4,8,0.38)] to-transparent" />
                <span className="absolute left-2 bottom-1.5 text-[10px] font-semibold text-[#d6edf2] tracking-wide">{preset.label}</span>
              </button>
            );
          })}
        </div>
        <Input
          label="Banner URL"
          type="url"
          placeholder="https://images.example.com/banner.jpg"
          value={data.bannerImage}
          onChange={(e) => setData({ bannerImage: e.target.value })}
          hint="Use your own CDN/drive image URL or pick a preset above"
        />
      </div>
      <div>
        <label className="label-base">Banner Image</label>
        {data.bannerImage ? (
          <div className="relative rounded-xl overflow-hidden h-52">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.bannerImage} alt="Event banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,4,8,0.9)] via-[rgba(2,4,8,0.24)] to-transparent" />
            <div className="absolute left-4 bottom-4 right-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#7aafc4] mb-1">Live Preview</p>
              <p className="text-lg font-black text-[#e8f4f8] leading-tight truncate" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
                {data.title || 'Your Event Title'}
              </p>
              <p className="text-xs text-[#9fc5d3] mt-1 line-clamp-2">{data.description || 'Your event subtitle and key message will appear here.'}</p>
            </div>
            <button type="button" onClick={() => setData({ bannerImage: '' })} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn('border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all', isDragActive ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.08)]' : 'border-[rgba(0,229,204,0.15)] hover:border-[rgba(0,229,204,0.3)] hover:bg-[rgba(0,229,204,0.04)]')}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-[#00e5cc]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                Uploading…
              </div>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4d7a90" strokeWidth="1.5" className="mx-auto mb-3" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <p className="text-sm text-[#4d7a90]">{isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}</p>
                <p className="text-xs text-[#2d5268] mt-1">PNG, JPG, WEBP up to 5MB</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Date & Time</h2>
        <p className="text-sm text-[#4d7a90]">When does your event start and end?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start Date & Time *" type="datetime-local" value={data.date} onChange={(e) => setData({ date: e.target.value })} />
        <Input label="End Date & Time" type="datetime-local" value={data.endDate} onChange={(e) => setData({ endDate: e.target.value })} />
      </div>
      <Select label="Timezone" options={TIMEZONES} value={data.timezone} onChange={(e) => setData({ timezone: e.target.value })} />

      {/* Recurring Events */}
      <div className="space-y-3">
        <Select
          label="Recurrence"
          value={data.recurrence}
          onChange={(e) => setData({ recurrence: e.target.value as WizardData['recurrence'] })}
          options={[
            { value: 'none', label: 'Does not repeat' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'biweekly', label: 'Every 2 weeks' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
        {data.recurrence !== 'none' && (
          <Input
            label="Repeat until (optional)"
            type="date"
            value={data.recurrenceEnd}
            onChange={(e) => setData({ recurrenceEnd: e.target.value })}
          />
        )}
        {data.recurrence !== 'none' && (
          <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(156,107,255,0.08)', border: '1px solid rgba(156,107,255,0.2)', color: '#9c6bff' }}>
            🔁 This event will repeat{' '}
            {data.recurrence === 'daily' ? 'every day' :
             data.recurrence === 'weekly' ? 'every week' :
             data.recurrence === 'biweekly' ? 'every 2 weeks' : 'every month'}
            {data.recurrenceEnd ? ` until ${new Date(data.recurrenceEnd).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}.
          </div>
        )}
      </div>

      {data.date && (
        <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(0,229,204,0.06)', border: '1px solid rgba(0,229,204,0.15)' }}>
          <p className="text-[#00e5cc] font-semibold">📅 {new Date(data.date).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          {data.endDate && <p className="text-[#4d7a90] text-xs mt-1">Ends: {new Date(data.endDate).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────
function Step4({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  const showAddress = data.eventType === 'IN_PERSON' || data.eventType === 'HYBRID';
  const showOnline = data.eventType === 'ONLINE' || data.eventType === 'HYBRID';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Location</h2>
        <p className="text-sm text-[#4d7a90]">Where is your event taking place?</p>
      </div>

      {showAddress && (
        <>
          <Input label="Venue Name" placeholder="e.g. The Emerald Lounge" value={data.location} onChange={(e) => setData({ location: e.target.value })} />
          <Input label="Full Address" placeholder="123 Main St, Vancouver, BC V6B 2W9" value={data.address} onChange={(e) => setData({ address: e.target.value })} />
          <div>
            <label className="label-base">Parking Available?</label>
            <div className="flex gap-3">
              {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(({ val, label }) => (
                <button key={String(val)} type="button" onClick={() => setData({ parkingAvailable: val })}
                  className={cn('px-5 py-2 rounded-xl border text-sm font-medium transition-all', data.parkingAvailable === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {data.parkingAvailable && (
            <Textarea label="Parking Notes" placeholder="e.g. Free street parking on Main St, paid lot on 1st Ave" rows={3} value={data.parkingNotes} onChange={(e) => setData({ parkingNotes: e.target.value })} />
          )}
        </>
      )}

      {showOnline && (
        <Input label="Meeting Link" type="url" placeholder="https://zoom.us/j/..." value={data.onlineLink} onChange={(e) => setData({ onlineLink: e.target.value })} hint="Will only be shown to confirmed attendees" />
      )}

      <Textarea label="Things to Know / Bring" placeholder="What should attendees bring or know before coming?&#10;e.g. Bring your store business card. Dress code is smart casual." rows={4} value={data.thingsToKnow} onChange={(e) => setData({ thingsToKnow: e.target.value })} />
    </div>
  );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────
function Step5({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  const tiers = data.ticketTiers ?? [{ id: '1', name: 'General Admission', description: '', isFree: true, price: '', quantity: '', unlimited: true }];

  const setTiers = (updated: TicketTier[]) => setData({ ticketTiers: updated });

  const addTier = () => {
    const newTier: TicketTier = {
      id: Math.random().toString(36).slice(2),
      name: '',
      description: '',
      isFree: true,
      price: '',
      quantity: '',
      unlimited: true,
    };
    setTiers([...tiers, newTier]);
  };

  const updateTier = (id: string, patch: Partial<TicketTier>) => {
    setTiers(tiers.map((t) => t.id === id ? { ...t, ...patch } : t));
  };

  const removeTier = (id: string) => {
    if (tiers.length <= 1) return; // always keep at least one
    setTiers(tiers.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Ticket Tiers</h2>
        <p className="text-sm text-[#4d7a90]">Configure one or more ticket types for your event.</p>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, idx) => (
          <div key={tier.id} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(12,26,31,0.8)', border: '1px solid rgba(0,229,204,0.12)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00e5cc]">Tier {idx + 1}</span>
              {tiers.length > 1 && (
                <button type="button" onClick={() => removeTier(tier.id)} className="text-xs text-[#4d7a90] hover:text-[#ff3cac] transition-colors px-2 py-1 rounded">
                  Remove
                </button>
              )}
            </div>

            <Input
              label="Ticket Name"
              value={tier.name}
              onChange={(e) => updateTier(tier.id, { name: e.target.value })}
              placeholder="e.g. General Admission, VIP, Early Bird"
            />
            <Input
              label="Description (optional)"
              value={tier.description}
              onChange={(e) => updateTier(tier.id, { description: e.target.value })}
              placeholder="What does this ticket include?"
            />

            {/* Free / Paid toggle */}
            <div>
              <label className="label-base">Pricing</label>
              <div className="flex gap-2 mb-2">
                {[{ val: true, label: 'Free' }, { val: false, label: 'Paid' }].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => updateTier(tier.id, { isFree: val })}
                    className={cn('px-4 py-2 rounded-xl border text-sm font-medium transition-all', tier.isFree === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {!tier.isFree && (
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 25.00"
                  label="Price (CAD $)"
                  value={tier.price}
                  onChange={(e) => updateTier(tier.id, { price: e.target.value })}
                  hint="Paid ticketing via Stripe coming soon — set price for planning purposes"
                />
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="label-base">Capacity</label>
              <div className="flex gap-2 mb-2">
                {[{ val: true, label: 'Unlimited' }, { val: false, label: 'Limited' }].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => updateTier(tier.id, { unlimited: val })}
                    className={cn('px-4 py-2 rounded-xl border text-sm font-medium transition-all', tier.unlimited === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {!tier.unlimited && (
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={tier.quantity}
                  onChange={(e) => updateTier(tier.id, { quantity: e.target.value })}
                  hint="Max RSVPs for this tier"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {tiers.length < 5 && (
        <button
          type="button"
          onClick={addTier}
          className="w-full py-3 rounded-xl border-dashed border text-sm font-semibold text-[#4d7a90] hover:text-[#00e5cc] hover:border-[rgba(0,229,204,0.4)] transition-all"
          style={{ border: '1px dashed rgba(0,229,204,0.2)' }}
        >
          + Add Another Tier (VIP, Early Bird, etc.)
        </button>
      )}

      <Input
        type="number"
        min="1"
        placeholder="e.g. 2"
        label="Max Tickets Per Person"
        value={data.maxTicketsPerPerson}
        onChange={(e) => setData({ maxTicketsPerPerson: e.target.value })}
        hint="Optional limit per guest"
      />

      {/* ── Promo / Discount Codes ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#00e5cc]">Promo & Discount Codes</p>
            <p className="text-xs text-[#4d7a90] mt-0.5">Create codes guests enter at RSVP for discounts or free access.</p>
          </div>
          <button
            type="button"
            onClick={() => setData({ promoCodes: [...(data.promoCodes ?? []), { id: Math.random().toString(36).slice(2), code: '', discountType: 'percent', discountValue: '', usageLimit: '', unlimited: true }] })}
            className="text-xs font-semibold text-[#00e5cc] hover:text-[#00b8a3] transition-colors"
          >
            + Add Code
          </button>
        </div>
        {(data.promoCodes ?? []).length === 0 && (
          <p className="text-xs text-[#2d5268] py-2">No promo codes yet.</p>
        )}
        <div className="space-y-3">
          {(data.promoCodes ?? []).map((pc, idx) => (
            <div key={pc.id} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(12,26,31,0.8)', border: '1px solid rgba(0,229,204,0.08)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4d7a90]">Code {idx + 1}</span>
                <button type="button"
                  onClick={() => setData({ promoCodes: (data.promoCodes ?? []).filter((c) => c.id !== pc.id) })}
                  className="text-xs text-[#4d7a90] hover:text-[#ff3cac] transition-colors"
                >Remove</button>
              </div>
              <Input
                label="Code (e.g. EARLYBIRD2024)"
                value={pc.code}
                onChange={(e) => setData({ promoCodes: (data.promoCodes ?? []).map((c) => c.id === pc.id ? { ...c, code: e.target.value.toUpperCase() } : c) })}
                placeholder="PROMO20"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">Discount Type</label>
                  <div className="flex gap-2">
                    {([{ val: 'percent', label: '% Off' }, { val: 'flat', label: '$ Off' }] as const).map(({ val, label }) => (
                      <button key={val} type="button"
                        onClick={() => setData({ promoCodes: (data.promoCodes ?? []).map((c) => c.id === pc.id ? { ...c, discountType: val } : c) })}
                        className={cn('px-3 py-1.5 rounded-lg border text-xs font-medium transition-all', pc.discountType === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}
                      >{label}</button>
                    ))}
                  </div>
                </div>
                <Input
                  type="number"
                  min="0"
                  max={pc.discountType === 'percent' ? '100' : undefined}
                  label={pc.discountType === 'percent' ? 'Percent Off' : 'Amount Off (CAD $)'}
                  value={pc.discountValue}
                  onChange={(e) => setData({ promoCodes: (data.promoCodes ?? []).map((c) => c.id === pc.id ? { ...c, discountValue: e.target.value } : c) })}
                  placeholder={pc.discountType === 'percent' ? '20' : '10.00'}
                />
              </div>
              <div>
                <label className="label-base">Usage Limit</label>
                <div className="flex gap-2 mb-2">
                  {([{ val: true, label: 'Unlimited' }, { val: false, label: 'Limited' }] as const).map(({ val, label }) => (
                    <button key={String(val)} type="button"
                      onClick={() => setData({ promoCodes: (data.promoCodes ?? []).map((c) => c.id === pc.id ? { ...c, unlimited: val } : c) })}
                      className={cn('px-3 py-1.5 rounded-lg border text-xs font-medium transition-all', pc.unlimited === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}
                    >{label}</button>
                  ))}
                </div>
                {!pc.unlimited && (
                  <Input
                    type="number"
                    min="1"
                    value={pc.usageLimit}
                    onChange={(e) => setData({ promoCodes: (data.promoCodes ?? []).map((c) => c.id === pc.id ? { ...c, usageLimit: e.target.value } : c) })}
                    placeholder="e.g. 50"
                    hint="Max times this code can be used"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 6 ───────────────────────────────────────────────────────────────────
function Step6({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  const addQuestion = () => {
    const newQ: CustomQuestion = {
      id: Math.random().toString(36).slice(2),
      label: '',
      type: 'text',
      required: false,
    };
    setData({ customQuestions: [...data.customQuestions, newQ] });
  };

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setData({ customQuestions: data.customQuestions.map((q) => q.id === id ? { ...q, ...updates } : q) });
  };

  const removeQuestion = (id: string) => {
    setData({ customQuestions: data.customQuestions.filter((q) => q.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Requirements</h2>
        <p className="text-sm text-[#4d7a90]">Set age requirements, certification requirements, and custom RSVP questions.</p>
      </div>

      {/* Age Gate */}
      <div>
        <label className="label-base">Age Gate</label>
        <div className="flex flex-wrap gap-2">
          {[0, 18, 19, 21].map((age) => (
            <button key={age} type="button" onClick={() => setData({ ageGate: age })}
              className={cn('px-4 py-2 rounded-xl border text-sm font-medium transition-all', data.ageGate === age ? 'border-[#ff3cac] bg-[rgba(255,60,172,0.1)] text-[#ff3cac]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}>
              {age === 0 ? 'None' : `${age}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Certification */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label-base mb-0">Requires Certification?</label>
          <button
            type="button"
            onClick={() => setData({ requiresCertification: !data.requiresCertification })}
            className={cn('relative w-11 h-6 rounded-full transition-all', data.requiresCertification ? 'bg-[#00e5cc]' : 'bg-[rgba(0,229,204,0.15)]')}
            role="switch"
            aria-checked={data.requiresCertification}
          >
            <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow', data.requiresCertification ? 'left-6' : 'left-1')} />
          </button>
        </div>
        {data.requiresCertification && (
          <Input placeholder="e.g. CannSell, Smart Serve, Security License, etc." value={data.certificationNote} onChange={(e) => setData({ certificationNote: e.target.value })} hint="Attendees will be asked to provide this certification" />
        )}
      </div>

      <Input label="Dress Code" placeholder="e.g. Cocktail, Smart Casual, All Black" value={data.dressCode} onChange={(e) => setData({ dressCode: e.target.value })} hint="Optional attendee guidance shown on the public event page" />

      {/* Custom Questions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label-base mb-0">Custom RSVP Questions</label>
          <button type="button" onClick={addQuestion} className="text-xs font-semibold text-[#00e5cc] hover:text-[#7aafc4] transition-colors flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Add Question
          </button>
        </div>

        <div className="space-y-3">
          {data.customQuestions.map((q) => (
            <div key={q.id} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
              <div className="flex items-start gap-3">
                <Input placeholder="Question label" value={q.label} onChange={(e) => updateQuestion(q.id, { label: e.target.value })} className="flex-1" />
                <Select
                  options={[{ value: 'text', label: 'Text' }, { value: 'select', label: 'Dropdown' }, { value: 'checkbox', label: 'Checkbox' }]}
                  value={q.type}
                  onChange={(e) => updateQuestion(q.id, { type: e.target.value as CustomQuestion['type'] })}
                  className="w-32"
                />
                <button type="button" onClick={() => removeQuestion(q.id)} className="mt-2.5 p-1.5 rounded-lg text-[#4d7a90] hover:text-[#ff3cac] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id={`req-${q.id}`} checked={q.required} onChange={(e) => updateQuestion(q.id, { required: e.target.checked })} className="accent-[#00e5cc]" />
                <label htmlFor={`req-${q.id}`} className="text-xs text-[#4d7a90] cursor-pointer">Required</label>
              </div>
            </div>
          ))}
          {data.customQuestions.length === 0 && (
            <p className="text-xs text-[#2d5268] text-center py-6 border border-dashed border-[rgba(0,229,204,0.08)] rounded-xl">
              No custom questions yet. Click &quot;Add Question&quot; to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 7: FAQ Builder ───────────────────────────────────────────────────────
function Step7Faq({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  const addFaq = () => {
    const newFaq: FAQ = { id: Math.random().toString(36).slice(2), question: '', answer: '' };
    setData({ faqs: [...data.faqs, newFaq] });
  };

  const updateFaq = (id: string, updates: Partial<FAQ>) => {
    setData({ faqs: data.faqs.map((f) => f.id === id ? { ...f, ...updates } : f) });
  };

  const removeFaq = (id: string) => {
    setData({ faqs: data.faqs.filter((f) => f.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Frequently Asked Questions</h2>
        <p className="text-sm text-[#4d7a90]">Add Q&amp;As that will be shown on your event page to help attendees before RSVPing.</p>
      </div>

      <div className="space-y-3">
        {data.faqs.map((faq, i) => (
          <div key={faq.id} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2d5268] uppercase tracking-wider">Q{i + 1}</span>
              <button type="button" onClick={() => removeFaq(faq.id)} className="p-1 rounded-lg text-[#4d7a90] hover:text-[#ff3cac] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <Input
              placeholder="Question — e.g. Is this event 19+?"
              value={faq.question}
              onChange={(e) => updateFaq(faq.id, { question: e.target.value })}
            />
            <Textarea
              placeholder="Answer — e.g. Yes, valid ID required at the door."
              rows={3}
              value={faq.answer}
              onChange={(e) => updateFaq(faq.id, { answer: e.target.value })}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addFaq}
          className="w-full py-4 rounded-xl border-2 border-dashed text-sm font-medium text-[#4d7a90] hover:text-[#00e5cc] hover:border-[rgba(0,229,204,0.3)] transition-all flex items-center justify-center gap-2"
          style={{ borderColor: 'rgba(0,229,204,0.12)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          Add FAQ
        </button>
      </div>

      {data.faqs.length === 0 && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(0,229,204,0.04)', border: '1px solid rgba(0,229,204,0.1)' }}>
          <p className="text-[#4d7a90]">💡 <span className="text-[#7aafc4]">Pro tip:</span> Common questions include parking details, dress code, what to bring, ID requirements, and cancellation policies.</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 7 ───────────────────────────────────────────────────────────────────
function Step7({ data }: { data: WizardData }) {
  const baseFields = [
    { id: 'guestName', label: 'Full Name', required: true },
    { id: 'guestEmail', label: 'Email Address', required: true },
    { id: 'storeName', label: 'Store Name', required: false },
    { id: 'storeAddress', label: 'Store Address', required: false },
    { id: 'brand', label: 'Brand / Company', required: false },
    { id: 'position', label: 'Position / Title', required: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>RSVP Form Preview</h2>
        <p className="text-sm text-[#4d7a90]">This is what attendees will fill out when they RSVP to your event.</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,229,204,0.15)' }}>
        <div className="px-5 py-3" style={{ background: 'rgba(0,229,204,0.06)', borderBottom: '1px solid rgba(0,229,204,0.1)' }}>
          <p className="text-sm font-semibold text-[#00e5cc]">RSVP for {data.title || 'Your Event'}</p>
        </div>
        <div className="p-5 space-y-4" style={{ background: 'rgba(12,26,31,0.5)' }}>
          {baseFields.map((field) => (
            <div key={field.id}>
              <label className="label-base">
                {field.label} {field.required && <span className="text-[#ff3cac]">*</span>}
              </label>
              <div className="h-9 rounded-lg" style={{ background: 'rgba(6,13,16,0.8)', border: '1px solid rgba(0,229,204,0.08)' }} />
            </div>
          ))}

          {data.requiresCertification && (
            <div>
              <label className="label-base">Certification Upload <span className="text-[#ff3cac]">*</span></label>
              <div className="h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-xs text-[#4d7a90]" style={{ borderColor: 'rgba(0,229,204,0.15)', background: 'rgba(6,13,16,0.6)' }}>
                Upload your {data.certificationNote || 'certification'}
              </div>
            </div>
          )}

          {data.customQuestions.map((q) => q.label && (
            <div key={q.id}>
              <label className="label-base">
                {q.label} {q.required && <span className="text-[#ff3cac]">*</span>}
              </label>
              {q.type === 'checkbox'
                ? <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border" style={{ border: '1px solid rgba(0,229,204,0.2)' }} /><span className="text-xs text-[#4d7a90]">Checkbox</span></div>
                : <div className="h-9 rounded-lg" style={{ background: 'rgba(6,13,16,0.8)', border: '1px solid rgba(0,229,204,0.08)' }} />
              }
            </div>
          ))}

          {data.ageGate > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,60,172,0.06)', border: '1px solid rgba(255,60,172,0.15)' }}>
              <div className="w-4 h-4 rounded border border-[#ff3cac] flex-shrink-0" />
              <label className="text-xs text-[#ff3cac]">I confirm I am {data.ageGate}+ years of age</label>
            </div>
          )}

          <div className="pt-2">
            <div className="w-full py-3 rounded-xl text-sm font-bold text-center text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
              Submit RSVP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 8: Speakers & Agenda ────────────────────────────────────────────────
function Step8Speakers({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  const speakers = data.speakers ?? [];
  const agenda = data.agenda ?? [];

  const addSpeaker = () => {
    const s: Speaker = { id: Math.random().toString(36).slice(2), name: '', title: '', bio: '', photoUrl: '', linkedin: '', twitter: '' };
    setData({ speakers: [...speakers, s] });
  };

  const updateSpeaker = (id: string, patch: Partial<Speaker>) =>
    setData({ speakers: speakers.map((s) => s.id === id ? { ...s, ...patch } : s) });

  const removeSpeaker = (id: string) =>
    setData({ speakers: speakers.filter((s) => s.id !== id) });

  const addAgendaItem = () => {
    const item: AgendaItem = { id: Math.random().toString(36).slice(2), time: '', title: '', description: '', speakerId: '', duration: '30' };
    setData({ agenda: [...agenda, item] });
  };

  const updateAgenda = (id: string, patch: Partial<AgendaItem>) =>
    setData({ agenda: agenda.map((a) => a.id === id ? { ...a, ...patch } : a) });

  const removeAgenda = (id: string) =>
    setData({ agenda: agenda.filter((a) => a.id !== id) });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Speakers &amp; Agenda</h2>
        <p className="text-sm text-[#4d7a90]">Optional — add speakers and a schedule so attendees know what to expect.</p>
      </div>

      {/* Speakers */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00e5cc]">Speakers</h3>
        {speakers.map((s, idx) => (
          <div key={s.id} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2d5268] uppercase tracking-wider">Speaker {idx + 1}</span>
              <button type="button" onClick={() => removeSpeaker(s.id)} className="p-1 rounded text-[#4d7a90] hover:text-[#ff3cac] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Full Name *" placeholder="e.g. Alex Chen" value={s.name} onChange={(e) => updateSpeaker(s.id, { name: e.target.value })} />
              <Input label="Title / Role" placeholder="e.g. VP of Marketing, Acme Co." value={s.title} onChange={(e) => updateSpeaker(s.id, { title: e.target.value })} />
              <Input label="Photo URL" type="url" placeholder="https://cdn.example.com/photo.jpg" value={s.photoUrl} onChange={(e) => updateSpeaker(s.id, { photoUrl: e.target.value })} />
              <Input label="LinkedIn URL" type="url" placeholder="https://linkedin.com/in/..." value={s.linkedin} onChange={(e) => updateSpeaker(s.id, { linkedin: e.target.value })} />
            </div>
            <Textarea label="Bio (optional)" placeholder="A short bio visible to attendees on the event page." rows={2} value={s.bio} onChange={(e) => updateSpeaker(s.id, { bio: e.target.value })} />
            {s.photoUrl && (
              <div className="flex items-center gap-3 mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <span className="text-xs text-[#4d7a90]">Photo preview</span>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSpeaker}
          className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium text-[#4d7a90] hover:text-[#00e5cc] hover:border-[rgba(0,229,204,0.3)] transition-all flex items-center justify-center gap-2"
          style={{ borderColor: 'rgba(0,229,204,0.12)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          Add Speaker
        </button>
      </div>

      {/* Agenda */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00e5cc]">Schedule / Agenda</h3>
        {agenda.map((item, idx) => (
          <div key={item.id} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2d5268] uppercase tracking-wider">Slot {idx + 1}</span>
              <button type="button" onClick={() => removeAgenda(item.id)} className="p-1 rounded text-[#4d7a90] hover:text-[#ff3cac] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input label="Time" placeholder="e.g. 6:30 PM" value={item.time} onChange={(e) => updateAgenda(item.id, { time: e.target.value })} />
              <Input label="Duration (min)" type="number" placeholder="30" value={item.duration} onChange={(e) => updateAgenda(item.id, { duration: e.target.value })} />
              {speakers.length > 0 && (
                <Select
                  label="Speaker"
                  value={item.speakerId}
                  onChange={(e) => updateAgenda(item.id, { speakerId: e.target.value })}
                  options={[{ value: '', label: '— No speaker —' }, ...speakers.filter(s => s.name).map(s => ({ value: s.id, label: s.name }))]}
                />
              )}
            </div>
            <Input label="Session Title *" placeholder="e.g. Opening Remarks, Product Deep-Dive, Networking" value={item.title} onChange={(e) => updateAgenda(item.id, { title: e.target.value })} />
            <Input label="Description (optional)" placeholder="What will be covered in this session?" value={item.description} onChange={(e) => updateAgenda(item.id, { description: e.target.value })} />
          </div>
        ))}
        <button
          type="button"
          onClick={addAgendaItem}
          className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium text-[#4d7a90] hover:text-[#00e5cc] hover:border-[rgba(0,229,204,0.3)] transition-all flex items-center justify-center gap-2"
          style={{ borderColor: 'rgba(0,229,204,0.12)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          Add Agenda Slot
        </button>
      </div>

      {speakers.length === 0 && agenda.length === 0 && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(0,229,204,0.04)', border: '1px solid rgba(0,229,204,0.1)' }}>
          <p className="text-[#4d7a90]">💡 This step is optional. Events with speakers and a detailed agenda get significantly higher attendee confidence before RSVPing.</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 9: RSVP Form Preview ───────────────────────────────────────────────
// ─── Step 10: Invite & Launch ─────────────────────────────────────────────────
function Step10Launch({ data, setData, onSubmit, submitting }: { data: WizardData; setData: (d: Partial<WizardData>) => void; onSubmit: (status: 'DRAFT' | 'LIVE') => void; submitting: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Invite & Launch</h2>
        <p className="text-sm text-[#4d7a90]">Send invites and choose how your event appears.</p>
      </div>

      <div>
        <label className="label-base">Event Visibility</label>
        <div className="flex gap-3">
          {[{ val: 'PUBLIC', label: '🌐 Public', desc: 'Anyone can find and RSVP' }, { val: 'PRIVATE', label: '🔒 Private', desc: 'Only invited guests can access' }].map(({ val, label, desc }) => (
            <button key={val} type="button" onClick={() => setData({ visibility: val as 'PUBLIC' | 'PRIVATE' })}
              className={cn('flex-1 p-4 rounded-xl border text-left transition-all', data.visibility === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)]' : 'border-[rgba(0,229,204,0.08)] hover:border-[rgba(0,229,204,0.2)]')}>
              <p className={cn('text-sm font-semibold', data.visibility === val ? 'text-[#00e5cc]' : 'text-[#e8f4f8]')}>{label}</p>
              <p className="text-xs text-[#4d7a90] mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Email Invite List (optional)"
        placeholder="john@store.com&#10;sarah@brand.ca&#10;alex@dispensary.com"
        rows={5}
        value={data.emailInviteList}
        onChange={(e) => setData({ emailInviteList: e.target.value })}
        hint="One email per line, or comma-separated. Invites sent after launch."
      />

      <Textarea
        label="Custom RSVP Confirmation Message (optional)"
        placeholder="e.g. Thanks for RSVPing! Please bring your government-issued ID and business card. Doors open at 6:30 PM. See you there!"
        rows={4}
        value={data.confirmationMessage}
        onChange={(e) => setData({ confirmationMessage: e.target.value })}
        hint="This message will appear on the RSVP confirmation screen after a guest submits their RSVP."
      />

      {/* Summary */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.1)' }}>
        <h3 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Event Summary</h3>
        {[
          { label: 'Title', value: data.title || '—' },
          { label: 'Category', value: data.category || '—' },
          { label: 'Type', value: data.eventType.replace('_', '-') },
          { label: 'Theme', value: data.eventTheme },
          { label: 'Date', value: data.date ? new Date(data.date).toLocaleDateString('en-CA', { dateStyle: 'full' }) : '—' },
          { label: 'Location', value: data.location || (data.eventType === 'ONLINE' ? 'Online' : '—') },
          { label: 'Capacity', value: data.ticketUnlimited ? 'Unlimited' : (data.ticketQuantity || '—') },
          { label: 'Per Person Cap', value: data.maxTicketsPerPerson || '—' },
          { label: 'Age Gate', value: data.ageGate > 0 ? `${data.ageGate}+` : 'None' },
          { label: 'Dress Code', value: data.dressCode || '—' },
          { label: 'Certification', value: data.requiresCertification ? 'Required' : 'Not required' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <span className="text-[#4d7a90] w-28 flex-shrink-0">{label}</span>
            <span className="text-[#e8f4f8] truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" size="lg" className="flex-1" loading={submitting} onClick={() => onSubmit('DRAFT')}>
          Save as Draft
        </Button>
        <Button type="button" variant="primary" size="lg" className="flex-1" loading={submitting} onClick={() => onSubmit('LIVE')}>
          🚀 Launch Event
        </Button>
      </div>
    </div>
  );
}

// ─── Wizard Shell ─────────────────────────────────────────────────────────────
const DRAFT_KEY = 'events-life:event-draft';

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setDataState] = useState<WizardData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const draftLoadedRef = useRef(false);

  // On mount, check for a saved draft
  useEffect(() => {
    if (draftLoadedRef.current) return;
    draftLoadedRef.current = true;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WizardData;
        if (parsed.title?.trim()) { setShowDraftBanner(true); setShowTemplates(false); }
      }
    } catch { /* ignore */ }
  }, []);

  // Autosave on every data change (debounced via useEffect)
  useEffect(() => {
    if (!draftLoadedRef.current) return;
    const id = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    }, 800);
    return () => clearTimeout(id);
  }, [data]);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WizardData;
        setDataState(parsed);
        toast('Draft restored!', 'success');
      }
    } catch { /* ignore */ }
    setShowDraftBanner(false);
  };

  const discardDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setShowDraftBanner(false);
  };

  const clearDraftOnSuccess = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  };

  const setData = useCallback((updates: Partial<WizardData>) => {
    setDataState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goNext = () => {
    if (step < 10) { setDirection(1); setStep((s) => s + 1); }
  };

  const goPrev = () => {
    if (step > 1) { setDirection(-1); setStep((s) => s - 1); }
  };

  const canProceed = () => {
    if (step === 1) return data.title.trim().length >= 3 && data.category;
    if (step === 3) return data.date;
    return true;
  };

  const handleSubmit = async (status: 'DRAFT' | 'LIVE') => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        status,
        isOnline: data.eventType === 'ONLINE' || data.eventType === 'HYBRID',
        maxAttendees: data.ticketUnlimited ? null : parseInt(data.ticketQuantity) || null,
        ticketQuantity: data.ticketUnlimited ? null : parseInt(data.ticketQuantity) || null,
        maxTicketsPerPerson: parseInt(data.maxTicketsPerPerson) || null,
        customQuestions: data.customQuestions,
        faqs: data.faqs,
        speakers: data.speakers,
        agenda: data.agenda,
        promoCodes: data.promoCodes,
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast(json.error || 'Failed to create event', 'error');
        return;
      }

      toast(status === 'LIVE' ? '🚀 Event launched!' : '📝 Saved as draft', 'success');
      clearDraftOnSuccess();
      if (status === 'LIVE' && json.data?.slug) {
        router.push(`/event/${json.data.slug}?launched=1`);
      } else {
        router.push(`/dashboard/events`);
      }
    } catch {
      toast('Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const stepComponents = [
    <Step1 key={1} data={data} setData={setData} />,
    <Step2 key={2} data={data} setData={setData} />,
    <Step3 key={3} data={data} setData={setData} />,
    <Step4 key={4} data={data} setData={setData} />,
    <Step5 key={5} data={data} setData={setData} />,
    <Step6 key={6} data={data} setData={setData} />,
    <Step7Faq key={7} data={data} setData={setData} />,
    <Step8Speakers key={8} data={data} setData={setData} />,
    <Step7 key={9} data={data} />,
    <Step10Launch key={10} data={data} setData={setData} onSubmit={handleSubmit} submitting={submitting} />,
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Template picker — shown before wizard starts */}
      {showTemplates && (
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Create Event</h1>
            <p className="text-sm text-[#4d7a90] mt-1">Choose a template to get started, or build from scratch.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EVENT_TEMPLATES.map((tmpl) => (
              <motion.button
                key={tmpl.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setDataState((prev) => ({ ...prev, ...tmpl.preset }));
                  setShowTemplates(false);
                }}
                className="flex items-start gap-4 p-5 rounded-2xl text-left transition-all"
                style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)' }}
              >
                <span className="text-3xl flex-shrink-0">{tmpl.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-[#e8f4f8]">{tmpl.label}</p>
                  <p className="text-xs text-[#4d7a90] mt-0.5">{tmpl.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {!showTemplates && (
        <>
      {/* Draft restore banner */}
      {showDraftBanner && (
        <div className="mb-6 flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl text-sm" style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.25)' }}>
          <p className="text-[#7aafc4]">📝 You have an unsaved draft. Continue where you left off?</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={restoreDraft} className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>Restore</button>
            <button type="button" onClick={discardDraft} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4d7a90] hover:text-[#ff3cac] transition-colors">Discard</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>Create Event</h1>
        <p className="text-sm text-[#4d7a90] mt-1">Step {step} of {STEPS.length}: {STEPS[step - 1].label}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-1 mb-3">
          {STEPS.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => { if (s.num < step) { setDirection(s.num < step ? -1 : 1); setStep(s.num); } }}
              className={cn('flex-1 h-2 rounded-full transition-all duration-300', s.num < step ? 'bg-[#00e5cc] cursor-pointer' : s.num === step ? 'bg-[#00e5cc] opacity-55' : 'bg-[rgba(0,229,204,0.08)]')}
              aria-label={`Step ${s.num}: ${s.label}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#2d5268]">
          <span>{STEPS[0].label}</span>
          <span>{STEPS[STEPS.length - 1].label}</span>
        </div>
      </div>

      {/* Step content */}
      <div className="glass-strong rounded-2xl p-6 mb-6 min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {stepComponents[step - 1]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 10 && (
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={goPrev} disabled={step === 1}>
            ← Back
          </Button>
          <span className="text-xs text-[#2d5268]">{step} / {STEPS.length}</span>
          <Button type="button" variant="primary" onClick={goNext} disabled={!canProceed()}>
            {step === 9 ? 'Review & Launch →' : 'Next →'}
          </Button>
        </div>
      )}
      {step === 10 && (
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={goPrev}>← Back</Button>
          <span className="text-xs text-[#2d5268]">{step} / {STEPS.length}</span>
        </div>
      )}
        </>
      )}
    </div>
  );
}
