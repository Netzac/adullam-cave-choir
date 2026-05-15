'use client';

import * as React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { Toaster } from '@/components/ui/sonner';

interface RootLayoutProps {
  children: React.ReactNode;
  locale: string;
}

export function RootLayout({ children, locale }: RootLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div lang={locale} className="relative flex min-h-screen flex-col">
        <Navbar />
        <main id="main" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}
