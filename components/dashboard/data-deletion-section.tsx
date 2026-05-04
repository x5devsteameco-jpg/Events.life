'use client';

import { useState } from 'react';

export function DataDeletionSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleRequest() {
    setStatus('loading');
    try {
      const res = await fetch('/api/user/data-deletion', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setStatus('done');
        setMessage(json.message ?? 'Request submitted.');
      } else {
        setStatus('error');
        setMessage(json.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <section>
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,60,172,0.04)', border: '1px solid rgba(255,60,172,0.12)' }}>
        <h2 className="text-sm font-bold text-[#ff3cac] mb-1 flex items-center gap-2">
          <span>🗑️</span> Data Deletion (PIPEDA Right to Erasure)
        </h2>
        <p className="text-xs text-[#6b9bb0] mb-4 leading-relaxed">
          Under PIPEDA, you have the right to request deletion of your personal data. Submitting a request will initiate
          a review process. Your account and associated data will be erased within 30 days. Some data may be retained to
          satisfy legal obligations.
        </p>

        {status === 'done' ? (
          <p className="text-xs font-medium text-[#00e5cc]">{message}</p>
        ) : status === 'error' ? (
          <div>
            <p className="text-xs text-[#ff3cac] mb-3">{message}</p>
            <button onClick={() => setStatus('idle')} className="text-xs text-[#4d7a90] underline">Try again</button>
          </div>
        ) : (
          <button
            onClick={handleRequest}
            disabled={status === 'loading'}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#ff3cac] border transition-all hover:bg-[rgba(255,60,172,0.08)] disabled:opacity-50"
            style={{ borderColor: 'rgba(255,60,172,0.2)' }}
          >
            {status === 'loading' ? 'Submitting…' : 'Request Data Deletion'}
          </button>
        )}
      </div>
    </section>
  );
}
