'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted before checking the theme
    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine the current theme
    const currentTheme = theme === 'system' ? systemTheme : theme;

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground"
            >
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                >
                    {currentTheme === 'dark' ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Sun className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                >
                    <Monitor className="h-3.5 w-3.5" />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
