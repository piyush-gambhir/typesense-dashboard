'use client';

import { Database } from 'lucide-react';

import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import Link from '@/components/link';

export function AppSidebarHeader() {
    return (
        <SidebarHeader className="border-b border-border/40">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        asChild
                        className="hover:bg-muted/50 transition-colors duration-150"
                    >
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex aspect-square size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                                <Database className="size-3.5" />
                            </div>
                            <div className="flex flex-col gap-0 leading-none">
                                <span className="font-semibold text-sm">
                                    Typesense
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    Dashboard
                                </span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
    );
}
