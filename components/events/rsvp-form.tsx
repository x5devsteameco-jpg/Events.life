'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input, FloatingInput, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/toast';
import { Confetti } from '@/components/events/confetti';
import { generateICS, downloadICS, googleCalendarUrl } from '@/lib/calendar';
import { QRCodeDisplay } from '@/components/events/qr-code-display';
import type { CustomQuestion } from '@/lib/types';

const schema = z.object({
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  guestEmail: z.string().email('Invalid email address'),
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  brand: z.string().optional(),
  position: z.string().optional(),
  ageConfirmed: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  eventId: string;
  title: string;
  eventDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventSlug?: string;
  requiresCertification: boolean;
  certificationNote: string;
  customQuestions: CustomQuestion[];
  confirmationMessage?: string;
  promoCodes?: { id: string; code: string; discountType: 'percent' | 'flat'; discountValue: string; usageLimit: string; unlimited: boolean }[];
}

export function RSVPForm({ eventId, title, eventDate, eventEndDate, eventLocation, eventSlug, requiresCertification, certificationNote, customQuestions, confirmationMessage, promoCodes }: Props) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'CONFIRMED' | 'WAITLISTED' | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certUploading, setCertUploading] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; discountType: string; discountValue: string } | null>(null);
  const [promoError, setPromoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyPromoCode = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) { setPromoError('Enter a promo code'); return; }
    const found = (promoCodes ?? []).find((pc) => pc.code.toUpperCase() === code);
    if (!found) { setPromoError('Code not found'); setPromoApplied(null); return; }
    setPromoApplied({ code: found.code, discountType: found.discountType, discountValue: found.discountValue });
    setPromoError('');
    toast(`Promo code applied: ${found.discountType === 'percent' ? found.discountValue + '% off' : '$' + found.discountValue + ' off'}`, 'success');
  };

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const uploadCert = async (file: File): Promise<string | null> => {
    setCertUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      return res.ok ? json.url : null;
    } catch {
      return null;
    } finally {
      setCertUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    let certificationUrl: string | undefined;

    if (requiresCertification && certFile) {
      const url = await uploadCert(certFile);
      if (!url) {
        toast('Failed to upload certification — please try again', 'error');
        return;
      }
      certificationUrl = url;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, customAnswers, certificationUrl, marketingConsent, promoCode: promoApplied?.code }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast(json.error || 'Failed to RSVP', 'error');
        return;
      }

      setRsvpStatus(json.data.status);
      setSubmitted(true);
      if (json.data.status === 'CONFIRMED') {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 2200);
      }
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  if (submitted && rsvpStatus) {
    const startDate = eventDate ? new Date(eventDate) : new Date();
    const endDate = eventEndDate ? new Date(eventEndDate) : undefined;
    const icsContent = generateICS({
      title,
      location: eventLocation,
      startDate,
      endDate,
      url: eventSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/event/${eventSlug}` : undefined,
      uid: eventId,
    });
    const gcalUrl = googleCalendarUrl({ title, location: eventLocation, startDate, endDate });

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 text-center relative overflow-hidden"
          style={{ background: 'rgba(12,26,31,0.85)', border: '1px solid rgba(0,229,204,0.2)' }}
        >
          <Confetti active={confettiActive} />
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            className="text-5xl mb-4"
          >
            {rsvpStatus === 'CONFIRMED' ? '◈' : '◬'}
          </motion.div>
          <h3 className="text-xl font-black text-[#00e5cc] mb-2" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
            {rsvpStatus === 'CONFIRMED' ? "You're In!" : "You're on the waitlist"}
          </h3>
          <p className="text-sm text-[#4d7a90]">
            {rsvpStatus === 'CONFIRMED'
              ? (confirmationMessage || `Your RSVP for ${title} is confirmed. Check your email for details.`)
              : "We'll notify you if a spot opens up."}
          </p>
          {rsvpStatus === 'CONFIRMED' && eventSlug && (
            <div className="mt-5">
              <QRCodeDisplay value={typeof window !== 'undefined' ? `${window.location.origin}/event/${eventSlug}` : `/event/${eventSlug}`} size={140} />
            </div>
          )}
          {rsvpStatus === 'CONFIRMED' && (
            <div className="mt-5 space-y-2">
              <p className="text-xs text-[#4d7a90] mb-3">Add to your calendar so you don&apos;t miss it</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => downloadICS(icsContent, `${title.slice(0, 30).replace(/\s+/g, '-')}.ics`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#00e5cc] transition-all hover:bg-[rgba(0,229,204,0.1)] active:scale-95"
                  style={{ border: '1px solid rgba(0,229,204,0.25)', background: 'rgba(0,229,204,0.05)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Download .ics
                </button>
                <a
                  href={gcalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#7aafc4] transition-all hover:bg-[rgba(122,175,196,0.08)] active:scale-95"
                  style={{ border: '1px solid rgba(122,175,196,0.18)', background: 'rgba(122,175,196,0.04)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Google Calendar
                </a>
                {eventSlug && typeof window !== 'undefined' && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/event/${eventSlug}`;
                      if (navigator.share) {
                        navigator.share({ title, url }).catch(() => null);
                      } else {
                        navigator.clipboard.writeText(url).then(() => null).catch(() => null);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#9c6bff] transition-all hover:bg-[rgba(156,107,255,0.08)] active:scale-95"
                    style={{ border: '1px solid rgba(156,107,255,0.2)', background: 'rgba(156,107,255,0.04)' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share Event
                  </button>
                )}
                {eventSlug && typeof window !== 'undefined' && (
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Join me at ${title}`)}&body=${encodeURIComponent(`Hey! I just RSVP'd to "${title}" and think you'd love it too. Check it out:\n\n${window.location.origin}/event/${eventSlug}`)}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#10b981] transition-all hover:bg-[rgba(16,185,129,0.08)] active:scale-95"
                    style={{ border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Invite a Friend
                  </a>
                )}
              </div>
            </div>
          )}
        </motion.div>
            {eventSlug && (
              <div className="mt-3 text-center">
                <a
                  href={`/rsvp/manage?email=${encodeURIComponent('')}&slug=${encodeURIComponent(eventSlug)}`}
                  className="text-xs text-[#2d5268] hover:text-[#4d7a90] underline transition-colors"
                >
                  Need to cancel? Manage your RSVP →
                </a>
              </div>
            )}
      </AnimatePresence>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(12,26,31,0.85)', border: '1px solid rgba(0,229,204,0.15)' }}>
      <div className="px-5 py-4" style={{ background: 'rgba(0,229,204,0.06)', borderBottom: '1px solid rgba(0,229,204,0.1)' }}>
        <h3 className="text-sm font-black text-[#00e5cc]" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>RSVP to {title}</h3>
        <p className="text-xs text-[#4d7a90] mt-0.5">Free event · Takes 30 seconds</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        <FloatingInput
          label="Full Name *"
          error={errors.guestName?.message}
          {...register('guestName')}
        />
        <FloatingInput
          label="Email Address *"
          type="email"
          error={errors.guestEmail?.message}
          {...register('guestEmail')}
        />
        <FloatingInput
          label="Store Name"
          {...register('storeName')}
        />
        <Input
          label="Store Address"
          placeholder="123 Main St, Vancouver, BC"
          {...register('storeAddress')}
        />
        <Input
          label="Brand / Company"
          placeholder="e.g. Acme Cannabis Co."
          {...register('brand')}
        />
        <Input
          label="Position / Title"
          placeholder="e.g. Store Manager"
          {...register('position')}
        />

        {/* Custom Questions */}
        {customQuestions.map((q) => (
          <div key={q.id}>
            {q.type === 'checkbox' ? (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`cq-${q.id}`}
                  className="accent-[#00e5cc]"
                  checked={customAnswers[q.id] === 'true'}
                  onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.checked ? 'true' : 'false' }))}
                />
                <label htmlFor={`cq-${q.id}`} className="text-sm text-[#e8f4f8] cursor-pointer">
                  {q.label} {q.required && <span className="text-[#ff3cac]">*</span>}
                </label>
              </div>
            ) : q.type === 'select' && q.options ? (
              <div>
                <label className="label-base">{q.label} {q.required && <span className="text-[#ff3cac]">*</span>}</label>
                <select
                  value={customAnswers[q.id] ?? ''}
                  onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  className="input-base w-full"
                >
                  <option value="">Select…</option>
                  {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="label-base">{q.label} {q.required && <span className="text-[#ff3cac]">*</span>}</label>
                <Textarea
                  rows={2}
                  placeholder="Your answer…"
                  value={customAnswers[q.id] ?? ''}
                  onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                />
              </div>
            )}
          </div>
        ))}

        {/* Certification upload */}
        {requiresCertification && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(255,60,172,0.06)', border: '1px solid rgba(255,60,172,0.15)' }}>
              <p className="text-[#ff3cac] font-semibold mb-1 flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> Certification Required</p>
              <p className="text-[#6b9bb0]">
                {certificationNote
                  ? `Please attach your ${certificationNote} certificate below.`
                  : 'Please attach your certification document below.'}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setCertFile(file);
              }}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: certFile ? 'rgba(0,229,204,0.08)' : 'rgba(12,26,31,0.6)',
                  border: certFile ? '1px solid rgba(0,229,204,0.3)' : '1px dashed rgba(0,229,204,0.2)',
                  color: certFile ? '#00e5cc' : '#4d7a90',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {certFile ? (
                  <span className="truncate">{certFile.name}</span>
                ) : (
                  <span>Upload certificate (PDF, JPG, PNG)</span>
                )}
              </button>
              {certFile && (
                <button
                  type="button"
                  onClick={() => {
                    setCertFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-[#ff3cac] hover:bg-[rgba(255,60,172,0.08)] transition-colors"
                  aria-label="Remove file"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {/* CASL Marketing Consent */}
        <div className="flex items-start gap-3 py-2">
          <input
            type="checkbox"
            id="casl-consent"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 accent-[#00e5cc] w-4 h-4 flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="casl-consent" className="text-[11px] text-[#4d7a90] leading-relaxed cursor-pointer">
            I agree to receive event updates and promotional emails from the organizer. You can unsubscribe at any time. Consent not required to RSVP.
          </label>
        </div>

        {/* Promo code */}
        {(promoCodes ?? []).length > 0 && (
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(6,13,16,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}>
            <p className="text-xs font-semibold text-[#4d7a90] mb-2">Have a promo code?</p>
            {promoApplied ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00e5cc]">✓ {promoApplied.code} applied</span>
                <span className="text-xs text-[#4d7a90]">
                  ({promoApplied.discountType === 'percent' ? `${promoApplied.discountValue}% off` : `$${promoApplied.discountValue} off`})
                </span>
                <button type="button" onClick={() => { setPromoApplied(null); setPromoCodeInput(''); }} className="ml-auto text-xs text-[#4d7a90] hover:text-[#ff3cac] transition-colors">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => { setPromoCodeInput(e.target.value.toUpperCase()); setPromoError(''); }}
                  placeholder="EARLYBIRD2024"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg text-xs font-mono text-[#e8f4f8] bg-transparent outline-none"
                  style={{ border: '1px solid rgba(0,229,204,0.15)' }}
                />
                <button type="button" onClick={applyPromoCode} className="px-3 py-2 rounded-lg text-xs font-semibold text-[#00e5cc] hover:bg-[rgba(0,229,204,0.08)] transition-colors" style={{ border: '1px solid rgba(0,229,204,0.2)' }}>
                  Apply
                </button>
              </div>
            )}
            {promoError && <p className="text-xs text-[#ff3cac] mt-1">{promoError}</p>}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting || certUploading}
          disabled={requiresCertification && !certFile}
        >
          {certUploading ? 'Uploading cert…' : 'Submit RSVP'}
        </Button>
        {requiresCertification && !certFile && (
          <p className="text-[10px] text-center text-[#4d7a90]">Certification upload required to submit</p>
        )}
        <p className="text-[10px] text-center text-[#2d5268]">
          By submitting, you agree to our{' '}
          <a href="/privacy" target="_blank" className="underline hover:text-[#00e5cc]">Privacy Policy</a>.
          {' '}Your data is protected under PIPEDA.
        </p>
      </form>
    </div>
  );
}
