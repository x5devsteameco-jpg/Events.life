'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/toast';
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
  requiresCertification: boolean;
  certificationNote: string;
  customQuestions: CustomQuestion[];
}

export function RSVPForm({ eventId, title, requiresCertification, certificationNote, customQuestions }: Props) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'CONFIRMED' | 'WAITLISTED' | null>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, customAnswers }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast(json.error || 'Failed to RSVP', 'error');
        return;
      }

      setRsvpStatus(json.data.status);
      setSubmitted(true);
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  if (submitted && rsvpStatus) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 text-center"
          style={{ background: 'rgba(12,26,31,0.85)', border: '1px solid rgba(0,229,204,0.2)' }}
        >
          <div className="text-5xl mb-4">{rsvpStatus === 'CONFIRMED' ? '🎉' : '⏳'}</div>
          <h3 className="text-xl font-black text-[#00e5cc] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {rsvpStatus === 'CONFIRMED' ? "You're In!" : "You're on the waitlist"}
          </h3>
          <p className="text-sm text-[#4d7a90]">
            {rsvpStatus === 'CONFIRMED'
              ? `Your RSVP for ${title} is confirmed. Check your email for details.`
              : "We'll notify you if a spot opens up."}
          </p>
          {rsvpStatus === 'CONFIRMED' && (
            <div className="mt-4 p-3 rounded-xl text-xs text-[#4d7a90]" style={{ background: 'rgba(0,229,204,0.05)', border: '1px solid rgba(0,229,204,0.1)' }}>
              A confirmation has been sent to your email.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(12,26,31,0.85)', border: '1px solid rgba(0,229,204,0.15)' }}>
      <div className="px-5 py-4" style={{ background: 'rgba(0,229,204,0.06)', borderBottom: '1px solid rgba(0,229,204,0.1)' }}>
        <h3 className="text-sm font-black text-[#00e5cc]" style={{ fontFamily: 'var(--font-display)' }}>RSVP to {title}</h3>
        <p className="text-xs text-[#4d7a90] mt-0.5">Free event · Takes 30 seconds</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        <Input
          label="Full Name *"
          placeholder="Jane Doe"
          error={errors.guestName?.message}
          {...register('guestName')}
        />
        <Input
          label="Email Address *"
          type="email"
          placeholder="jane@example.com"
          error={errors.guestEmail?.message}
          {...register('guestEmail')}
        />
        <Input
          label="Store Name"
          placeholder="e.g. The Green Room Dispensary"
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

        {requiresCertification && certificationNote && (
          <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(255,60,172,0.06)', border: '1px solid rgba(255,60,172,0.15)' }}>
            <p className="text-[#ff3cac] font-semibold mb-1">Certification Required</p>
            <p className="text-[#6b9bb0]">You must hold a valid {certificationNote} to attend. Staff may verify at the door.</p>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}>
          Submit RSVP
        </Button>
      </form>
    </div>
  );
}
