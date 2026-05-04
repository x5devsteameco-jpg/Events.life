'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  return (
    <div className="p-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(0,229,204,0.1)', border: '1px solid rgba(0,229,204,0.2)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1
          className="text-2xl font-black text-[#e8f4f8] mb-1 text-center"
          style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}
        >
          Reset Password
        </h1>
        <p className="text-sm text-[#4d7a90] mb-8 text-center">
          Password resets are handled via our support team.
        </p>

        <div className="p-5 rounded-xl mb-6" style={{ background: 'rgba(0,229,204,0.05)', border: '1px solid rgba(0,229,204,0.15)' }}>
          <p className="text-sm text-[#7aafc4] leading-relaxed">
            To reset your password, please email us at{' '}
            <a
              href="mailto:support@gatewise.ca"
              className="text-[#00e5cc] font-semibold hover:text-[#7fff00] transition-colors"
            >
              support@gatewise.ca
            </a>{' '}
            with the subject line <span className="text-[#e8f4f8] font-medium">&ldquo;Password Reset&rdquo;</span> from your registered email address. We&apos;ll send you a new temporary password within 24 hours.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)', color: '#00e5cc' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}
