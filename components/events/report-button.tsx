'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REASONS = [
  'Spam or misleading',
  'Inappropriate content',
  'Fake event',
  'Harassment',
  'Copyright violation',
  'Other',
];

interface ReportButtonProps {
  targetType: string;
  targetId: string;
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, details }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[#4d7a90] hover:text-[#ff6b6b] transition-colors flex items-center gap-1"
        aria-label="Report this content"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        Report
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => !loading && setOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="relative w-full max-w-sm rounded-2xl p-6 pointer-events-auto"
                style={{ background: 'rgba(12,26,31,0.98)', border: '1px solid rgba(0,229,204,0.15)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
              >
                {submitted ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,229,204,0.15)' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </motion.div>
                    <p className="text-[#c4dde6] text-sm text-center">Thank you for your report. Our team will review it.</p>
                    <button onClick={() => { setOpen(false); setSubmitted(false); setReason(''); setDetails(''); }}
                      className="px-5 py-2 rounded-lg text-sm font-bold text-[#020408]" style={{ background: '#00e5cc' }}>
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-[#e8f4f8] font-bold mb-4">Report Content</h3>
                    <div className="space-y-2 mb-4">
                      {REASONS.map((r) => (
                        <label key={r} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            reason === r ? 'border-[#00e5cc] bg-[#00e5cc]' : 'border-[#2a4a55] group-hover:border-[#00e5cc]/50'
                          }`}>
                            {reason === r && <div className="w-1.5 h-1.5 rounded-full bg-[#020408]"/>}
                          </div>
                          <input type="radio" name="reason" value={r} checked={reason === r}
                            onChange={() => setReason(r)} className="sr-only"/>
                          <span className="text-sm text-[#7db3c4]">{r}</span>
                        </label>
                      ))}
                    </div>
                    {reason && (
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Additional details (optional)"
                        rows={3}
                        maxLength={500}
                        className="w-full rounded-lg px-3 py-2 text-sm text-[#c4dde6] resize-none mb-4"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,229,204,0.15)', outline: 'none' }}
                      />
                    )}
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setOpen(false)} disabled={loading}
                        className="px-4 py-2 text-sm text-[#4d7a90] hover:text-[#7db3c4] transition-colors">
                        Cancel
                      </button>
                      <button onClick={submit} disabled={!reason || loading}
                        className="px-5 py-2 rounded-lg text-sm font-bold text-[#020408] disabled:opacity-50 transition-opacity"
                        style={{ background: '#ff3cac' }}>
                        {loading ? 'Submitting…' : 'Submit Report'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
