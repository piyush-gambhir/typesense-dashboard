'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/useToast';

import {
  updateNLSearchModel,
  getAvailableModelTypes,
  getDefaultSystemPrompts,
  type NLSearchModel,
  type UpdateNLSearchModelRequest,
} from '@/lib/typesense/nl-search-models';
import { getCollections } from '@/lib/typesense/collections';

interface EditNLSearchModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: NLSearchModel;
  onSuccess: () => void;
}

export default function EditNLSearchModelDialog({
  open,
  onOpenChange,
  model,
  onSuccess,
}: EditNLSearchModelDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);

  const [formData, setFormData] = useState<UpdateNLSearchModelRequest>({
    name: model.name,
    model_config: {
      model_name: model.model_config.model_name,
      api_key: model.model_config.api_key,
      system_prompt: model.model_config.system_prompt || '',
      max_tokens: model.model_config.max_tokens || 1000,
      temperature: model.model_config.temperature || 0.7,
    },
    collections: model.collections,
  });

  const availableModelTypes = getAvailableModelTypes();
  const defaultPrompts = getDefaultSystemPrompts();

  useEffect(() => {
    if (open) {
      fetchCollections();
      // Reset form data when model changes
      setFormData({
        name: model.name,
        model_config: {
          model_name: model.model_config.model_name,
          api_key: model.model_config.api_key,
          system_prompt: model.model_config.system_prompt || '',
          max_tokens: model.model_config.max_tokens || 1000,
          temperature: model.model_config.temperature || 0.7,
        },
        collections: model.collections,
      });
    }
  }, [open, model]);

  const fetchCollections = async () => {
    try {
      const result = await getCollections();
      if (result.success && result.data) {
        setCollections(result.data.map((col: any) => col.name));
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleSystemPromptTemplate = (template: string) => {
    setFormData((prev) => ({
      ...prev,
      model_config: {
        ...prev.model_config!,
        system_prompt: defaultPrompts[template as keyof typeof defaultPrompts],
      },
    }));
  };

  const handleCollectionToggle = (collectionName: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      collections: checked
        ? [...(prev.collections || []), collectionName]
        : (prev.collections || []).filter((name) => name !== collectionName),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateNLSearchModel(model.id, formData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'NL search model updated successfully.',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update NL search model.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update NL search model.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit NL Search Model</DialogTitle>
          <DialogDescription>
            Update the configuration for "{model.name}" natural language search model.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Model Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., E-commerce Search Model"
                required
              />
            </div>

            <div>
              <Label>Model Type</Label>
              <div className="p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">{model.model_type}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Model type cannot be changed after creation
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.model_config?.api_key || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    model_config: {
                      ...prev.model_config!,
                      api_key: e.target.value,
                    },
                  }))
                }
                placeholder="Enter your API key"
                required
              />
            </div>

            <div>
              <Label htmlFor="system_prompt">System Prompt</Label>
              <div className="mb-2">
                <Select onValueChange={handleSystemPromptTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Use a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Search</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="support">Support Knowledge Base</SelectItem>
                    <SelectItem value="content">Content Discovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                id="system_prompt"
                value={formData.model_config?.system_prompt || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    model_config: {
                      ...prev.model_config!,
                      system_prompt: e.target.value,
                    },
                  }))
                }
                placeholder="Enter system prompt to guide the model's behavior..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  value={formData.model_config?.max_tokens || 1000}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      model_config: {
                        ...prev.model_config!,
                        max_tokens: parseInt(e.target.value) || 1000,
                      },
                    }))
                  }
                  min="100"
                  max="4000"
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.model_config?.temperature || 0.7}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      model_config: {
                        ...prev.model_config!,
                        temperature: parseFloat(e.target.value) || 0.7,
                      },
                    }))
                  }
                  min="0"
                  max="2"
                />
              </div>
            </div>

            <div>
              <Label>Associated Collections</Label>
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                {collections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No collections available</p>
                ) : (
                  collections.map((collection) => (
                    <div key={collection} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${collection}`}
                        checked={(formData.collections || []).includes(collection)}
                        onCheckedChange={(checked) =>
                          handleCollectionToggle(collection, !!checked)
                        }
                      />
                      <Label htmlFor={`edit-${collection}`} className="text-sm">
                        {collection}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 