import type { Metadata, Viewport } from 'next';
import './globals.css';
import { spaceGrotesk, cinzel, bebasNeue } from '@/lib/fonts';
import { Providers } from '@/components/providers';
import { ToastProvider } from '@/components/toast';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020408',
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
      <body className="min-h-full flex flex-col bg-[#020408] text-[#e8f4f8]">
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
