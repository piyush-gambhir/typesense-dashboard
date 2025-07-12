'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import { PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/useToast';
import { FileUp, Upload, X } from 'lucide-react';
import { createCollectionWithJsonl } from '@/lib/typesense/collections';

const fieldTypes = [
  'string',
  'int32',
  'int64',
  'float',
  'bool',
  'string[]',
  'int32[]',
  'int64[]',
  'float[]',
  'bool[]',
  'object',
  'object[]',
  'auto',
];

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(fieldTypes as [string, ...string[]]),
  facet: z.boolean(),
  index: z.boolean(),
  optional: z.boolean(),
  sort: z.boolean(),
});

const formSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  fields: z.array(fieldSchema).min(1, 'At least one field is required'),
  default_sorting_field: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateCollectionWithJsonl() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      fields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  const watchFields = watch('fields');
  const sortableFields = watchFields.filter((field) =>
    ['int32', 'int64', 'float'].includes(field.type)
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileContent = await selectedFile.text();
      const lines = fileContent.split('\n').filter(Boolean);
      if (lines.length > 0) {
        const firstLine = JSON.parse(lines[0]);
        const schema = Object.keys(firstLine).map((key) => ({
          name: key,
          type: 'auto',
          facet: false,
          index: true,
          optional: true,
          sort: false,
        }));
        setValue('fields', schema as any);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    reset();
  };

  const onSubmit = async (data: FormData) => {
    if (!file) return;
    setIsLoading(true);
    const fileContent = await file.text();
    const response = await createCollectionWithJsonl({
      collectionName: data.name,
      fields: data.fields,
      fileContent,
    });

    if (response && 'error' in response) {
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Collection "${data.name}" created and documents imported.`,
      });
      handleRemoveFile();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Collection with JSONL</CardTitle>
          <CardDescription>
            Upload a JSONL file to define the schema for your new Typesense
            collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-3">
            <Label htmlFor="file">Select JSONL File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".jsonl"
              disabled={isLoading}
            />
          </div>
          {file && (
            <>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Selected file: {file?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input id="name" {...register('name')} disabled={isLoading} />
                {errors.name && (
                  <p className="text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fields</Label>
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`fields.${index}.name`}>
                          Field Name
                        </Label>
                        <Input
                          {...register(`fields.${index}.name` as const)}
                          disabled={isLoading}
                        />
                        {errors.fields?.[index]?.name && (
                          <p className="text-sm text-red-500">
                            {errors.fields[index]?.name?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`fields.${index}.type`}>
                          Field Type
                        </Label>
                        <Controller
                          name={`fields.${index}.type` as const}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field type" />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`fields.${index}.facet`}
                          {...register(`fields.${index}.facet` as const)}
                          disabled={isLoading}
                        />
                        <Label htmlFor={`fields.${index}.facet`}>Facet</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`fields.${index}.index`}
                          {...register(`fields.${index}.index` as const)}
                          disabled={isLoading}
                        />
                        <Label htmlFor={`fields.${index}.index`}>Index</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`fields.${index}.optional`}
                          {...register(`fields.${index}.optional` as const)}
                          disabled={isLoading}
                        />
                        <Label htmlFor={`fields.${index}.optional`}>
                          Optional
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`fields.${index}.sort`}
                          {...register(`fields.${index}.sort` as const)}
                          disabled={isLoading}
                        />
                        <Label htmlFor={`fields.${index}.sort`}>Sort</Label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Field
                    </Button>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      name: '',
                      type: 'string',
                      facet: false,
                      index: true,
                      optional: false,
                      sort: false,
                    })
                  }
                  disabled={isLoading}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
                {errors.fields && (
                  <p className="text-sm text-red-500">
                    {errors.fields.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_sorting_field">
                  Default Sorting Field
                </Label>
                <Controller
                  name="default_sorting_field"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select default sorting field" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortableFields.map((field, index) => (
                          <SelectItem key={index} value={field.name}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!file || isLoading}>
            {isLoading ? (
              <>
                <FileUp className="mr-2 h-4 w-4 animate-bounce" />
                Creating...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create Collection
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}