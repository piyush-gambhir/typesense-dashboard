'use client';

import {
    ArrowLeftRight,
    BarChart3,
    Bot,
    Database,
    ListFilter,
    Settings2,
    TrendingUp,
} from 'lucide-react';
import * as React from 'react';

import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';

import { NavCollections } from '@/components/sidebar/NavCollections';
import { NavMain } from '@/components/sidebar/NavMain';
import { AppSidebarHeader } from '@/components/sidebar/SidebarHeader';

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
                title: 'Search Tools',
                url: '/nl-search',
                icon: Bot,
                items: [
                    {
                        title: 'Natural Language',
                        url: '/nl-search',
                    },
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
                title: 'Management',
                url: '/aliases',
                icon: Settings2,
                items: [
                    {
                        title: 'Aliases',
                        url: '/aliases',
                    },
                    {
                        title: 'Stopwords',
                        url: '/stopwords',
                    },
                    {
                        title: 'Analytics Rules',
                        url: '/analytics-rules',
                    },
                ],
            },
            {
                title: 'Settings',
                url: '/settings',
                icon: Settings2,
                items: [
                    {
                        title: 'General',
                        url: '/settings/general',
                    },
                    {
                        title: 'API Keys',
                        url: '/settings/api-keys',
                    },
                ],
            },
        ],
        collections: collectionsData.map((collection: any) => ({
            name: collection.name,
            url: `/collections/${collection.name}`,
            icon: Database,
        })),
    };
    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-border/50">
            <AppSidebarHeader />
            <SidebarContent className="gap-6 py-4">
                <NavMain items={data.navMain} />
                <NavCollections collections={data.collections} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
