'use client';

import {
  ArrowLeftRight,
  ChartBar,
  Frame,
  ListFilter,
  Search,
  Settings2,
  SquareTerminal,
} from 'lucide-react';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

import { NavCollections } from '@/components/sidebar/NavCollections';
import { NavMain } from '@/components/sidebar/NavMain';
import { NavUser } from '@/components/sidebar/NavUser';
import { TeamSwitcher } from '@/components/sidebar/TeamSwitcher';

export default function AppSidebar({
  collections,
  ...props
}: Readonly<{
  collections: any;
}>) {
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
    collections: collections.map((collection: any) => ({
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
