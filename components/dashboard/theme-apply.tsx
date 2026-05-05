'use client';

import { useEffect } from 'react';

/**
 * Reads the gw_theme cookie (set by settings save) and applies
 * data-theme to the nearest .gw-dashboard ancestor (or body).
 * Falls back to the server-rendered data-theme if no cookie.
 */
export function ThemeApply({ serverTheme }: { serverTheme: string }) {
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('gw_theme='))
      ?.split('=')[1];
    const theme = cookie ?? serverTheme;
    const el = document.querySelector('[data-theme]') as HTMLElement | null;
    if (el) el.setAttribute('data-theme', theme);
  }, [serverTheme]);

  return null;
}
