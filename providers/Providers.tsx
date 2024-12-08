'use client';

import { RecoilRootProvider } from '@/providers/RecoilRootProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

import { Toaster } from '@/components/ui/toaster';

import React from 'react';

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <RecoilRootProvider>{children}</RecoilRootProvider>
      <Toaster />
    </ThemeProvider>
  );
}
