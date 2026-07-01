import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Inflow Form Designer',
  description: 'Visual drag-and-drop form builder',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
