'use client';

import { Database, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRecoilValue } from 'recoil';

import { sidebarState } from '@/atoms/sidebarState';

import { cn } from '@/lib/utils';

import { ScrollArea } from '@/components/ui/scroll-area';

const sidebarItems = [
  { name: 'Metrics', icon: LayoutDashboard, href: '/metrics' },
  { name: 'Collections', icon: Database, href: '/collections' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const isSidebarOpen = useRecoilValue(sidebarState); // Read Recoil state
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-200 ease-in-out',
        isSidebarOpen
          ? 'w-[240px] opacity-100 lg:w-[300px]'
          : 'w-[80px] opacity-0 lg:opacity-100',
      )}
    >
      <ScrollArea className="flex-1 h-full">
        <nav className="flex flex-col gap-2 p-4 h-full">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                pathname === item.href
                  ? 'bg-muted font-medium text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon
                className={cn('h-4 w-4', !isSidebarOpen && 'lg:h-5 lg:w-5')}
              />
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
