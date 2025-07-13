import { CheckCircle, Globe, Lock, Shield, XCircle } from 'lucide-react';

import { checkTypesenseConnection } from '@/lib/typesense/connection-check';
import { cn } from '@/lib/utils';

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
        icon: varName === 'TYPESENSE_API_KEY' ? Lock : Globe,
    }));

    const allEnvVarsSet = envVars.every(envVar => envVar.isSet);

    return (
        <div className="space-y-8">
            {/* Connection Status */}
            <Card className="border border-border/50">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className={cn(
                            "p-2 rounded-lg ring-1",
                            connectionStatus.isConnected 
                                ? "bg-emerald-500/10 ring-emerald-500/20" 
                                : "bg-red-500/10 ring-red-500/20"
                        )}>
                            {connectionStatus.isConnected ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                            )}
                        </div>
                        Connection Status
                    </CardTitle>
                    <CardDescription>
                        Real-time status of your Typesense server connection
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/50 to-muted/30 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-3 h-3 rounded-full",
                                connectionStatus.isConnected 
                                    ? "bg-emerald-500 animate-pulse" 
                                    : "bg-red-500"
                            )} />
                            <div className="space-y-1">
                                <p className="font-medium">
                                    {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Last checked: {new Date(connectionStatus.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={connectionStatus.isConnected ? 'default' : 'destructive'}
                            className="gap-1"
                        >
                            {connectionStatus.isConnected ? (
                                <CheckCircle className="h-3 w-3" />
                            ) : (
                                <XCircle className="h-3 w-3" />
                            )}
                            {connectionStatus.isConnected ? 'Online' : 'Offline'}
                        </Badge>
                    </div>

                    {connectionStatus.serverInfo && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-background/60 border border-border/50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-sm">Host</span>
                                </div>
                                <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded border block">
                                    {connectionStatus.serverInfo.host}
                                </code>
                            </div>
                            <div className="p-4 bg-background/60 border border-border/50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-sm">Port</span>
                                </div>
                                <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded border block">
                                    {connectionStatus.serverInfo.port}
                                </code>
                            </div>
                            <div className="p-4 bg-background/60 border border-border/50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-emerald-600" />
                                    <span className="font-medium text-sm">Protocol</span>
                                </div>
                                <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded border block">
                                    {connectionStatus.serverInfo.protocol}
                                </code>
                            </div>
                        </div>
                    )}

                    {!connectionStatus.isConnected && connectionStatus.error && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Connection Error</AlertTitle>
                            <AlertDescription className="mt-2">
                                <div className="space-y-2">
                                    <p>{connectionStatus.error}</p>
                                    {!allEnvVarsSet && (
                                        <p className="text-sm">
                                            Some required environment variables are missing. Check the configuration below.
                                        </p>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card className="border border-border/50">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className={cn(
                            "p-2 rounded-lg ring-1",
                            allEnvVarsSet 
                                ? "bg-emerald-500/10 ring-emerald-500/20" 
                                : "bg-amber-500/10 ring-amber-500/20"
                        )}>
                            <Shield className={cn(
                                "h-5 w-5",
                                allEnvVarsSet ? "text-emerald-600" : "text-amber-600"
                            )} />
                        </div>
                        Environment Configuration
                    </CardTitle>
                    <CardDescription>
                        Status of required environment variables for Typesense connection
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        {envVars.map((envVar) => {
                            const Icon = envVar.icon;
                            return (
                                <div
                                    key={envVar.name}
                                    className={cn(
                                        "flex justify-between items-center p-4 rounded-lg border transition-colors",
                                        envVar.isSet 
                                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50" 
                                            : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-1.5 rounded-lg",
                                            envVar.isSet 
                                                ? "bg-emerald-500/10" 
                                                : "bg-red-500/10"
                                        )}>
                                            <Icon className={cn(
                                                "h-4 w-4",
                                                envVar.isSet ? "text-emerald-600" : "text-red-600"
                                            )} />
                                        </div>
                                        <div className="space-y-1">
                                            <code className="text-sm font-mono font-medium">
                                                {envVar.name}
                                            </code>
                                            {envVar.name === 'TYPESENSE_API_KEY' && (
                                                <p className="text-xs text-muted-foreground">
                                                    Sensitive: Admin authentication key
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        variant={envVar.isSet ? 'default' : 'destructive'}
                                        className="gap-1"
                                    >
                                        {envVar.isSet ? (
                                            <CheckCircle className="h-3 w-3" />
                                        ) : (
                                            <XCircle className="h-3 w-3" />
                                        )}
                                        {envVar.value}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>

                    {!allEnvVarsSet && (
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Configuration Required</AlertTitle>
                            <AlertDescription>
                                Some environment variables are missing. Please set all required variables and restart your application to establish a connection.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}