import { Providers } from '@/providers/providers';

import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: 'Typesese Dashboard',
    description: 'Typesese Dashboard',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`antialiased`} suppressHydrationWarning>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
