import { Providers } from '@/providers/Providers';

export default function ConnectionErrorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                <Providers>
                    <div className="min-h-screen bg-background">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
