"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
