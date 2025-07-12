'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import React from 'react';

import { Toaster } from '@/components/ui/toaster';

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="typesense-dashboard-theme"
    >
      {children}
      <Toaster />
    </NextThemeProvider>
  );
}
