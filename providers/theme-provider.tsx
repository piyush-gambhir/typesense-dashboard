'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

export function ThemeProvider({
    children,
    ...props
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
