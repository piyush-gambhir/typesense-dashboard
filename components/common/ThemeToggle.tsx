'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

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
            <Button variant="outline" size="icon" className="w-9 h-9">
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9">
                    {currentTheme === 'dark' ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Sun className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
