'use client';

import {
    ArrowLeftRight,
    BarChart3,
    CheckCircle,
    ChevronRight,
    Database,
    FilePlus,
    Folder,
    Forward,
    ListFilter,
    type LucideIcon,
    Search,
    Settings,
} from 'lucide-react';

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
} from '@/components/ui/sidebar';

import Link from '@/components/link';

export function NavCollections({
    collections,
}: {
    collections: {
        name: string;
        url: string;
        icon: LucideIcon;
    }[];
}) {
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
                                            <Link
                                                href={`/collections/${item.name}/search`}
                                            >
                                                <Folder className="text-muted-foreground" />
                                                <span>Search Collection</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/documents/export`}
                                            >
                                                <Forward className="text-muted-foreground" />
                                                <span>Export Documents</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/documents/import`}
                                            >
                                                <Forward className="rotate-180 text-muted-foreground" />
                                                <span>Import Documents</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/synonyms`}
                                            >
                                                <ArrowLeftRight className="text-muted-foreground" />
                                                <span>Synonyms</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/curations`}
                                            >
                                                <ListFilter className="text-muted-foreground" />
                                                <span>Curations</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/documents/add`}
                                            >
                                                <FilePlus className="text-muted-foreground" />
                                                <span>Add Document</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/documents/bulk`}
                                            >
                                                <Database className="text-muted-foreground" />
                                                <span>Bulk Operations</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/documents/stats`}
                                            >
                                                <BarChart3 className="text-muted-foreground" />
                                                <span>Document Stats</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/documents/validator`}
                                            >
                                                <CheckCircle className="text-muted-foreground" />
                                                <span>Document Validator</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/documents/suggestions`}
                                            >
                                                <Search className="text-muted-foreground" />
                                                <span>
                                                    Document Suggestions
                                                </span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link
                                                href={`/collections/${item.name}/management`}
                                            >
                                                <Settings className="text-muted-foreground" />
                                                <span>Management</span>
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
