'use client';

import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { ThemeToggle } from '@/components/ThemeToggle';
import React from 'react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 justify-between sticky top-0 z-50 bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {pathname
              .split('/')
              .filter(Boolean)
              .map((segment, index, array) => (
                <React.Fragment key={`${segment}-${index}`}>
                  <BreadcrumbItem className="hidden md:block">
                    {index === array.length - 1 ? (
                      <BreadcrumbPage>
                        {segment
                          .split('-')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(' ')}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={`/${array.slice(0, index + 1).join('/')}`}
                      >
                        {segment
                          .split('-')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(' ')}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < array.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </React.Fragment>
              ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <ThemeToggle />
    </header>
  );
}
