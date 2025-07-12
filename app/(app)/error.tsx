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
            <div className="w-full max-w-md p-6 space-y-6 text-center">
                <h1 className="text-3xl font-bold text-foreground">
                    Something went wrong!
                </h1>
                <p className="text-muted-foreground">
                    We apologize for the inconvenience.
                </p>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error.message || 'An unexpected error occurred.'}
                    </AlertDescription>
                </Alert>

                <Button onClick={() => reset()} className="w-full">
                    Try again
                </Button>
            </div>
        </div>
    );
}
