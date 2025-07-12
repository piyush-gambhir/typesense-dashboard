import { getCollections } from '@/lib/typesense/collections';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import Header from '@/components/layout/Header';
import AppSidebar from '@/components/sidebar/AppSidebar';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
}
