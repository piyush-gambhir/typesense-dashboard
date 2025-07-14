'use client';

import { AlertTriangle, RefreshCw, WifiOff, Database } from 'lucide-react';

import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { clearConnectionConfigClient } from '@/lib/connection-config-client';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

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
            <div className="w-full max-w-2xl space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="p-3 bg-destructive/10 rounded-full">
                            <WifiOff className="h-8 w-8 text-destructive" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Connection Failed
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Unable to connect to Typesense server
                    </p>
                </div>

                {/* Main Error Card */}
                <Card className="border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Server Connection Error
                        </CardTitle>
                        <CardDescription>
                            The application cannot establish a connection to
                            your Typesense server. This could be due to network
                            issues, server configuration, or environment setup.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Connection Failed</AlertTitle>
                            <AlertDescription>
                                Failed to connect to Typesense server. Please
                                check your configuration and ensure the server
                                is running.
                            </AlertDescription>
                        </Alert>

                {/* Helpful next steps */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm">What next?</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>
                            Make sure your Typesense server is running and can
                            be reached from this dashboard.
                        </li>
                        <li>Click <strong>Retry&nbsp;Connection</strong> once the server is available.</li>
                        <li>
                            If the connection details have changed open the
                            <Link href="/setup" className="text-primary underline inline-flex items-center gap-1">
                                <Database className="h-3 w-3" />Setup&nbsp;wizard
                            </Link>{' '}
                            again and save the new details.
                        </li>
                    </ol>
                </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={handleRetry}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry Connection
                    </Button>
                    <Button variant="outline" onClick={handleUpdateConnection} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Edit&nbsp;Connection
                    </Button>
                </div>
            </div>
        </div>
    );
}
