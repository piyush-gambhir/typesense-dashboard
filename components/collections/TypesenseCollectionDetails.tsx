'use client';

import {
  ArrowRightFromLineIcon,
  Import,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  deleteCollection,
  updateCollection,
} from '@/lib/typesense/collections';

import { toast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface Field {
  name: string;
  type: string;
  facet: boolean;
  index: boolean;
  optional: boolean;
  sort: boolean;
  store: boolean;
}

interface CollectionDetails {
  name: string;
  created_at: number;
  num_documents: number;
  default_sorting_field: string;
  enable_nested_fields: boolean;
  fields: Field[];
}

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

export default function CollectionDetails({
  initialCollection,
}: Readonly<{
  initialCollection: any;
}>) {
  const router = useRouter();
  const [collection, setCollection] =
    useState<CollectionDetails>(initialCollection);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonSchema, setJsonSchema] = useState(
    JSON.stringify(collection, null, 2),
  );

  const handleFieldChange = (
    index: number,
    key: keyof Field,
    value: boolean | string,
  ) => {
    const updatedFields = [...collection.fields];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    setCollection({ ...collection, fields: updatedFields });
  };

  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonSchema(event.target.value);
  };

  const handleUpdateSchema = () => {
    if (isJsonMode) {
      try {
        const parsedSchema = JSON.parse(jsonSchema);
        updateCollection(collection.name, parsedSchema);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Invalid JSON. Please check your input.',
          variant: 'destructive',
        });
      }
    } else {
      // In table mode, the schema is already updated in state
      toast({
        title: 'Schema Updated',
        description: 'The collection schema has been updated successfully.',
      });
    }
  };

  const handleAddField = () => {
    const newField: Field = {
      name: `new_field_${collection.fields.length + 1}`,
      type: 'string',
      facet: false,
      index: true,
      optional: true,
      sort: false,
      store: true,
    };
    setCollection({
      ...collection,
      fields: [...collection.fields, newField],
    });
  };

  const handleDeleteField = (index: number) => {
    const updatedFields = [...collection.fields];
    updatedFields.splice(index, 1);
    setCollection({
      ...collection,
      fields: updatedFields,
    });
  };

  const handleDefaultSortingFieldChange = (value: string) => {
    setCollection({ ...collection, default_sorting_field: value });
  };

  const handleNestedFieldsChange = (checked: boolean) => {
    setCollection({ ...collection, enable_nested_fields: checked });
  };

  const handleImportDocuments = () => {
    router.push(`collections/${collection.name}/documents/import`);
  };

  const handleExportDocuments = () => {
    router.push(`collections/${collection.name}/documents/export`);
  };

  const handleDeleteCollection = () => {
    // deleteCollection(collection.name);
  };

  return (
    <div className="container mx-auto p-8 flex flex-col gap-y-8">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{collection.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-lg font-semibold">
                {new Date(collection.created_at * 1000).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Number of Documents
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {collection.num_documents.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Default Sorting Field
              </dt>
              <dd className="mt-1">
                <Select
                  value={collection.default_sorting_field}
                  onValueChange={handleDefaultSortingFieldChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {collection.fields.map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Nested Fields
              </dt>
              <dd className="mt-1">
                <Switch
                  checked={collection.enable_nested_fields}
                  onCheckedChange={handleNestedFieldsChange}
                  aria-label="Toggle nested fields"
                />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fields</CardTitle>
          <div className="flex items-center space-x-2">
            <span>Table</span>
            <Switch
              checked={isJsonMode}
              onCheckedChange={setIsJsonMode}
              aria-label="Toggle JSON mode"
            />
            <span>JSON</span>
          </div>
        </CardHeader>
        <CardContent>
          {isJsonMode ? (
            <Textarea
              value={jsonSchema}
              onChange={handleJsonChange}
              className="font-mono h-[500px]"
              placeholder="Edit JSON schema here..."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Facet</TableHead>
                  <TableHead>Index</TableHead>
                  <TableHead>Optional</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collection.fields.map((field, index) => (
                  <TableRow key={field.name}>
                    <TableCell>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          handleFieldChange(index, 'name', e.target.value)
                        }
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          handleFieldChange(index, 'type', value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={field.facet}
                        onCheckedChange={(checked) =>
                          handleFieldChange(index, 'facet', checked)
                        }
                        aria-label={`Toggle facet for ${field.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={field.index}
                        onCheckedChange={(checked) =>
                          handleFieldChange(index, 'index', checked)
                        }
                        aria-label={`Toggle index for ${field.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={field.optional}
                        onCheckedChange={(checked) =>
                          handleFieldChange(index, 'optional', checked)
                        }
                        aria-label={`Toggle optional for ${field.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={field.sort}
                        onCheckedChange={(checked) =>
                          handleFieldChange(index, 'sort', checked)
                        }
                        aria-label={`Toggle sort for ${field.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={field.store}
                        onCheckedChange={(checked) =>
                          handleFieldChange(index, 'store', checked)
                        }
                        aria-label={`Toggle store for ${field.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div className="space-x-2">
          <Button onClick={handleAddField} disabled={isJsonMode}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Field
          </Button>
          <Button onClick={handleImportDocuments}>
            <Import className="w-4 h-4 mr-2" />
            Import Documents
          </Button>
          <Button onClick={handleExportDocuments}>
            <ArrowRightFromLineIcon className="w-4 h-4 mr-2" />
            Export Documents
          </Button>
        </div>
        <div className="space-x-2">
          <Button onClick={handleUpdateSchema} variant="default">
            Update Schema
          </Button>
          <Button onClick={handleDeleteCollection} variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Collection
          </Button>
        </div>
      </div>
    </div>
  );
}
