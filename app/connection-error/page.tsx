'use client';

import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ConnectionErrorPage() {
    const handleRetry = () => {
        window.location.reload();
    };

    const checkEnvironmentVariables = () => {
        const requiredVars = [
            'TYPESENSE_HOST',
            'TYPESENSE_PORT',
            'TYPESENSE_PROTOCOL',
            'TYPESENSE_API_KEY',
        ];

        // Note: In client components, we can't access server-side env vars
        // This is just for display purposes - actual values are server-side only
        return requiredVars.map((varName) => ({
            name: varName,
            isSet: true, // Assume set for display purposes
            value: 'Check .env',
        }));
    };

    const envVars = checkEnvironmentVariables();

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

                        {/* Environment Variables Status */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm">
                                Environment Configuration
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {envVars.map((envVar) => (
                                    <div
                                        key={envVar.name}
                                        className="flex justify-between items-center p-2 bg-muted rounded"
                                    >
                                        <span className="font-mono text-xs">
                                            {envVar.name}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${
                                                envVar.isSet
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                        >
                                            {envVar.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Troubleshooting Steps */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm">
                                Troubleshooting Steps
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                <li>
                                    Verify your Typesense server is running and
                                    accessible
                                </li>
                                <li>
                                    Check your environment variables in{' '}
                                    <code className="bg-muted px-1 rounded">
                                        .env
                                    </code>
                                </li>
                                <li>
                                    Ensure your API key is valid and has proper
                                    permissions
                                </li>
                                <li>
                                    Verify network connectivity to your
                                    Typesense host
                                </li>
                                <li>
                                    Check firewall settings and port
                                    accessibility
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
                    {/* <Button variant="outline" asChild>
                        <Link
                            href="/settings/general"
                            className="flex items-center gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            Check Settings
                        </Link>
                    </Button> */}
                </div>
            </div>
        </div>
    );
}
