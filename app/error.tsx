'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking (Sentry etc.) in production
    console.error('[App Error]', error.digest ?? error.message);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#020408' }}
    >
      <div className="max-w-md">
        <p className="text-5xl mb-6" aria-hidden="true">⚠️</p>
        <h1
          className="text-2xl font-black text-[#e8f4f8] mb-3"
          style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}
        >
          Something went wrong
        </h1>
        <p className="text-[#4d7a90] mb-8 text-sm leading-relaxed">
          An unexpected error occurred. It&rsquo;s been logged and we&rsquo;re looking into it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl text-sm font-bold text-[#020408]"
            style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-[#00e5cc]"
            style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)' }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
