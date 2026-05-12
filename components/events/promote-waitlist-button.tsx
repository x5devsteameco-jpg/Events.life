'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  eventId: string;
  waitlistedIds: string[];
}

export function PromoteWaitlistButton({ eventId, waitlistedIds }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (waitlistedIds.length === 0) return null;

  async function handlePromote() {
    if (!confirm(`Promote all ${waitlistedIds.length} waitlisted attendee(s) to CONFIRMED?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvpIds: waitlistedIds, status: 'CONFIRMED' }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePromote}
      disabled={loading || done}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,229,204,0.25)]"
      style={{ background: done ? 'rgba(0,229,204,0.12)' : 'linear-gradient(135deg, #00c4a8, #00e5cc)', color: done ? '#00e5cc' : '#020408' }}
    >
      {done ? 'Promoted' : loading ? 'Promoting...' : `Promote All (${waitlistedIds.length})`}
    </button>
  );
}
