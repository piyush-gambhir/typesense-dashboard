'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Bot, Brain } from 'lucide-react';

import {
  listNLSearchModels,
  deleteNLSearchModel,
  type NLSearchModel,
  getAvailableModelTypes,
} from '@/lib/typesense/nl-search-models';

import { useToast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import CreateNLSearchModelDialog from '@/components/CreateNLSearchModelDialog';
import EditNLSearchModelDialog from '@/components/EditNLSearchModelDialog';

export default function NLSearchModels() {
  const { toast } = useToast();
  const [models, setModels] = useState<NLSearchModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<NLSearchModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<NLSearchModel | null>(null);

  const availableModelTypes = getAvailableModelTypes();

  const fetchModels = async () => {
    setLoading(true);
    try {
      const result = await listNLSearchModels();
      if (result.success && result.data) {
        setModels(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load NL search models.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load NL search models.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleEdit = (model: NLSearchModel) => {
    setSelectedModel(model);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (model: NLSearchModel) => {
    setModelToDelete(model);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!modelToDelete) return;

    try {
      const result = await deleteNLSearchModel(modelToDelete.id);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'NL search model deleted successfully.',
        });
        fetchModels();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete NL search model.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete NL search model.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  const getModelTypeInfo = (modelType: string) => {
    for (const provider of availableModelTypes) {
      const model = provider.models.find(m => m.id === modelType);
      if (model) {
        return { provider: provider.provider, ...model };
      }
    }
    return { provider: 'Unknown', name: modelType, description: '' };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Natural Language Search Models
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage AI models for natural language search functionality
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      {models.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No NL Search Models</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first natural language search model to enable AI-powered search capabilities.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Model
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Models ({models.length})</CardTitle>
            <CardDescription>
              Configure and manage your natural language search models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model Type</TableHead>
                  <TableHead>Collections</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => {
                  const modelInfo = getModelTypeInfo(model.model_type);
                  return (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {model.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{modelInfo.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {modelInfo.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {model.collections.slice(0, 3).map((collection) => (
                            <Badge key={collection} variant="secondary">
                              {collection}
                            </Badge>
                          ))}
                          {model.collections.length > 3 && (
                            <Badge variant="outline">
                              +{model.collections.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{modelInfo.provider}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(model)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(model)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CreateNLSearchModelDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchModels}
      />

      {selectedModel && (
        <EditNLSearchModelDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          model={selectedModel}
          onSuccess={fetchModels}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete NL Search Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the model "{modelToDelete?.name}"? 
              This action cannot be undone and will disable natural language search 
              for associated collections.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 