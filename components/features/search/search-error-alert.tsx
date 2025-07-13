'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SearchErrorAlertProps {
    error: string | null;
    onRetry: () => void;
    onDismiss: () => void;
}

export default function SearchErrorAlert({
    error,
    onRetry,
    onDismiss,
}: Readonly<SearchErrorAlertProps>) {
    if (!error) return null;

    return (
        <Alert variant="destructive" className="border-destructive/20">
            <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <div className="flex items-center gap-2 ml-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="text-xs"
                    >
                        Retry
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="text-xs"
                    >
                        Dismiss
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}