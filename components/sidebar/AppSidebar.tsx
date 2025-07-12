'use client';

import {
    ArrowLeftRight,
    Bot,
    ChartBar,
    Frame,
    ListFilter,
    Search,
    Settings2,
    SquareTerminal,
} from 'lucide-react';
import * as React from 'react';

import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';

import { NavCollections } from '@/components/sidebar/NavCollections';
import { NavMain } from '@/components/sidebar/NavMain';

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
                title: 'Metrics',
                url: '/metrics',
                icon: SquareTerminal,
                isActive: true,
                items: [],
            },
            {
                title: 'Collections',
                url: '/collections',
                icon: Frame,
                isActive: true,
                items: [],
            },

            {
                title: 'Aliases',
                url: '/aliases',
                icon: ArrowLeftRight,
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
                icon: ChartBar,
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
                title: 'NL Search',
                url: '/nl-search',
                icon: Bot,
                items: [
                    {
                        title: 'Models',
                        url: '/nl-search-models',
                    },
                    {
                        title: 'Test',
                        url: '/nl-search-test',
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
            icon: Frame,
        })),
    };
    return (
        <Sidebar collapsible="icon" {...props}>
            {/* <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader> */}
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavCollections collections={data.collections} />
            </SidebarContent>
            {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
            <SidebarRail />
        </Sidebar>
    );
}
