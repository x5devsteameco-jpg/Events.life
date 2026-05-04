'use client';

import { useEffect } from 'react';

export function PageViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    // Fire-and-forget — don't block rendering
    fetch(`/api/events/${id}/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: `${url.pathname}${url.search}`,
        utmSource: url.searchParams.get('utm_source'),
        utmMedium: url.searchParams.get('utm_medium'),
        utmCampaign: url.searchParams.get('utm_campaign'),
      }),
    }).catch(() => {});
  }, [id]);
  return null;
}
