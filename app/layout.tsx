import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mr. Bell Onboarding - WhatsApp Bot in 5 Minuten',
  description: 'Automatische Kundenanfragen 24/7 mit Mr. Bell WhatsApp Bot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
