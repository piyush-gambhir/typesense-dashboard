'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TypesenseConnectionConfig } from '@/lib/connection-config';
import { setConnectionConfigClient } from '@/lib/connection-config-client';

const connectionSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z
        .number()
        .min(1, 'Port must be a positive number')
        .max(65535, 'Port must be less than 65536'),
    protocol: z.enum(['http', 'https']),
    apiKey: z.string().min(1, 'API key is required'),
});

type ConnectionForm = z.infer<typeof connectionSchema>;

export default function SetupPage() {
    const router = useRouter();
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [connectionSuccess, setConnectionSuccess] = useState(false);

    const form = useForm<ConnectionForm>({
        resolver: zodResolver(connectionSchema),
        defaultValues: {
            host: 'localhost',
            port: 8108,
            protocol: 'http',
            apiKey: '',
        },
    });

    const testConnection = async (config: TypesenseConnectionConfig) => {
        try {
            const response = await fetch('/api/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                throw new Error('Connection test failed');
            }

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Connection test error:', error);
            return false;
        }
    };

    const onSubmit = async (data: ConnectionForm) => {
        setIsConnecting(true);
        setConnectionError(null);
        setConnectionSuccess(false);

        const config: TypesenseConnectionConfig = {
            host: data.host,
            port: data.port,
            protocol: data.protocol,
            apiKey: data.apiKey,
        };

        try {
            const isValid = await testConnection(config);

            if (isValid) {
                setConnectionConfigClient(config);
                setConnectionSuccess(true);

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                setConnectionError(
                    'Failed to connect to Typesense server. Please check your configuration.',
                );
            }
        } catch (error) {
            setConnectionError(
                'An error occurred while testing the connection. Please try again.',
            );
        } finally {
            setIsConnecting(false);
        }
    };

    if (connectionSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-sm text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    <div>
                        <h2 className="text-sm font-medium text-green-600 dark:text-green-400">
                            Connection Successful
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Redirecting to dashboard…
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-center mb-6">
                    <Database className="h-5 w-5 text-primary mx-auto mb-2" />
                    <h1 className="text-base font-medium">
                        Connect to Typesense
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Configure your connection. Stored securely for 14 days.
                    </p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="host"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Host</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="localhost"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The hostname or IP address of your
                                        Typesense server
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="port"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Port</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="8108"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="protocol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Protocol</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select protocol" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="http">
                                                    HTTP
                                                </SelectItem>
                                                <SelectItem value="https">
                                                    HTTPS
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="apiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>API Key</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your API key"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Your Typesense API key with appropriate
                                        permissions
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {connectionError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {connectionError}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-medium"
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing Connection...
                                </>
                            ) : (
                                'Connect & Save'
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
