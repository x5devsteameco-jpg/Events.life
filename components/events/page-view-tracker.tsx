'use client';

import { useEffect } from 'react';

export function PageViewTracker({ id }: { id: string }) {
  useEffect(() => {
    // Fire-and-forget — don't block rendering
    fetch(`/api/events/${id}/pageview`, { method: 'POST' }).catch(() => {});
  }, [id]);
  return null;
}
