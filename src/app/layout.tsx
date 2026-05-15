import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adullam Cave Choir',
  description: 'from the Cave to the Stage',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className="dark">
      <body>
        {children}
      </body>
    </html>
  );
}