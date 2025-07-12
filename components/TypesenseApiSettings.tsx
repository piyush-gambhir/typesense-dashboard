'use client';

import { useEffect, useState } from 'react';

import { createApiKey, deleteApiKey } from '@/lib/typesense/api-keys';
import { getCollections } from '@/lib/typesense/collections';

import { toast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ApiKey {
  id: string | number;
  description: string | undefined;
  actions: string[];
  collections: string[];
  value?: string;
}

const availableActions = [
  'documents:create',
  'documents:delete',
  'documents:update',
  'documents:*',
  'collections:create',
  'collections:delete',
  'collections:update',
  'collections:*',
  'search',
  'keys:create',
  'keys:delete',
  'keys:list',
  'keys:*',
  'curations:upsert',
  'curations:delete',
  'curations:*',
  'debug',
  'metrics',
  'synonyms:upsert',
  'synonyms:delete',
  'synonyms:*',
  'aliases:upsert',
  'aliases:delete',
  'aliases:*',
];

export default function TypesenseApiSettings({
  initialApiKeys,
}: Readonly<{
  initialApiKeys: ApiKey[];
}>) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(
    Array.isArray(initialApiKeys) ? initialApiKeys : [],
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [newKeyActions, setNewKeyActions] = useState<string[]>([]);
  const [newKeyCollections, setNewKeyCollections] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [availableCollections, setAvailableCollections] = useState<string[]>(
    [],
  );

  useEffect(() => {
    const fetchCollections = async () => {
      const collections = await getCollections();
      if (collections && collections.success && collections.data) {
        setAvailableCollections(collections.data.map((c) => c.name));
      }
    };
    fetchCollections();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyDescription || newKeyCollections.length === 0) {
      toast({
        title: 'Error',
        description: 'Description and collections cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    const newKey = await createApiKey(
      newKeyDescription,
      newKeyActions,
      newKeyCollections,
    );

    if (newKey) {
      setApiKeys([
        ...apiKeys,
        {
          id: newKey.id.toString(),
          description: newKey.description,
          actions: newKey.actions,
          collections: newKey.collections,
          value: newKey.value,
        },
      ]);
      setIsCreateDialogOpen(false);
      setNewKeyDescription('');
      setNewKeyActions([]);
      setNewKeyCollections([]);
      toast({
        title: 'Success',
        description: `New API key created: ${newKey.value}`,
        variant: 'default',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create new API key',
        variant: 'destructive',
      });
    }

    setIsCreating(false);
  };

  const handleDeleteKey = async (keyId: string) => {
    const result = await deleteApiKey(Number(keyId));
    if (result) {
      setApiKeys(apiKeys.filter((key) => key.id !== keyId));
      toast({
        title: 'Success',
        description: 'API key deleted',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container h-full overflow-hidden mx-auto">
      <Card className="h-full flex flex-col border-none shadow-none">
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>Manage your Typesense API keys</CardDescription>
        </CardHeader>
        <CardContent className="grow overflow-hidden">
          <ScrollArea className="h-full">
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API keys available. Create one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Collections</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.description}</TableCell>
                      <TableCell>{key.actions.join(', ')}</TableCell>
                      <TableCell>{key.collections.join(', ')}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteKey(key.id.toString())}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Create New API Key</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key with specific permissions.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="grow">
                <div className="grid gap-4 py-4 px-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newKeyDescription}
                      onChange={(e) => setNewKeyDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right">Collections</Label>
                    <div className="col-span-3 space-y-2">
                      {availableCollections.map((collection) => (
                        <div
                          key={collection}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={collection}
                            checked={newKeyCollections.includes(collection)}
                            onCheckedChange={(checked) => {
                              setNewKeyCollections(
                                checked
                                  ? [...newKeyCollections, collection]
                                  : newKeyCollections.filter(
                                      (c) => c !== collection,
                                    ),
                              );
                            }}
                          />
                          <label
                            htmlFor={collection}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {collection}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right">Actions</Label>
                    <div className="col-span-3 space-y-2">
                      {availableActions.map((action) => (
                        <div
                          key={action}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={action}
                            checked={newKeyActions.includes(action)}
                            onCheckedChange={(checked) => {
                              setNewKeyActions(
                                checked
                                  ? [...newKeyActions, action]
                                  : newKeyActions.filter((a) => a !== action),
                              );
                            }}
                          />
                          <label
                            htmlFor={action}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {action}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateKey}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Key'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
