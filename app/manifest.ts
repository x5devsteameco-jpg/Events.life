import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gatewise Events',
    short_name: 'Gatewise',
    description: 'Your Events. Your Rules. Industry-neutral event management.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020408',
    theme_color: '#00e5cc',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/brand-mark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/brand-mark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'social', 'productivity'],
    lang: 'en-CA',
  };
}
