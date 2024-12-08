'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';

import { getClusterHealth } from '@/actions/typesense/get-cluster-health';

import { typesenseConnectionDataState } from '@/atoms/typesenseConnectionDataState';

import { setLocalStorageData } from '@/utils/local-storage';
import { typesenseConnectionSchema } from '@/utils/zod/typesense-collection-schema';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type FormData = {
  host: string;
  port: string;
  protocol: string;
  apiKey: string;
};

export default function TypesenseConnect() {
  const setTypesenseConnectionData = useSetRecoilState(
    typesenseConnectionDataState,
  );
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const form = useForm<FormData>({
    resolver: zodResolver(typesenseConnectionSchema),
    defaultValues: {
      host: 'localhost',
      port: '8108',
      protocol: 'http',
      apiKey: '',
    },
  });

  // Load saved connection data from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('typesenseConnectionData');
    if (savedData) {
      const parsedData: FormData = JSON.parse(savedData);
      form.reset(parsedData);
    }
  }, [form]);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setConnectionStatus('idle');

    const clusterHealth = await getClusterHealth({
      typesenseHost: formData.host,
      typesensePort: parseInt(formData.port),
      typesenseProtocol: formData.protocol,
    });
    if (clusterHealth.ok) {
      setConnectionStatus('success');
      setTypesenseConnectionData({
        typesenseHost: formData.host,
        typesensePort: parseInt(formData.port),
        typesenseProtocol: formData.protocol,
        typesenseApiKey: formData.apiKey,
      });
      setLocalStorageData('typesenseConnectionData', {
        typesenseHost: formData.host,
        typesensePort: parseInt(formData.port),
        typesenseProtocol: formData.protocol,
        typesenseApiKey: formData.apiKey,
      });
      router.push('/metrics');
    } else {
      setConnectionStatus('error');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect to Typesense</CardTitle>
          <CardDescription>
            Enter your Typesense server details to connect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input placeholder="localhost" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="8108" {...field} />
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
                    <FormControl>
                      <Input placeholder="http" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="mt-4">
                {isLoading ? 'Connecting...' : 'Connect to Typesense'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          {connectionStatus === 'success' && (
            <Alert variant="default">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Successfully connected to Typesense server.
              </AlertDescription>
            </Alert>
          )}
          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to connect to Typesense server. Please check your details
                and try again.
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
