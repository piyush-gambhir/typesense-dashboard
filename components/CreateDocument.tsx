'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { toast } from '@/hooks/useToast';
import { createDocument } from '@/lib/typesense/documents';
import { getCollection } from '@/lib/typesense/collections';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';

export default function CreateDocumentPage({
  collectionName,
}: Readonly<{
  collectionName: string;
}>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [collectionSchema, setCollectionSchema] = useState<any>(null);
  const [formSchema, setFormSchema] = useState<z.ZodObject<any> | null>(null);

  const form = useForm<Record<string, any>>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      const schemaResult = await getCollection(collectionName);

      if (schemaResult && schemaResult.success && schemaResult.data) {
        const schema = schemaResult.data;
        setCollectionSchema(schema);

        const dynamicSchema: Record<string, z.ZodTypeAny> = {};
        schema.fields?.forEach((field: any) => {
          if (field.name === 'id') return; // ID is usually auto-generated or handled separately

          let fieldSchema: z.ZodTypeAny;
          switch (field.type) {
            case 'string':
              fieldSchema = z.string();
              break;
            case 'int32':
            case 'int64':
            case 'float':
              fieldSchema = z.number();
              break;
            case 'bool':
              fieldSchema = z.boolean();
              break;
            case 'string[]':
              fieldSchema = z.array(z.string());
              break;
            case 'int32[]':
            case 'int64[]':
            case 'float[]':
              fieldSchema = z.array(z.number());
              break;
            case 'bool[]':
              fieldSchema = z.array(z.boolean());
              break;
            default:
              fieldSchema = z.any();
          }
          if (field.optional) {
            fieldSchema = fieldSchema.optional();
          }
          dynamicSchema[field.name] = fieldSchema;
        });
        setFormSchema(z.object(dynamicSchema));
      } else {
        toast({
          title: 'Error',
          description: schemaResult?.error || 'Failed to load collection schema.',
          variant: 'destructive',
        });
      }
    };
    fetchData();
  }, [collectionName]);

  async function onSubmit(values: Record<string, any>) {
    setIsLoading(true);
    try {
      const newDoc = await createDocument(collectionName, values);
      if (newDoc) {
        toast({
          title: 'Document Created',
          description: 'Your document has been successfully created.',
        });
        router.push(`/collections/${collectionName}`); // Redirect to search page
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create document.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create document',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!collectionSchema || !formSchema) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading collection schema..." />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Document</CardTitle>
        <CardDescription>
          Fill in the details to create a new document in the {collectionName} collection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {collectionSchema.fields.map((field: any) => {
              if (field.name === 'id') return null; // Skip ID field for creation
              return (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.name}</FormLabel>
                      <FormControl>
                        {field.type === 'string' ? (
                          <Input placeholder={`Enter ${field.name}`} {...formField} />
                        ) : field.type === 'int32' || field.type === 'int64' || field.type === 'float' ? (
                          <Input type="number" placeholder={`Enter ${field.name}`} {...formField} onChange={e => formField.onChange(parseFloat(e.target.value))} />
                        ) : field.type === 'bool' ? (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={field.name}
                              checked={formField.value || false}
                              onCheckedChange={formField.onChange}
                            />
                          </div>
                        ) : field.type === 'string[]' ? (
                          <Textarea placeholder={`Enter ${field.name} (comma-separated)`} {...formField} value={formField.value?.join(', ') || ''} onChange={e => formField.onChange(e.target.value.split(',').map((s: string) => s.trim()))} />
                        ) : field.type === 'int32[]' || field.type === 'int64[]' || field.type === 'float[]' ? (
                          <Textarea placeholder={`Enter ${field.name} (comma-separated numbers)`} {...formField} value={formField.value?.join(', ') || ''} onChange={e => formField.onChange(e.target.value.split(',').map((s: string) => parseFloat(s.trim())))} />
                        ) : field.type === 'bool[]' ? (
                          <Textarea placeholder={`Enter ${field.name} (comma-separated booleans)`} {...formField} value={formField.value?.join(', ') || ''} onChange={e => formField.onChange(e.target.value.split(',').map((s: string) => s.trim() === 'true'))} />
                        ) : (
                          <Input placeholder={`Enter ${field.name}`} {...formField} />
                        )}
                      </FormControl>
                      <FormDescription>
                        This is the {field.name} of your document.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Document'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
