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
import { useGlobalSearchOverrides, GlobalOverride } from '@/hooks/presets/use-global-search-overrides';
import { useGlobalPresetForm } from '@/hooks/presets/use-global-preset-form';
import { useAsyncOperation } from '@/hooks/shared/use-async-operation';
import GlobalPresetsList from './global-presets-list';
import GlobalPresetForm from './global-preset-form';
import DeleteConfirmationDialog from '@/components/shared/delete-confirmation-dialog';

export default function GlobalPresetsContainer() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<GlobalOverride | null>(null);
  const [overrideToDelete, setOverrideToDelete] = useState<GlobalOverride | null>(null);

  const { overrides, collections, loading, createOverride, updateOverride, deleteOverride } = useGlobalSearchOverrides();
  
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
  } = useGlobalPresetForm();

  const { loading: creating, execute: executeCreate } = useAsyncOperation();
  const { loading: updating, execute: executeUpdate } = useAsyncOperation();
  const { loading: deleting, execute: executeDelete } = useAsyncOperation();

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (override: GlobalOverride) => {
    setEditingOverride(override);
    loadOverrideData(override);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (override: GlobalOverride) => {
    setOverrideToDelete(override);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    const success = await executeCreate(async () => {
      return await createOverride(formData.collection, buildOverrideData());
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
      return await updateOverride(formData.collection, formData.id, buildOverrideData());
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
      return await deleteOverride(overrideToDelete.collection_name, overrideToDelete.id);
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
              <CardTitle>Search Presets</CardTitle>
              <CardDescription>
                Manage global search overrides across all collections to curate and customize search results.
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Preset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <GlobalPresetsList
            overrides={overrides}
            collections={collections}
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
            <DialogTitle>Create Search Preset</DialogTitle>
            <DialogDescription>
              Create a new global search override to customize results for specific queries across collections.
            </DialogDescription>
          </DialogHeader>
          <GlobalPresetForm
            formData={formData}
            collections={collections}
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
              {creating ? 'Creating...' : 'Create Preset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Search Preset</DialogTitle>
            <DialogDescription>
              Modify the global search override settings.
            </DialogDescription>
          </DialogHeader>
          <GlobalPresetForm
            formData={formData}
            collections={collections}
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
              {updating ? 'Updating...' : 'Update Preset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Search Preset"
        description="This action cannot be undone. This will permanently delete the search preset and remove all associated overrides."
        itemName={overrideToDelete?.id}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}