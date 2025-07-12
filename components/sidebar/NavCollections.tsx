'use client';

import {
  ArrowLeftRight,
  ChevronRight,
  FilePlus,
  ListFilter,
  Folder,
  Forward,
  type LucideIcon,
} from 'lucide-react';
import Link from '@/components/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavCollections({
  collections,
}: {
  collections: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Collections</SidebarGroupLabel>
      <SidebarMenu>
        {collections.map((item) => (
          <Collapsible key={item.name} asChild defaultOpen={true}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.name}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/collections/${item.name}/search`}>
                        <Folder className="text-muted-foreground" />
                        <span>Search Collection</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/collections/${item.name}/documents/export`}>
                        <Forward className="text-muted-foreground" />
                        <span>Export Documents</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/collections/${item.name}/documents/import`}>
                        <Forward className="rotate-180 text-muted-foreground" />
                        <span>Import Documents</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/collections/${item.name}/synonyms`}>
                        <ArrowLeftRight className="text-muted-foreground" />
                        <span>Synonyms</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/collections/${item.name}/curations`}>
                        <ListFilter className="text-muted-foreground" />
                        <span>Curations</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/collections/${item.name}/documents/add`}>
                        <FilePlus className="text-muted-foreground" />
                        <span>Add Document</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
        {/* <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  );
}
