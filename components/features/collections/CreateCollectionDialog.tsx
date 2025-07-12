'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CreateCollectionWithJsonl from '@/components/features/collections/CreateCollectionWithJsonl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function CreateCollectionDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        <CreateCollectionWithJsonl />
      </DialogContent>
    </Dialog>
  );
}
