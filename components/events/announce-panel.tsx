'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/input';

interface Props {
  eventId: string;
  confirmedCount: number;
}

const STATUS_OPTIONS = [
  { value: 'CONFIRMED', label: 'Confirmed Attendees Only' },
  { value: 'WAITLISTED', label: 'Waitlisted Only' },
  { value: 'ALL', label: 'All RSVPs (Confirmed + Waitlisted)' },
];

export function AnnouncePanel({ eventId, confirmedCount }: Props) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('CONFIRMED');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/announce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim(), statusFilter }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send');
      } else {
        setResult({ sent: data.sent, failed: data.failed ?? 0 });
        setSubject('');
        setMessage('');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
        <div>
          <h3 className="text-base font-semibold text-[#e8f4f8]">Message Attendees</h3>
          <p className="text-sm text-[#4d7a90] mt-0.5">
            Send an email announcement to your event attendees.{' '}
            {confirmedCount > 0 && <span className="text-[#00e5cc]">{confirmedCount} confirmed attendee{confirmedCount !== 1 ? 's' : ''}.</span>}
          </p>
        </div>

        {/* Audience selector */}
        <div className="space-y-2">
          <label className="label-base">Send To</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  statusFilter === opt.value
                    ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]'
                    : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          placeholder="Important update about your attendance…"
          hint={`${subject.length}/120`}
        />

        <Textarea
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here. Be clear and concise — attendees will receive this via email."
          rows={6}
          maxLength={2000}
          showCount
        />

        {error && (
          <p className="text-sm text-[#ff3cac] flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            {error}
          </p>
        )}

        {result && (
          <div className="flex items-center gap-2 text-sm text-[#00e5cc]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Sent to {result.sent} attendee{result.sent !== 1 ? 's' : ''}.
            {result.failed > 0 && <span className="text-[#ff3cac]"> {result.failed} failed.</span>}
          </div>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !subject.trim() || !message.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#020408] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
        >
          {loading ? 'Sending…' : 'Send Announcement'}
        </button>
      </div>

      <div className="p-4 rounded-xl text-sm text-[#4d7a90]" style={{ background: 'rgba(12,26,31,0.4)', border: '1px solid rgba(0,229,204,0.06)' }}>
        <strong className="text-[#7aafc4]">Tips:</strong> Keep messages brief and actionable. Include any important changes like venue updates, schedule changes, or what attendees need to bring.
      </div>
    </div>
  );
}
