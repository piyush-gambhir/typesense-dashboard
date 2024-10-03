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
import { toast } from '@/hooks/use-toast';

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
];

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(fieldTypes as [string, ...string[]]),
  facet: z.boolean(),
  index: z.boolean(),
  optional: z.boolean(),
  sort: z.boolean(),
  store: z.boolean(),
});

const formSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  fields: z.array(fieldSchema).min(1, 'At least one field is required'),
  default_sorting_field: z.string().optional(),
  enable_nested_fields: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateCollectionForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      fields: [
        {
          name: '',
          type: 'string',
          facet: false,
          index: true,
          optional: false,
          sort: false,
          store: true,
        },
      ],
      enable_nested_fields: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  const watchFields = watch('fields');
  const sortableFields = watchFields.filter((field) =>
    ['int32', 'int64', 'float'].includes(field.type),
  );

  const onSubmit = (data: FormData) => {
    // Here you would typically send the data to your backend
    console.log(data);
    toast({
      title: 'Collection Created',
      description: `Collection "${data.name}" has been created successfully.`,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Collection</CardTitle>
          <CardDescription>
            Define the schema for your new Typesense collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Collection Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fields</Label>
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`fields.${index}.name`}>Field Name</Label>
                    <Input {...register(`fields.${index}.name` as const)} />
                    {errors.fields?.[index]?.name && (
                      <p className="text-sm text-red-500">
                        {errors.fields[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`fields.${index}.type`}>Field Type</Label>
                    <Controller
                      name={`fields.${index}.type` as const}
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                    />
                    <Label htmlFor={`fields.${index}.facet`}>Facet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`fields.${index}.index`}
                      {...register(`fields.${index}.index` as const)}
                    />
                    <Label htmlFor={`fields.${index}.index`}>Index</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`fields.${index}.optional`}
                      {...register(`fields.${index}.optional` as const)}
                    />
                    <Label htmlFor={`fields.${index}.optional`}>Optional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`fields.${index}.sort`}
                      {...register(`fields.${index}.sort` as const)}
                    />
                    <Label htmlFor={`fields.${index}.sort`}>Sort</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`fields.${index}.store`}
                      {...register(`fields.${index}.store` as const)}
                    />
                    <Label htmlFor={`fields.${index}.store`}>Store</Label>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
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
                  store: true,
                })
              }
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Field
            </Button>
            {errors.fields && (
              <p className="text-sm text-red-500">{errors.fields.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_sorting_field">Default Sorting Field</Label>
            <Controller
              name="default_sorting_field"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="enable_nested_fields"
              {...register('enable_nested_fields')}
            />
            <Label htmlFor="enable_nested_fields">Enable Nested Fields</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Create Collection</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
