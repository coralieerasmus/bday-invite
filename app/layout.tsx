import type { Metadata, Viewport } from 'next';
import { Space_Mono, Syne } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

// headline: Alte Haas Grotesk Bold (free font, file lives in app/fonts/)
const alteHaas = localFont({
  src: './fonts/AlteHaasGroteskBold.ttf',
  weight: '700',
  variable: '--font-alte-haas',
});

// wide, quirky sans for the store name, totals and buttons
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
});

// receipt-printer type
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: "Coralie's 22nd Bday — You're Invited",
  description: '17 November, 7–11PM at Philitelaan 67-47. Food and drinks. Coralie themed.',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${alteHaas.variable} ${syne.variable} ${spaceMono.variable} bg-[#0a0a0a]`}>
      <body>{children}</body>
    </html>
  );
}