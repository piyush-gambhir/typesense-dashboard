'use client';

import { Activity, BarChart3, Database, FileText, Search, Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

interface CollectionNavigationProps {
    collectionName: string;
}

const navItems = [
    {
        label: 'Overview',
        href: '',
        icon: Database,
        description: 'Collection schema and configuration'
    },
    {
        label: 'Search',
        href: '/search',
        icon: Search,
        description: 'Search and filter documents'
    },
    {
        label: 'Documents',
        href: '/documents',
        icon: FileText,
        description: 'Import, export, and manage documents'
    },
    {
        label: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Performance and usage statistics'
    },
    {
        label: 'Synonyms',
        href: '/synonyms',
        icon: Settings,
        description: 'Manage search synonyms'
    },
    {
        label: 'Curations',
        href: '/curations',
        icon: Activity,
        description: 'Search result curation rules'
    }
];

export default function CollectionNavigation({ collectionName }: CollectionNavigationProps) {
    const pathname = usePathname();
    
    return (
        <div className="border-b border-border/50 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-1 overflow-x-auto py-2">
                    {navItems.map((item) => {
                        const href = `/collections/${collectionName}${item.href}`;
                        const isActive = pathname === href;
                        const Icon = item.icon;
                        
                        return (
                            <Link key={item.href} href={href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "gap-2 whitespace-nowrap",
                                        isActive && "bg-background shadow-sm"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}