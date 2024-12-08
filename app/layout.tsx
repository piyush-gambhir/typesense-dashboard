import type { Metadata } from "next";

import "./globals.css";

import { Providers } from "@/providers/Providers";

export const metadata: Metadata = {
  title: "Typesese Dashboard",
  description: "Typesese Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
