'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="h-full flex items-center justify-center bg-background mb-16">
            <div className="w-full max-w-sm p-6 space-y-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <AlertTriangle className="h-5 w-5 text-destructive mx-auto" />
                <div className="space-y-1">
                    <h1 className="text-base font-medium text-foreground">
                        Something went wrong
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        An unexpected error occurred.
                    </p>
                </div>

                <Alert variant="destructive" className="text-left">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-sm">Error</AlertTitle>
                    <AlertDescription className="text-xs">
                        {error.message || 'An unexpected error occurred.'}
                    </AlertDescription>
                </Alert>

                <Button
                    onClick={() => reset()}
                    size="sm"
                    className="w-full text-sm font-medium"
                >
                    Try again
                </Button>
            </div>
        </div>
    );
}
