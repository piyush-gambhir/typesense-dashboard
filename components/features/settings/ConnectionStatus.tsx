import { checkTypesenseConnection } from '@/lib/typesense/connection-check';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default async function ConnectionStatus() {
    const connectionStatus = await checkTypesenseConnection();

    const requiredVars = [
        'TYPESENSE_HOST',
        'TYPESENSE_PORT',
        'TYPESENSE_PROTOCOL',
        'TYPESENSE_API_KEY',
    ];

    const envVars = requiredVars.map((varName) => ({
        name: varName,
        isSet: !!process.env[varName],
        value: process.env[varName] ? 'Set' : 'Not set',
    }));

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Connection Status
                    </CardTitle>
                    <CardDescription>
                        Current Typesense server connection status
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge
                            variant={
                                connectionStatus.isConnected
                                    ? 'default'
                                    : 'destructive'
                            }
                        >
                            {connectionStatus.isConnected
                                ? 'Connected'
                                : 'Disconnected'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Last checked:{' '}
                            {new Date(
                                connectionStatus.timestamp,
                            ).toLocaleString()}
                        </span>
                    </div>

                    {connectionStatus.serverInfo && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Host:</span>
                                <div className="font-mono text-xs bg-muted p-1 rounded mt-1">
                                    {connectionStatus.serverInfo.host}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium">Port:</span>
                                <div className="font-mono text-xs bg-muted p-1 rounded mt-1">
                                    {connectionStatus.serverInfo.port}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium">Protocol:</span>
                                <div className="font-mono text-xs bg-muted p-1 rounded mt-1">
                                    {connectionStatus.serverInfo.protocol}
                                </div>
                            </div>
                        </div>
                    )}

                    {!connectionStatus.isConnected &&
                        connectionStatus.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Connection Error</AlertTitle>
                                <AlertDescription>
                                    {connectionStatus.error}
                                </AlertDescription>
                            </Alert>
                        )}
                </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
                <CardHeader>
                    <CardTitle>Environment Configuration</CardTitle>
                    <CardDescription>
                        Required environment variables for Typesense connection
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                        {envVars.map((envVar) => (
                            <div
                                key={envVar.name}
                                className="flex justify-between items-center p-3 bg-muted rounded"
                            >
                                <span className="font-mono text-sm">
                                    {envVar.name}
                                </span>
                                <Badge
                                    variant={
                                        envVar.isSet ? 'default' : 'destructive'
                                    }
                                >
                                    {envVar.value}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
