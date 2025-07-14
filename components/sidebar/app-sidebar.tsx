'use client';

import {
    ArrowLeftRight,
    BarChart3,
    Bot,
    Database,
    ListFilter,
    Search,
    Settings2,
    TrendingUp,
} from 'lucide-react';
import * as React from 'react';

import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';

import { NavCollections } from '@/components/sidebar/nav-collections';
import { NavMain } from '@/components/sidebar/nav-main';
import { AppSidebarHeader } from '@/components/sidebar/sidebar-header';

export default function AppSidebar({
    collections,
    ...props
}: Readonly<{
    collections: any;
}>) {
    // Handle the new collections data structure
    const collectionsData =
        collections?.success && collections?.data ? collections.data : [];

    const data = {
        navMain: [
            {
                title: 'Overview',
                url: '/metrics',
                icon: TrendingUp,
                isActive: true,
                items: [],
            },
            {
                title: 'Collections',
                url: '/collections',
                icon: Database,
                isActive: true,
                items: [],
            },
            {
                title: 'Search Presets',
                url: '/search-presets',
                icon: Search,
                isActive: true,
                items: [],
            },
            {
                title: 'Aliases',
                url: '/aliases',
                icon: ListFilter,
                isActive: true,
                items: [],
            },
            {
                title: 'Stopwords',
                url: '/stopwords',
                icon: ListFilter,
                isActive: true,
                items: [],
            },
            {
                title: 'Analytics Rules',
                url: '/analytics-rules',
                icon: BarChart3,
                isActive: true,
                items: [],
            },
            {
                title: 'NL Search',
                url: '/nl-search-models',
                icon: Bot,
                items: [
                    {
                        title: 'Models',
                        url: '/nl-search-models',
                    },
                    {
                        title: 'Test Search',
                        url: '/nl-search-test',
                    },
                ],
            },
            {
                title: 'Settings',
                url: '/settings/general',
                icon: Settings2,
                isActive: true,
                items: [],
            },
            {
                title: 'API Keys',
                url: '/settings/api-keys',
                icon: Settings2,
                isActive: true,
                items: [],
            },
        ],
        collections: collectionsData.map((collection: any) => ({
            name: collection.name,
            url: `/collections/${collection.name}`,
            icon: Database,
        })),
    };
    return (
        <Sidebar
            collapsible="icon"
            {...props}
            className="border-r border-border/50"
        >
            <AppSidebarHeader />
            <SidebarContent className="gap-6 py-4">
                <NavMain items={data.navMain} />
                <NavCollections collections={data.collections} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
