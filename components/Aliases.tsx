'use client';

import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/LoadingSpinner';

import { createAlias, deleteAlias, listAliases } from '@/lib/typesense/aliases';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Alias {
  name: string;
  collection_name: string;
}

export default function Aliases() {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [newAliasName, setNewAliasName] = useState('');
  const [newAliasCollection, setNewAliasCollection] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [aliasToDelete, setAliasToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAliases = async () => {
    try {
      const fetchedAliases = await listAliases();
      if (fetchedAliases) {
        setAliases(fetchedAliases);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load aliases.',
        variant: 'destructive',
      });
    }
  };

  const fetchCollections = async () => {
    try {
      const fetchedCollections = await getCollections();
      if (fetchedCollections && fetchedCollections.success && fetchedCollections.data) {
        setCollections(fetchedCollections.data.map((col: any) => col.name));
      } else {
        toast({
          title: 'Error',
          description: fetchedCollections?.error || 'Failed to load collections.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load collections.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAliases(), fetchCollections()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleCreateAlias = async () => {
    if (!newAliasName?.trim() || !newAliasCollection) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both alias name and collection.',
        variant: 'destructive',
      });
      return;
    }

    if (aliases.find(alias => alias.name === newAliasName.trim())) {
      toast({
        title: 'Validation Error',
        description: 'An alias with this name already exists.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const created = await createAlias(newAliasName, newAliasCollection);
      if (created) {
        toast({
          title: 'Alias Created',
          description: `Alias '${newAliasName}' for collection '${newAliasCollection}' created successfully.`,
        });
        setNewAliasName('');
        setNewAliasCollection('');
        fetchAliases();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create alias.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create alias',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAlias = async () => {
    if (!aliasToDelete) return;

    try {
      const deleted = await deleteAlias(aliasToDelete);
      if (deleted) {
        toast({
          title: 'Alias Deleted',
          description: `Alias '${aliasToDelete}' deleted successfully.`,
        });
        fetchAliases();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete alias.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete alias',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setAliasToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-8 flex flex-col gap-y-8">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Aliases</CardTitle>
          <CardDescription>Manage your Typesense collection aliases.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner text="Loading aliases..." className="py-8" />
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alias Name</TableHead>
                <TableHead>Points To Collection</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aliases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No aliases found.
                  </TableCell>
                </TableRow>
              ) : (
                aliases.map((alias) => (
                  <TableRow key={alias.name}>
                    <TableCell className="font-medium">{alias.name}</TableCell>
                    <TableCell>{alias.collection_name}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setAliasToDelete(alias.name);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Alias
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Alias</DialogTitle>
                <DialogDescription>
                  Create a new alias to point to an existing collection.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alias-name" className="text-right">
                    Alias Name
                  </Label>
                  <Input
                    id="alias-name"
                    value={newAliasName}
                    onChange={(e) => setNewAliasName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="collection-name" className="text-right">
                    Collection
                  </Label>
                  <Select
                    onValueChange={setNewAliasCollection}
                    value={newAliasCollection}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateAlias} disabled={isCreating || !newAliasName.trim() || !newAliasCollection}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Alias'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              alias <span className="font-bold">{aliasToDelete}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAlias}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
