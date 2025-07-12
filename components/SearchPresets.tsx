'use client';

import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createSearchOverride, deleteSearchOverride, listSearchOverrides } from '@/lib/typesense/search-overrides';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchOverride {
  id: string;
  collection_name: string;
  rule: Record<string, any>;
  applies_to: string;
  force_include?: Array<{ id: string; position: number }>;
  force_exclude?: Array<{ id: string }>;
  stop_words?: string[];
}

export default function SearchPresets() {
  const [overrides, setOverrides] = useState<SearchOverride[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [newOverrideId, setNewOverrideId] = useState('');
  const [newOverrideCollection, setNewOverrideCollection] = useState('');
  const [newOverrideRule, setNewOverrideRule] = useState('');
  const [newOverrideAppliesTo, setNewOverrideAppliesTo] = useState('always');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [overrideToDelete, setOverrideToDelete] = useState<SearchOverride | null>(null);

  const fetchOverrides = async () => {
    try {
      const fetchedOverrides = await listSearchOverrides();
      if (fetchedOverrides) {
        setOverrides(fetchedOverrides);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load search overrides.',
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
    fetchOverrides();
    fetchCollections();
  }, []);

  const handleCreateOverride = async () => {
    if (!newOverrideId || !newOverrideCollection || !newOverrideRule) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const parsedRule = JSON.parse(newOverrideRule);
      setIsCreating(true);
      const created = await createSearchOverride(
        newOverrideCollection,
        newOverrideId,
        {
          rule: parsedRule,
          applies_to: newOverrideAppliesTo,
        },
      );
      if (created) {
        toast({
          title: 'Search Override Created',
          description: `Override '${newOverrideId}' created successfully.`,
        });
        setNewOverrideId('');
        setNewOverrideCollection('');
        setNewOverrideRule('');
        setNewOverrideAppliesTo('always');
        fetchOverrides();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create search override.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create search override',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOverride = async () => {
    if (!overrideToDelete) return;

    try {
      const deleted = await deleteSearchOverride(
        overrideToDelete.collection_name,
        overrideToDelete.id,
      );
      if (deleted) {
        toast({
          title: 'Search Override Deleted',
          description: `Override '${overrideToDelete.id}' deleted successfully.`,
        });
        fetchOverrides();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete search override.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete search override',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOverrideToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-8 flex flex-col gap-y-8">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Search Presets (Overrides)</CardTitle>
          <CardDescription>Manage your Typesense search overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No search overrides found.
                  </TableCell>
                </TableRow>
              ) : (
                overrides.map((override) => (
                  <TableRow key={override.id}>
                    <TableCell className="font-medium">{override.id}</TableCell>
                    <TableCell>{override.collection_name}</TableCell>
                    <TableCell>
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(override.rule, null, 2)}
                      </pre>
                    </TableCell>
                    <TableCell>{override.applies_to}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setOverrideToDelete(override);
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
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Override
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Search Override</DialogTitle>
                <DialogDescription>
                  Create a new search override for a collection.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="override-id" className="text-right">
                    Override ID
                  </Label>
                  <Input
                    id="override-id"
                    value={newOverrideId}
                    onChange={(e) => setNewOverrideId(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="collection-name" className="text-right">
                    Collection
                  </Label>
                  <Select
                    onValueChange={setNewOverrideCollection}
                    value={newOverrideCollection}
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rule-json" className="text-right">
                    Rule JSON
                  </Label>
                  <Textarea
                    id="rule-json"
                    value={newOverrideRule}
                    onChange={(e) => setNewOverrideRule(e.target.value)}
                    className="col-span-3 font-mono h-48"
                    placeholder="Enter rule JSON here..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="applies-to" className="text-right">
                    Applies To
                  </Label>
                  <Select
                    onValueChange={setNewOverrideAppliesTo}
                    value={newOverrideAppliesTo}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="on_match">On Match</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateOverride} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Override'}
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
              search override <span className="font-bold">{overrideToDelete?.id}</span>
              from collection <span className="font-bold">{overrideToDelete?.collection_name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOverride}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
