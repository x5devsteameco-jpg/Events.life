import { Space_Grotesk, Cinzel, Bebas_Neue } from 'next/font/google';

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
});

export const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-label',
  display: 'swap',
});
