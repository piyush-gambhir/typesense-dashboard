'use client';

import {
    ArrowLeftRight,
    BarChart3,
    ChevronRight,
    Database,
    FileText,
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
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Collections
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {collections.length === 0 ? (
                    <div className="px-2 py-3">
                        <p className="text-xs text-muted-foreground/60 text-center">
                            No collections yet
                        </p>
                        <Link 
                            href="/collections" 
                            className="text-xs text-primary hover:text-primary/80 block text-center mt-1 transition-colors duration-200"
                        >
                            Create your first collection
                        </Link>
                    </div>
                ) : (
                    collections.map((item) => (
                    <Collapsible key={item.name} asChild defaultOpen={false}>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                asChild 
                                tooltip={item.name}
                                className="transition-all duration-200 hover:bg-muted/60 hover:shadow-sm"
                            >
                                <Link href={item.url}>
                                    <item.icon className="h-4 w-4 transition-colors duration-200" />
                                    <span className="font-medium truncate">{item.name}</span>
                                </Link>
                            </SidebarMenuButton>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform duration-200 hover:bg-muted/60">
                                    <ChevronRight className="h-3 w-3" />
                                    <span className="sr-only">Toggle collection menu</span>
                                </SidebarMenuAction>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="transition-all duration-200">
                                <SidebarMenuSub className="ml-4 space-y-1 border-l border-border/50 pl-3">
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton 
                                            asChild
                                            className="transition-all duration-200 hover:bg-muted/40 hover:text-foreground"
                                        >
                                            <Link href={`/collections/${item.name}/search`}>
                                                <Search className="h-3 w-3 text-muted-foreground/70" />
                                                <span className="text-sm">Search</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton 
                                            asChild
                                            className="transition-all duration-200 hover:bg-muted/40 hover:text-foreground"
                                        >
                                            <Link href={`/collections/${item.name}/documents`}>
                                                <FileText className="h-3 w-3 text-muted-foreground/70" />
                                                <span className="text-sm">Documents</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton 
                                            asChild
                                            className="transition-all duration-200 hover:bg-muted/40 hover:text-foreground"
                                        >
                                            <Link href={`/collections/${item.name}/analytics`}>
                                                <BarChart3 className="h-3 w-3 text-muted-foreground/70" />
                                                <span className="text-sm">Analytics</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton 
                                            asChild
                                            className="transition-all duration-200 hover:bg-muted/40 hover:text-foreground"
                                        >
                                            <Link href={`/collections/${item.name}/synonyms`}>
                                                <ArrowLeftRight className="h-3 w-3 text-muted-foreground/70" />
                                                <span className="text-sm">Synonyms</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton 
                                            asChild
                                            className="transition-all duration-200 hover:bg-muted/40 hover:text-foreground"
                                        >
                                            <Link href={`/collections/${item.name}/curations`}>
                                                <ListFilter className="h-3 w-3 text-muted-foreground/70" />
                                                <span className="text-sm">Curations</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                    ))
                )}
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
