'use client';

import {
  ArrowRightFromLineIcon,
  Import,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Editor from '@monaco-editor/react';

import {
  deleteCollection,
  updateCollection,
} from '@/lib/typesense/collections';

import { toast } from '@/hooks/useToast';
import DeleteCollectionDialog from '@/components/features/collections/DeleteCollectionDialog';

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

interface Field {
  name: string;
  type: string;
  facet?: boolean;
  index?: boolean;
  optional?: boolean;
  sort?: boolean;
  store?: boolean;
}

interface CollectionDetails {
  name: string;
  created_at: number;
  num_documents: number;
  default_sorting_field?: string;
  enable_nested_fields?: boolean;
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



  const handleUpdateSchema = async () => {
    try {
      let updatedCollectionData;
      if (isJsonMode) {
        try {
          updatedCollectionData = JSON.parse(jsonSchema);
        } catch (parseError) {
          toast({
            title: 'JSON Parse Error',
            description: 'Invalid JSON format. Please check your schema.',
            variant: 'destructive',
          });
          return;
        }
      } else {
        updatedCollectionData = collection; // Schema is already updated in state for table mode
      }

      console.log('Sending update data:', updatedCollectionData);

      const updatedCollection = await updateCollection(
        collection.name,
        updatedCollectionData,
      );

      if (updatedCollection) {
        setCollection(updatedCollection as CollectionDetails);
        toast({
          title: 'Schema Updated',
          description: 'The collection schema has been updated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update collection schema. This might be because you\'re trying to modify existing fields, which is not allowed in Typesense. Check the console for details.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Update schema error:', error);
      toast({
        title: 'Error',
        description: `Failed to update collection schema: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        variant: 'destructive',
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-y-6 lg:gap-y-8">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{collection.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Action Buttons */}

          <div className="flex flex-col lg:flex-row gap-4 lg:justify-between lg:items-center">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleAddField} 
                disabled={isJsonMode}
                variant="outline"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Field
              </Button>
              <Button 
                onClick={handleImportDocuments}
                variant="outline"
              >
                <Import className="w-4 h-4 mr-2" />
                Import Documents
              </Button>
              <Button 
                onClick={handleExportDocuments}
                variant="outline"
              >
                <ArrowRightFromLineIcon className="w-4 h-4 mr-2" />
                Export Documents
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleUpdateSchema} 
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Update Schema
              </Button>
              <DeleteCollectionDialog collectionName={collection.name} />
            </div>
          </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Fields</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Table</span>
            <Switch
              checked={isJsonMode}
              onCheckedChange={setIsJsonMode}
              aria-label="Toggle JSON mode"
            />
            <span className="text-sm text-gray-600">JSON</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Typesense only allows adding new fields to existing collections. 
              You cannot modify field types, delete existing fields, or change existing field properties. 
              If you need to change field properties, you'll need to recreate the collection.
            </p>
          </div>
          {isJsonMode ? (
            <div className="border rounded-md overflow-hidden">
              <Editor
                height="400px"
                defaultLanguage="json"
                value={jsonSchema}
                onChange={(value) => setJsonSchema(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  theme: 'vs-dark',
                  wordWrap: 'on',
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {collection.fields.map((field, index) => {
                  // Check if this is a new field (added by user) or existing field
                  const isNewField = field.name.startsWith('new_field_');
                  
                  return (
                    <TableRow key={field.name}>
                      <TableCell>
                        {isNewField ? (
                          <Input
                            value={field.name}
                            onChange={(e) =>
                              handleFieldChange(index, 'name', e.target.value)
                            }
                            className="w-full"
                          />
                        ) : (
                          <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md">
                            {field.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isNewField ? (
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
                        ) : (
                          <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md">
                            {field.type}
                          </div>
                        )}
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

                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
