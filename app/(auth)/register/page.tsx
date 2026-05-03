'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signUpSchema, type SignUpInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      acceptedTerms: false,
      acceptedPrivacy: false,
      acceptedHostResponsibility: false,
    },
  });

  async function onSubmit(data: SignUpInput) {
    setServerError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || 'Registration failed. Please try again.');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login?registered=1'), 1500);
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  }

  if (success) {
    return (
      <div className="p-8 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,229,204,0.12)', border: '2px solid rgba(0,229,204,0.3)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#e8f4f8] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Account created!</h2>
          <p className="text-sm text-[#4d7a90]">Redirecting you to sign in…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-[#e8f4f8] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Create your account
        </h1>
        <p className="text-sm text-[#4d7a90] mb-8">Start hosting events for free</p>

        {serverError && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-xl text-sm text-[#ff3cac] flex items-center gap-3" style={{ background: 'rgba(255,60,172,0.08)', border: '1px solid rgba(255,60,172,0.2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {serverError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            hint="Must be at least 8 characters"
            {...register('password')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company / Brand"
              type="text"
              autoComplete="organization"
              placeholder="Your Company"
              error={errors.company?.message}
              {...register('company')}
            />
            <Input
              label="Your Position"
              type="text"
              placeholder="e.g. Brand Rep"
              error={errors.position?.message}
              {...register('position')}
            />
          </div>

          <div className="space-y-3 rounded-xl p-4" style={{ background: 'rgba(0,229,204,0.05)', border: '1px solid rgba(0,229,204,0.14)' }}>
            <label className="flex items-start gap-3 text-sm text-[#7aafc4]">
              <input type="checkbox" className="mt-0.5" {...register('acceptedTerms')} />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="text-[#00e5cc] hover:text-[#7fff00]">Terms of Service</Link>.
              </span>
            </label>
            {errors.acceptedTerms?.message && <p className="text-xs text-[#ff3cac]">{errors.acceptedTerms.message}</p>}

            <label className="flex items-start gap-3 text-sm text-[#7aafc4]">
              <input type="checkbox" className="mt-0.5" {...register('acceptedPrivacy')} />
              <span>
                I agree to the{' '}
                <Link href="/privacy" className="text-[#00e5cc] hover:text-[#7fff00]">Privacy Policy</Link>.
              </span>
            </label>
            {errors.acceptedPrivacy?.message && <p className="text-xs text-[#ff3cac]">{errors.acceptedPrivacy.message}</p>}

            <label className="flex items-start gap-3 text-sm text-[#7aafc4]">
              <input type="checkbox" className="mt-0.5" {...register('acceptedHostResponsibility')} />
              <span>
                I confirm I am solely responsible for my event content, promotion, legal compliance, permits, and attendee safety.
              </span>
            </label>
            {errors.acceptedHostResponsibility?.message && <p className="text-xs text-[#ff3cac]">{errors.acceptedHostResponsibility.message}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? 'Creating account…' : 'Create Free Account'}
          </Button>
        </form>

        <p className="text-center text-xs text-[#2d5268] mt-4 leading-relaxed">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-[#4d7a90] hover:text-[#00e5cc]">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#4d7a90] hover:text-[#00e5cc]">Privacy Policy</Link>.
        </p>

        <p className="text-center text-sm text-[#4d7a90] mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00e5cc] font-semibold hover:text-[#7fff00] transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
