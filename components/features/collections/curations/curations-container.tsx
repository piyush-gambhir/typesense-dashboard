'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSearchOverrides, CurationOverride } from '@/hooks/curations/use-search-overrides';
import { useCurationForm } from '@/hooks/curations/use-curation-form';
import { useAsyncOperation } from '@/hooks/shared/use-async-operation';
import CurationsList from './curations-list';
import CurationForm from './curation-form';
import DeleteConfirmationDialog from '@/components/shared/delete-confirmation-dialog';

interface CurationsContainerProps {
  collectionName: string;
}

export default function CurationsContainer({ collectionName }: CurationsContainerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<CurationOverride | null>(null);
  const [overrideToDelete, setOverrideToDelete] = useState<CurationOverride | null>(null);

  const { overrides, loading, createOverride, updateOverride, deleteOverride } = useSearchOverrides(collectionName);
  
  const {
    formData,
    forceIncludeInput,
    forceIncludePosition,
    forceExcludeInput,
    stopWordInput,
    setForceIncludeInput,
    setForceIncludePosition,
    setForceExcludeInput,
    setStopWordInput,
    resetForm,
    loadOverrideData,
    addForceInclude,
    removeForceInclude,
    addForceExclude,
    removeForceExclude,
    addStopWord,
    removeStopWord,
    updateFormData,
    buildOverrideData,
    isFormValid,
  } = useCurationForm(collectionName);

  const { loading: creating, execute: executeCreate } = useAsyncOperation();
  const { loading: updating, execute: executeUpdate } = useAsyncOperation();
  const { loading: deleting, execute: executeDelete } = useAsyncOperation();

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (override: CurationOverride) => {
    setEditingOverride(override);
    loadOverrideData(override);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (override: CurationOverride) => {
    setOverrideToDelete(override);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    const success = await executeCreate(async () => {
      return await createOverride(buildOverrideData());
    });

    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editingOverride || !isFormValid()) {
      return;
    }

    const success = await executeUpdate(async () => {
      return await updateOverride(formData.id, buildOverrideData());
    });

    if (success) {
      setIsEditDialogOpen(false);
      setEditingOverride(null);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!overrideToDelete) return;

    const success = await executeDelete(async () => {
      return await deleteOverride(overrideToDelete.id);
    });

    if (success) {
      setIsDeleteDialogOpen(false);
      setOverrideToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Curations</CardTitle>
              <CardDescription>
                Manage search overrides to curate and customize search results for specific queries.
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Curation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CurationsList
            overrides={overrides}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Search Curation</DialogTitle>
            <DialogDescription>
              Create a new search override to customize results for specific queries.
            </DialogDescription>
          </DialogHeader>
          <CurationForm
            formData={formData}
            forceIncludeInput={forceIncludeInput}
            forceIncludePosition={forceIncludePosition}
            forceExcludeInput={forceExcludeInput}
            stopWordInput={stopWordInput}
            onFormDataChange={updateFormData}
            onForceIncludeInputChange={setForceIncludeInput}
            onForceIncludePositionChange={setForceIncludePosition}
            onForceExcludeInputChange={setForceExcludeInput}
            onStopWordInputChange={setStopWordInput}
            onAddForceInclude={addForceInclude}
            onRemoveForceInclude={removeForceInclude}
            onAddForceExclude={addForceExclude}
            onRemoveForceExclude={removeForceExclude}
            onAddStopWord={addStopWord}
            onRemoveStopWord={removeStopWord}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSubmit} 
              disabled={!isFormValid() || creating}
            >
              {creating ? 'Creating...' : 'Create Curation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Search Curation</DialogTitle>
            <DialogDescription>
              Modify the search override settings.
            </DialogDescription>
          </DialogHeader>
          <CurationForm
            formData={formData}
            forceIncludeInput={forceIncludeInput}
            forceIncludePosition={forceIncludePosition}
            forceExcludeInput={forceExcludeInput}
            stopWordInput={stopWordInput}
            onFormDataChange={updateFormData}
            onForceIncludeInputChange={setForceIncludeInput}
            onForceIncludePositionChange={setForceIncludePosition}
            onForceExcludeInputChange={setForceExcludeInput}
            onStopWordInputChange={setStopWordInput}
            onAddForceInclude={addForceInclude}
            onRemoveForceInclude={removeForceInclude}
            onAddForceExclude={addForceExclude}
            onRemoveForceExclude={removeForceExclude}
            onAddStopWord={addStopWord}
            onRemoveStopWord={removeStopWord}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSubmit} 
              disabled={!isFormValid() || updating}
            >
              {updating ? 'Updating...' : 'Update Curation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Search Curation"
        description="This action cannot be undone. This will permanently delete the search curation and remove all associated overrides."
        itemName={overrideToDelete?.id}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}