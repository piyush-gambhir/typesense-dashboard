import { redirect } from 'next/navigation';

import { hasEnvConnectionConfig } from '@/lib/connection-config';
import { getCollections } from '@/lib/typesense/collections';
import { checkTypesenseConnection } from '@/lib/typesense/connection-check';
import { cookies } from 'next/headers';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import Header from '@/components/layout/header';
import AppSidebar from '@/components/sidebar/app-sidebar';
import { TypesenseVersionProvider } from '@/providers/typesense-version-provider';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    try {

        if (!hasEnvConnectionConfig()) {

            const cookieStore = await cookies();
            const configCookie = cookieStore.get('typesense-connection-config');

            if (!configCookie) {
                redirect('/setup');
            }

            try {
                const parsedConfig = JSON.parse(configCookie.value);
                if (
                    !parsedConfig.host ||
                    !parsedConfig.port ||
                    !parsedConfig.protocol ||
                    !parsedConfig.apiKey
                ) {
                    redirect('/setup');
                }
            } catch {
                redirect('/setup');
            }
        }


        const connectionStatus = await checkTypesenseConnection();


        if (!connectionStatus.isConnected) {
            redirect('/connection-error');
        }


        const collections = await getCollections();

        return (
            <TypesenseVersionProvider
                serverVersion={connectionStatus.serverVersion}
            >
                <SidebarProvider defaultOpen={false}>
                    <AppSidebar
                        collections={collections}
                        serverVersion={connectionStatus.serverVersion}
                    />
                    <SidebarInset>
                        <Header />
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </TypesenseVersionProvider>
        );
    } catch (error) {


        console.error('Error in layout:', error);
        redirect('/connection-error');
    }
}
