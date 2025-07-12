import { redirect } from 'next/navigation';

import { getCollections } from '@/lib/typesense/collections';
import { checkTypesenseConnection } from '@/lib/typesense/connection-check';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import Header from '@/components/layout/Header';
import AppSidebar from '@/components/sidebar/AppSidebar';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    try {
        // Check connection status first
        const connectionStatus = await checkTypesenseConnection();

        // If connection fails, redirect to connection error page
        if (!connectionStatus.isConnected) {
            redirect('/connection-error');
        }

        // Only fetch collections if connection is successful
        const collections = await getCollections();

        return (
            <SidebarProvider defaultOpen={false}>
                <AppSidebar collections={collections} />
                <SidebarInset>
                    <Header />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        );
    } catch (error) {
        // If there's any error during connection check or collection fetch,
        // redirect to connection error page instead of failing the build
        console.error('Error in layout:', error);
        redirect('/connection-error');
    }
}
