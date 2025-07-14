'use client';

import { Database } from 'lucide-react';

import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import Link from '@/components/link';

export function AppSidebarHeader() {
    return (
        <SidebarHeader className="border-b border-border/50">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        size="lg" 
                        asChild
                        className="hover:bg-muted/60 transition-all duration-200"
                    >
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                                <Database className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">Typesense</span>
                                <span className="text-xs text-muted-foreground">Dashboard</span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
    );
}