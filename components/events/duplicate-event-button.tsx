'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DuplicateEventButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDuplicate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const { data } = await res.json();
        router.push(`/events/${data.id}/edit`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="px-4 py-2 rounded-xl border text-sm font-medium text-[#4d7a90] transition-all hover:text-[#e8f4f8] hover:bg-[rgba(0,229,204,0.04)] disabled:opacity-50"
      style={{ borderColor: 'rgba(0,229,204,0.12)' }}
    >
      {loading ? 'Duplicating…' : 'Duplicate'}
    </button>
  );
}
