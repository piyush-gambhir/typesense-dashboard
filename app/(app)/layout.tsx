import { getCollections } from '@/lib/typesense/collections';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import Header from '@/components/Header';
import AppSidebar from '@/components/sidebar/AppSidebar';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const collections = await getCollections();

  return (
    <SidebarProvider>
      <AppSidebar collections={collections} />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
