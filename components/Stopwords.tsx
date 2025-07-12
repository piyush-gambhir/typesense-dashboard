'use client';

import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { listStopwords, upsertStopwords, deleteStopwords } from '@/lib/typesense/stopwords';
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
import LoadingSpinner from '@/components/LoadingSpinner';

interface StopwordsSet {
  id: string;
  stopwords: string[];
}

export default function Stopwords() {
  const [stopwordsSets, setStopwordsSets] = useState<StopwordsSet[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [newStopwordsId, setNewStopwordsId] = useState('');
  const [newStopwords, setNewStopwords] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [stopwordsToDelete, setStopwordsToDelete] = useState<StopwordsSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      const fetchedCollections = await getCollections();
      if (fetchedCollections && fetchedCollections.success && fetchedCollections.data) {
        setCollections(fetchedCollections.data.map((col: any) => col.name));
        if (fetchedCollections.data.length > 0) {
          setSelectedCollection(fetchedCollections.data[0].name);
        }
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

  const fetchStopwords = async (collectionName: string) => {
    if (!collectionName) return;
    
    try {
      const fetchedStopwords = await listStopwords(collectionName);
      if (fetchedStopwords) {
        setStopwordsSets(fetchedStopwords);
      } else {
        setStopwordsSets([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load stopwords.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchCollections();
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchStopwords(selectedCollection);
    }
  }, [selectedCollection]);

  const handleCreateStopwords = async () => {
    if (!newStopwordsId?.trim() || !newStopwords?.trim() || !selectedCollection) {
      toast({
        title: 'Validation Error',
        description: 'Please provide stopwords ID, stopwords list, and select a collection.',
        variant: 'destructive',
      });
      return;
    }

    const stopwordsArray = newStopwords.split(',').map(word => word.trim()).filter(word => word);
    
    if (stopwordsArray.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least one stopword.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const created = await upsertStopwords(selectedCollection, newStopwordsId, {
        stopwords: stopwordsArray,
      });
      if (created) {
        toast({
          title: 'Stopwords Created',
          description: `Stopwords set '${newStopwordsId}' created successfully.`,
        });
        setNewStopwordsId('');
        setNewStopwords('');
        fetchStopwords(selectedCollection);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create stopwords set.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create stopwords set',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStopwords = async () => {
    if (!stopwordsToDelete || !selectedCollection) return;

    try {
      const deleted = await deleteStopwords(selectedCollection, stopwordsToDelete.id);
      if (deleted) {
        toast({
          title: 'Stopwords Deleted',
          description: `Stopwords set '${stopwordsToDelete.id}' deleted successfully.`,
        });
        fetchStopwords(selectedCollection);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete stopwords set.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete stopwords set',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setStopwordsToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex flex-col gap-y-8">
        <LoadingSpinner text="Loading collections..." className="py-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 flex flex-col gap-y-8">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Stopwords</CardTitle>
          <CardDescription>Manage stopwords for your Typesense collections.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="collection-select">Select Collection</Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-full">
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

          {selectedCollection && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stopwords Set ID</TableHead>
                  <TableHead>Stopwords</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stopwordsSets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No stopwords sets found for this collection.
                    </TableCell>
                  </TableRow>
                ) : (
                  stopwordsSets.map((stopwordsSet) => (
                    <TableRow key={stopwordsSet.id}>
                      <TableCell className="font-medium">{stopwordsSet.id}</TableCell>
                      <TableCell>
                        <div className="max-w-md truncate">
                          {stopwordsSet.stopwords.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setStopwordsToDelete(stopwordsSet);
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
              <Button disabled={!selectedCollection}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Stopwords Set
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Stopwords Set</DialogTitle>
                <DialogDescription>
                  Create a new stopwords set for the selected collection.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stopwords-id" className="text-right">
                    Set ID
                  </Label>
                  <Input
                    id="stopwords-id"
                    value={newStopwordsId}
                    onChange={(e) => setNewStopwordsId(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., common-words"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stopwords-list" className="text-right">
                    Stopwords
                  </Label>
                  <Textarea
                    id="stopwords-list"
                    value={newStopwords}
                    onChange={(e) => setNewStopwords(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter stopwords separated by commas (e.g., the, a, an, is, are)"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateStopwords} 
                  disabled={isCreating || !newStopwordsId.trim() || !newStopwords.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Stopwords Set'}
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
              stopwords set <span className="font-bold">{stopwordsToDelete?.id}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStopwords}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 