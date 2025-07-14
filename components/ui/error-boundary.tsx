'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="max-w-lg mx-auto mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Something went wrong
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error Details</AlertTitle>
                                <AlertDescription className="font-mono text-xs">
                                    {this.state.error.message}
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={this.handleReset} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

// Error display components
interface ErrorStateProps {
    title?: string;
    message?: string;
    action?: ReactNode;
    variant?: 'default' | 'destructive';
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'An error occurred while loading this content.',
    action,
    variant = 'default'
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
                {message}
            </p>
            {action}
        </div>
    );
}

export function EmptyState({
    title = 'No data found',
    message = 'There are no items to display.',
    action
}: {
    title?: string;
    message?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
                {message}
            </p>
            {action}
        </div>
    );
}

// Hook for standardized error handling
export function useErrorHandler() {
    const handleError = (error: unknown, context?: string) => {
        console.error(context ? `[${context}]` : '[Error]', error);
        
        let message = 'An unexpected error occurred';
        
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        return {
            title: 'Error',
            description: message,
            variant: 'destructive' as const,
        };
    };

    return { handleError };
}