'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CustomQuestion, FAQ } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WizardData {
  // Step 1
  title: string;
  category: string;
  eventType: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  // Step 2
  description: string;
  bannerImage: string;
  // Step 3
  date: string;
  endDate: string;
  timezone: string;
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
  // Step 6
  ageGate: number;
  requiresCertification: boolean;
  certificationNote: string;
  customQuestions: CustomQuestion[];
  // Step 7 — FAQ
  faqs: FAQ[];
  // Step 8 (preview / field toggles)
  requiredFields: string[];
  // Step 9
  emailInviteList: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

const INITIAL: WizardData = {
  title: '', category: '', eventType: 'IN_PERSON',
  description: '', bannerImage: '',
  date: '', endDate: '', timezone: 'America/Toronto',
  location: '', address: '', parkingAvailable: false, parkingNotes: '', onlineLink: '', thingsToKnow: '',
  ticketName: 'General Admission', ticketDescription: '', ticketQuantity: '', ticketUnlimited: true,
  ageGate: 0, requiresCertification: false, certificationNote: '', customQuestions: [],
  faqs: [],
  requiredFields: ['guestName', 'guestEmail'],
  emailInviteList: '', visibility: 'PUBLIC',
};

const STEPS = [
  { num: 1, label: 'Basics' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Date & Time' },
  { num: 4, label: 'Location' },
  { num: 5, label: 'Tickets' },
  { num: 6, label: 'Requirements' },
  { num: 7, label: 'FAQ' },
  { num: 8, label: 'RSVP Form' },
  { num: 9, label: 'Launch' },
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

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ data, setData }: { data: WizardData; setData: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Event Basics</h2>
        <p className="text-sm text-[#4d7a90]">Give your event a name and tell us what kind of event it is.</p>
      </div>
      <Input label="Event Name *" placeholder="e.g. Summer Brand Showcase 2025" value={data.title} onChange={(e) => setData({ title: e.target.value })} />
      <Select label="Category *" options={CATEGORIES} placeholder="Select category" value={data.category} onChange={(e) => setData({ category: e.target.value })} />
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
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Event Details</h2>
        <p className="text-sm text-[#4d7a90]">Describe your event and add a banner image.</p>
      </div>
      <Textarea
        label="Description" placeholder="Tell attendees what to expect…" rows={6}
        value={data.description} onChange={(e) => setData({ description: e.target.value })}
        showCount maxLength={2000}
      />
      <div>
        <label className="label-base">Banner Image</label>
        {data.bannerImage ? (
          <div className="relative rounded-xl overflow-hidden h-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.bannerImage} alt="Event banner" className="w-full h-full object-cover" />
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
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Date & Time</h2>
        <p className="text-sm text-[#4d7a90]">When does your event start and end?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start Date & Time *" type="datetime-local" value={data.date} onChange={(e) => setData({ date: e.target.value })} />
        <Input label="End Date & Time" type="datetime-local" value={data.endDate} onChange={(e) => setData({ endDate: e.target.value })} />
      </div>
      <Select label="Timezone" options={TIMEZONES} value={data.timezone} onChange={(e) => setData({ timezone: e.target.value })} />
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
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Location</h2>
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Tickets</h2>
        <p className="text-sm text-[#4d7a90]">All events are free to attend. Paid tickets coming soon.</p>
      </div>
      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(0,229,204,0.06)', border: '1px solid rgba(0,229,204,0.15)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
        <div>
          <p className="text-sm font-semibold text-[#00e5cc]">Free Event</p>
          <p className="text-xs text-[#4d7a90]">Attendees RSVP at no cost</p>
        </div>
      </div>
      <Input label="Ticket Name" value={data.ticketName} onChange={(e) => setData({ ticketName: e.target.value })} placeholder="General Admission" />
      <Textarea label="Ticket Description (optional)" rows={3} value={data.ticketDescription} onChange={(e) => setData({ ticketDescription: e.target.value })} placeholder="What does this ticket include?" />
      <div>
        <label className="label-base">Capacity</label>
        <div className="flex gap-3 mb-3">
          {[{ val: true, label: 'Unlimited' }, { val: false, label: 'Set a limit' }].map(({ val, label }) => (
            <button key={String(val)} type="button" onClick={() => setData({ ticketUnlimited: val })}
              className={cn('px-5 py-2 rounded-xl border text-sm font-medium transition-all', data.ticketUnlimited === val ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]')}>
              {label}
            </button>
          ))}
        </div>
        {!data.ticketUnlimited && (
          <Input type="number" min="1" placeholder="e.g. 50" value={data.ticketQuantity} onChange={(e) => setData({ ticketQuantity: e.target.value })} hint="Maximum number of RSVPs accepted" />
        )}
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
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Requirements</h2>
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

      {/* Custom Questions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label-base mb-0">Custom RSVP Questions</label>
          <button type="button" onClick={addQuestion} className="text-xs font-semibold text-[#00e5cc] hover:text-[#7fff00] transition-colors flex items-center gap-1">
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
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Frequently Asked Questions</h2>
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
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>RSVP Form Preview</h2>
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
            <div className="w-full py-3 rounded-xl text-sm font-bold text-center text-[#020408]" style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}>
              Submit RSVP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 8 ───────────────────────────────────────────────────────────────────
function Step8({ data, setData, onSubmit, submitting }: { data: WizardData; setData: (d: Partial<WizardData>) => void; onSubmit: (status: 'DRAFT' | 'LIVE') => void; submitting: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Invite & Launch</h2>
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

      {/* Summary */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.1)' }}>
        <h3 className="text-sm font-bold text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>Event Summary</h3>
        {[
          { label: 'Title', value: data.title || '—' },
          { label: 'Category', value: data.category || '—' },
          { label: 'Type', value: data.eventType.replace('_', '-') },
          { label: 'Date', value: data.date ? new Date(data.date).toLocaleDateString('en-CA', { dateStyle: 'full' }) : '—' },
          { label: 'Location', value: data.location || (data.eventType === 'ONLINE' ? 'Online' : '—') },
          { label: 'Capacity', value: data.ticketUnlimited ? 'Unlimited' : (data.ticketQuantity || '—') },
          { label: 'Age Gate', value: data.ageGate > 0 ? `${data.ageGate}+` : 'None' },
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
export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setDataState] = useState<WizardData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const setData = useCallback((updates: Partial<WizardData>) => {
    setDataState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goNext = () => {
    if (step < 9) { setDirection(1); setStep((s) => s + 1); }
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
        customQuestions: JSON.stringify(data.customQuestions),
        faqs: data.faqs,
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
    <Step7 key={8} data={data} />,
    <Step8 key={9} data={data} setData={setData} onSubmit={handleSubmit} submitting={submitting} />,
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#e8f4f8]" style={{ fontFamily: 'var(--font-display)' }}>Create Event</h1>
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
              className={cn('flex-1 h-1.5 rounded-full transition-all duration-300', s.num < step ? 'bg-[#00e5cc] cursor-pointer' : s.num === step ? 'bg-[#7fff00]' : 'bg-[rgba(0,229,204,0.1)]')}
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
      {step < 9 && (
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={goPrev} disabled={step === 1}>
            ← Back
          </Button>
          <span className="text-xs text-[#2d5268]">{step} / {STEPS.length}</span>
          <Button type="button" variant="primary" onClick={goNext} disabled={!canProceed()}>
            {step === 8 ? 'Review & Launch →' : 'Next →'}
          </Button>
        </div>
      )}
      {step === 9 && (
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={goPrev}>← Back</Button>
          <span className="text-xs text-[#2d5268]">{step} / {STEPS.length}</span>
        </div>
      )}
    </div>
  );
}
