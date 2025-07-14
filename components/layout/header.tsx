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
                return <Database className="w-4 h-4" />;
            case 'metrics':
                return <Home className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-4 justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50 px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-2" />
                <Separator orientation="vertical" className="h-6" />

                <Breadcrumb>
                    <BreadcrumbList className="flex items-center gap-2">
                        {pathname
                            .split('/')
                            .filter(Boolean)
                            .map((segment, index, array) => (
                                <React.Fragment key={`${segment}-${index}`}>
                                    <BreadcrumbItem className="hidden md:flex items-center gap-2">
                                        {index === array.length - 1 ? (
                                            <BreadcrumbPage className="flex items-center gap-2 font-semibold text-foreground">
                                                {getBreadcrumbIcon(segment)}
                                                {formatBreadcrumbSegment(
                                                    segment,
                                                )}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink
                                                href={`/${array.slice(0, index + 1).join('/')}`}
                                                className="flex items-center gap-2 hover:text-foreground transition-colors"
                                            >
                                                {getBreadcrumbIcon(segment)}
                                                {formatBreadcrumbSegment(
                                                    segment,
                                                )}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {index < array.length - 1 && (
                                        <BreadcrumbSeparator className="hidden md:block text-muted-foreground" />
                                    )}
                                </React.Fragment>
                            ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle />
            </div>
        </header>
    );
}
