'use client';

import {
    BarChart3,
    BookOpen,
    Bot,
    Database,
    ListFilter,
    MessageSquare,
    Search,
    Server,
    Settings2,
    TrendingUp,
} from 'lucide-react';

import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';

import { NavCollections } from '@/components/sidebar/nav-collections';
import { NavMain } from '@/components/sidebar/nav-main';
import { AppSidebarHeader } from '@/components/sidebar/sidebar-header';
import { isFeatureAvailable, type FeatureKey } from '@/lib/typesense/version';

export default function AppSidebar({
    collections,
    serverVersion,
    ...props
}: Readonly<{
    collections: any;
    serverVersion?: string | null;
}>) {
    // Handle the new collections data structure
    const collectionsData =
        collections?.success && collections?.data ? collections.data : [];

    /**
     * Check if a feature is available on the connected server.
     * When version is unknown (null/undefined), we allow everything —
     * the feature page itself will show an appropriate error if the
     * server doesn't actually support it.
     */
    const has = (feature: FeatureKey): boolean => {
        if (!serverVersion) return true;
        return isFeatureAvailable(feature, serverVersion);
    };

    // Build nav items, filtering out features unavailable on this server
    const navMain: {
        title: string;
        url: string;
        icon?: any;
        isActive?: boolean;
        items?: { title: string; url: string }[];
        minVersion?: string;
    }[] = [];

    navMain.push({
        title: 'Overview',
        url: '/metrics',
        icon: TrendingUp,
        isActive: true,
        items: [],
    });

    navMain.push({
        title: 'Collections',
        url: '/collections',
        icon: Database,
        isActive: true,
        items: [],
    });

    if (has('searchPresets')) {
        navMain.push({
            title: 'Search Presets',
            url: '/search-presets',
            icon: Search,
            isActive: true,
            items: [],
        });
    }

    navMain.push({
        title: 'Aliases',
        url: '/aliases',
        icon: ListFilter,
        isActive: true,
        items: [],
    });

    if (has('stopwords')) {
        navMain.push({
            title: 'Stopwords',
            url: '/stopwords',
            icon: ListFilter,
            isActive: true,
            items: [],
        });
    }

    if (has('analyticsRules')) {
        navMain.push({
            title: 'Analytics Rules',
            url: '/analytics-rules',
            icon: BarChart3,
            isActive: true,
            items: [],
        });
    }

    if (has('stemmingDictionaries')) {
        navMain.push({
            title: 'Stemming',
            url: '/stemming',
            icon: BookOpen,
            isActive: true,
            items: [],
        });
    }

    if (has('naturalLanguageSearch')) {
        navMain.push({
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
        });
    }

    if (has('conversationalSearch')) {
        navMain.push({
            title: 'Conversations',
            url: '/conversations',
            icon: MessageSquare,
            isActive: true,
            items: [],
        });
    }

    navMain.push({
        title: 'Cluster Ops',
        url: '/cluster-operations',
        icon: Server,
        isActive: true,
        items: [],
    });

    navMain.push({
        title: 'Settings',
        url: '/settings/general',
        icon: Settings2,
        isActive: true,
        items: [],
    });

    navMain.push({
        title: 'API Keys',
        url: '/settings/api-keys',
        icon: Settings2,
        isActive: true,
        items: [],
    });

    const data = {
        navMain,
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
            className="border-r border-border/40"
        >
            <AppSidebarHeader />
            <SidebarContent className="gap-4 py-3">
                <NavMain items={data.navMain} />
                <NavCollections collections={data.collections} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
