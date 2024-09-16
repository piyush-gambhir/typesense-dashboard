"use client";
import React from "react";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { RecoilRootProvider } from "@/providers/RecoilRootProvider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RecoilRootProvider>{children}</RecoilRootProvider>
    </ThemeProvider>
  );
}
