'use client';

import { RecoilRootProvider } from '@/providers/RecoilRootProvider';

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
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <RecoilRootProvider>{children}</RecoilRootProvider>
      <Toaster />
    </NextThemeProvider>
  );
}
