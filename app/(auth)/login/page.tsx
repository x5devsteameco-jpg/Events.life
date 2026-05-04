'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signInSchema, type SignInInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const callbackUrl = '/dashboard';
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInInput) {
    setServerError('');
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError('Invalid email or password. Please try again.');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="p-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-2xl font-black text-[#e8f4f8] mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Welcome back
        </h1>
        <p className="text-sm text-[#4d7a90] mb-8">
          Sign in to manage your events
        </p>

        {serverError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl text-sm text-[#ff3cac] flex items-center gap-3"
            style={{ background: 'rgba(255,60,172,0.08)', border: '1px solid rgba(255,60,172,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {serverError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="text-right mt-1.5">
              <Link href="/forgot-password" className="text-xs text-[#4d7a90] hover:text-[#00e5cc] transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#4d7a90] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#00e5cc] font-semibold hover:text-[#7fff00] transition-colors">
            Create one free
          </Link>
        </p>

          <div className="mt-8 pt-6 border-t border-[rgba(0,229,204,0.08)] grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '🔒', label: 'Secure Login' },
              { icon: '⚡', label: 'Instant Access' },
              { icon: '🍁', label: 'Canadian Hosted' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-lg mb-1">{item.icon}</div>
                <p className="text-[10px] text-[#2d5268] uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
      </motion.div>
    </div>
  );
}
