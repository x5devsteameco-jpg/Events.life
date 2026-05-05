import type { Metadata, Viewport } from 'next';
import './globals.css';
import { spaceGrotesk, cinzel, bebasNeue } from '@/lib/fonts';
import { Providers } from '@/components/providers';
import { ToastProvider } from '@/components/toast';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { CookieConsentBanner } from '@/components/layout/cookie-consent-banner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#020408' },
    { media: '(prefers-color-scheme: light)', color: '#020408' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Gatewise Events — Your Events. Your Rules.',
    template: '%s | Gatewise Events',
  },
  description:
    'Industry-neutral event management platform for Canadian hosts. Age gates, compliance workflows, RSVP collection, and team collaboration.',
  keywords: ['events', 'event management', 'RSVP', 'ticketing', 'compliance', 'Canada'],
  authors: [{ name: 'Gatewise Events' }],
  openGraph: {
    title: 'Gatewise Events — Your Events. Your Rules.',
    description: 'The industry-neutral event platform with strong compliance controls.',
    type: 'website',
    locale: 'en_CA',
    siteName: 'Gatewise Events',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gatewise Events',
    description: 'Your Events. Your Rules.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gatewise',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${cinzel.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#020408] pb-24 text-[#e8f4f8] lg:pb-0">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold focus:text-[#020408]"
          style={{ background: '#00e5cc' }}
        >
          Skip to main content
        </a>
        <Providers>
          <ToastProvider>
            {children}
            <MobileBottomNav />
            <CookieConsentBanner />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
