import { Settings, Server, Shield } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import ConnectionStatus from '@/components/features/settings/ConnectionStatus';

export default function GeneralSettings() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="relative">
                            <Settings className="h-8 w-8 text-primary" />
                            <div className="absolute -bottom-1 -right-1">
                                <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                                    <Shield className="h-2 w-2 text-white" />
                                </div>
                            </div>
                        </div>
                        General Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your Typesense server configuration and connection settings
                    </p>
                </div>
            </div>

            {/* Configuration Guide */}
            <Card className="border border-border/50">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg ring-1 ring-blue-500/20">
                            <Server className="h-5 w-5 text-blue-600" />
                        </div>
                        Server Configuration
                    </CardTitle>
                    <CardDescription>
                        Typesense connection is configured via environment variables for enhanced security
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-muted/50 to-background/30 border border-border/50 rounded-xl">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                                    <Shield className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg">Environment Variables</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Configure your Typesense connection using these secure environment variables.
                                These settings are loaded server-side and never exposed to the client.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {[
                                    { var: 'TYPESENSE_HOST', description: 'Server hostname or IP address' },
                                    { var: 'TYPESENSE_PORT', description: 'Server port (default: 8108)' },
                                    { var: 'TYPESENSE_PROTOCOL', description: 'Protocol (http or https)' },
                                    { var: 'TYPESENSE_API_KEY', description: 'Admin API key for authentication' },
                                ].map((item) => (
                                    <div key={item.var} className="p-4 bg-background/60 border border-border/50 rounded-lg">
                                        <div className="space-y-2">
                                            <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded border">
                                                {item.var}
                                            </code>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                        <div className="flex gap-3">
                            <div className="p-1 bg-blue-500/10 rounded">
                                <Shield className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Security Best Practices
                                </h4>
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    Environment variables ensure your Typesense credentials are never exposed in client-side code.
                                    Make sure to restart your application after updating these values.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Connection Status */}
            <ConnectionStatus />
        </div>
    );
}