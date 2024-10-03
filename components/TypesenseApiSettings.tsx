'use client';

import { useEffect, useState } from 'react';

import { createApiKey, deleteApiKey } from '@/lib/typesense/actions/api-keys';

import { toast } from '@/hooks/use-toast';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ApiKey {
  id: string;
  description: string;
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

export default function ApiSettingsDashboard({
  initialApiKeys,
}: {
  initialApiKeys: ApiKey[];
}) {
  // Ensure `initialApiKeys` is always an array
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(
    Array.isArray(initialApiKeys) ? initialApiKeys : [],
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [newKeyActions, setNewKeyActions] = useState<string[]>([]);
  const [newKeyCollections, setNewKeyCollections] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateKey = async () => {
    if (!newKeyDescription || !newKeyCollections) {
      toast({
        title: 'Error',
        description: 'Description and collections cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    const collections = newKeyCollections
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const newKey = await createApiKey(
      newKeyDescription,
      newKeyActions,
      collections,
    );

    if (newKey) {
      setApiKeys([...apiKeys, newKey]);
      setIsCreateDialogOpen(false);
      setNewKeyDescription('');
      setNewKeyActions([]);
      setNewKeyCollections('');
      toast({
        title: 'Success',
        description: `New API key created: ${newKey.value}`,
        variant: 'success',
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
    const result = await deleteApiKey(keyId);
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
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>Manage your Typesense API keys</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
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
                {/* Ensure `apiKeys` is an array before mapping */}
                {(apiKeys || []).map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.description}</TableCell>
                    <TableCell>{key.actions.join(', ')}</TableCell>
                    <TableCell>{key.collections.join(', ')}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key with specific permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="collections" className="text-right">
                    Collections
                  </Label>
                  <Input
                    id="collections"
                    value={newKeyCollections}
                    onChange={(e) => setNewKeyCollections(e.target.value)}
                    placeholder="collection1, collection2"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Actions</Label>
                  <div className="col-span-3 space-y-2">
                    {availableActions.map((action) => (
                      <div key={action} className="flex items-center space-x-2">
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
