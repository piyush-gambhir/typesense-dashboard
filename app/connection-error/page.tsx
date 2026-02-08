'use client';

import { AlertTriangle, Database, RefreshCw, WifiOff } from 'lucide-react';

import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { clearConnectionConfigClient } from '@/lib/connection-config-client';
import { useRouter } from 'next/navigation';

export default function ConnectionErrorPage() {
    const router = useRouter();
    const handleRetry = () => {
        window.location.reload();
    };

    const handleUpdateConnection = () => {
        clearConnectionConfigClient();
        router.push('/setup');
    };

    /*
     * With the new connection setup flow we store the Typesense connection
     * details in a secure, HTTP-only cookie when the user goes through the
     * /setup wizard. If that cookie is missing or the server is unreachable we
     * land on this page.
     *
     * Because this component runs on the client we cannot (and should not)
     * try to read that cookie here – the cookie is HTTP-only. Instead we just
     * inform the user that a connection could not be established and offer
     * actions to retry or open the setup wizard again.
     */

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Header */}
                <div className="text-center space-y-2">
                    <WifiOff className="h-5 w-5 text-destructive mx-auto" />
                    <h1 className="text-base font-medium text-foreground">
                        Connection Failed
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Unable to connect to Typesense server
                    </p>
                </div>

                {/* Error details */}
                <div className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-sm">
                            Connection Failed
                        </AlertTitle>
                        <AlertDescription className="text-xs">
                            Failed to connect to Typesense server. Please check
                            your configuration and ensure the server is running.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                            What next?
                        </h3>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                            <li>Make sure your Typesense server is running.</li>
                            <li>
                                Click <strong>Retry</strong> once the server is
                                available.
                            </li>
                            <li>
                                If details changed, open the{' '}
                                <Link
                                    href="/setup"
                                    className="text-primary underline inline-flex items-center gap-1"
                                >
                                    <Database className="h-3 w-3" />
                                    Setup wizard
                                </Link>
                                .
                            </li>
                        </ol>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={handleRetry}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUpdateConnection}
                        className="flex items-center gap-2"
                    >
                        Edit Connection
                    </Button>
                </div>
            </div>
        </div>
    );
}
