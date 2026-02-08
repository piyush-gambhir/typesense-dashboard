import { NeueMontreal } from '@/fonts/fonts';
import { Providers } from '@/providers/providers';

import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: 'Typesense Dashboard',
    description: 'Modern search analytics & management for Typesense',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${NeueMontreal.variable} font-sans antialiased`}
                suppressHydrationWarning
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
