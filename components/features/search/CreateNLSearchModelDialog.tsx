'use client';

import React, { useState } from 'react';
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
import { useToast } from '@/hooks/useToast';

import {
  createNLSearchModel,
  getDefaultSystemPrompts,
} from '@/lib/typesense/nl-search-models';

interface CreateNLSearchModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateNLSearchModelDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateNLSearchModelDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    model_name: '',
    api_key: '',
    system_prompt: '',
    max_bytes: 16000,
    temperature: 0.0,
  });

  const defaultPrompts = getDefaultSystemPrompts();

  const handleModelTypeChange = (modelType: string) => {
    setFormData((prev) => ({
      ...prev,
      model_name: modelType,
    }));
  };

  const handleSystemPromptTemplate = (template: string) => {
    setFormData((prev) => ({
      ...prev,
      system_prompt: defaultPrompts[template as keyof typeof defaultPrompts],
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createNLSearchModel(formData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'NL search model created successfully.',
        });
        onSuccess();
        onOpenChange(false);
        // Reset form
        setFormData({
          id: '',
          model_name: '',
          api_key: '',
          system_prompt: '',
          max_bytes: 16000,
          temperature: 0.0,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create NL search model.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create NL search model.',
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
          <DialogTitle>Create NL Search Model</DialogTitle>
          <DialogDescription>
            Configure a new natural language search model to enable AI-powered search.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">Model ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, id: e.target.value }))
                }
                placeholder="e.g., openai"
                required
              />
            </div>

            <div>
              <Label htmlFor="model_name">Model Name</Label>
              <Select
                value={formData.model_name}
                onValueChange={handleModelTypeChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai/gpt-4.1">OpenAI GPT-4.1</SelectItem>
                  <SelectItem value="openai/gpt-4o">OpenAI GPT-4o</SelectItem>
                  <SelectItem value="openai/gpt-4o-mini">OpenAI GPT-4o Mini</SelectItem>
                  <SelectItem value="anthropic/claude-3-opus">Anthropic Claude 3 Opus</SelectItem>
                  <SelectItem value="anthropic/claude-3-sonnet">Anthropic Claude 3 Sonnet</SelectItem>
                  <SelectItem value="google/gemini-2.5-flash">Google Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="google/gemini-1.5-pro">Google Gemini 1.5 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    api_key: e.target.value,
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
                value={formData.system_prompt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    system_prompt: e.target.value,
                  }))
                }
                placeholder="Enter system prompt to guide the model's behavior..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_bytes">Max Bytes</Label>
                <Input
                  id="max_bytes"
                  type="number"
                  value={formData.max_bytes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      max_bytes: parseInt(e.target.value) || 16000,
                    }))
                  }
                  min="1000"
                  max="32000"
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      temperature: parseFloat(e.target.value) || 0.0,
                    }))
                  }
                  min="0"
                  max="2"
                />
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
              {isLoading ? 'Creating...' : 'Create Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 