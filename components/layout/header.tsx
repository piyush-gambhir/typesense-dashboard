'use client';

import { Database, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React from 'react';

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

import { ThemeToggle } from '@/components/common/theme-toggle';

export default function Header() {
    const pathname = usePathname();

    const formatBreadcrumbSegment = (segment: string) => {
        return segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getBreadcrumbIcon = (segment: string) => {
        switch (segment) {
            case 'collections':
                return <Database className="w-3.5 h-3.5" />;
            case 'metrics':
                return <Home className="w-3.5 h-3.5" />;
            default:
                return null;
        }
    };

    return (
        <header className="flex h-14 shrink-0 items-center gap-3 justify-between sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/40 px-4 md:px-6">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1.5 text-muted-foreground hover:text-foreground transition-colors" />
                <Separator
                    orientation="vertical"
                    className="h-5 bg-border/60"
                />

                <Breadcrumb>
                    <BreadcrumbList className="flex items-center gap-1.5">
                        {pathname
                            .split('/')
                            .filter(Boolean)
                            .map((segment, index, array) => (
                                <React.Fragment key={`${segment}-${index}`}>
                                    <BreadcrumbItem className="hidden md:flex items-center gap-1.5">
                                        {index === array.length - 1 ? (
                                            <BreadcrumbPage className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                                                {getBreadcrumbIcon(segment)}
                                                {formatBreadcrumbSegment(
                                                    segment,
                                                )}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink
                                                href={`/${array.slice(0, index + 1).join('/')}`}
                                                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
                                            >
                                                {getBreadcrumbIcon(segment)}
                                                {formatBreadcrumbSegment(
                                                    segment,
                                                )}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {index < array.length - 1 && (
                                        <BreadcrumbSeparator className="hidden md:block text-border" />
                                    )}
                                </React.Fragment>
                            ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-1.5">
                <ThemeToggle />
            </div>
        </header>
    );
}
