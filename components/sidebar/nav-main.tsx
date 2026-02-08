'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

import Link from '@/components/link';

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
                Platform
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-0.5">
                {items.map((item) => {
                    if (!item.items || item.items.length === 0) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    className="transition-colors duration-150 hover:bg-muted/50"
                                >
                                    <Link href={item.url}>
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        <span className="text-sm">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={item.isActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        className="transition-colors duration-150 hover:bg-muted/50"
                                    >
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        <span className="text-sm">
                                            {item.title}
                                        </span>
                                        <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub className="ml-4 space-y-0.5 border-l border-border/40 pl-3">
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem
                                                key={subItem.title}
                                            >
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className="transition-colors duration-150 hover:bg-muted/40 hover:text-foreground"
                                                >
                                                    <Link href={subItem.url}>
                                                        <span className="text-sm">
                                                            {subItem.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
