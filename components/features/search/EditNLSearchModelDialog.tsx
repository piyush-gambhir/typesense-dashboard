'use client';

import React, { useEffect, useState } from 'react';

import {
    type NLSearchModel,
    getDefaultSystemPrompts,
    updateNLSearchModel,
} from '@/lib/typesense/nl-search-models';

import { useToast } from '@/hooks/useToast';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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

    const [formData, setFormData] = useState({
        api_key: model.api_key || '',
        system_prompt: model.system_prompt || '',
        max_bytes: model.max_bytes || 16000,
        temperature: model.temperature || 0.0,
    });

    const [originalData, setOriginalData] = useState({
        api_key: model.api_key || '',
        system_prompt: model.system_prompt || '',
        max_bytes: model.max_bytes || 16000,
        temperature: model.temperature || 0.0,
    });

    const defaultPrompts = getDefaultSystemPrompts();

    useEffect(() => {
        if (open) {
            // Reset form data when model changes
            const newData = {
                api_key: model.api_key || '',
                system_prompt: model.system_prompt || '',
                max_bytes: model.max_bytes || 16000,
                temperature: model.temperature || 0.0,
            };
            setFormData(newData);
            setOriginalData(newData);
        }
    }, [open, model]);

    const handleSystemPromptTemplate = (template: string) => {
        setFormData((prev) => ({
            ...prev,
            system_prompt:
                defaultPrompts[template as keyof typeof defaultPrompts],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Only send fields that have changed
            const changedFields: Record<string, unknown> = {};

            if (formData.api_key !== originalData.api_key) {
                changedFields.api_key = formData.api_key;
            }
            if (formData.system_prompt !== originalData.system_prompt) {
                changedFields.system_prompt = formData.system_prompt;
            }
            if (formData.max_bytes !== originalData.max_bytes) {
                changedFields.max_bytes = formData.max_bytes;
            }
            if (formData.temperature !== originalData.temperature) {
                changedFields.temperature = formData.temperature;
            }

            // Only update if there are changes
            if (Object.keys(changedFields).length === 0) {
                toast({
                    title: 'No Changes',
                    description:
                        'No changes detected. The model is already up to date.',
                });
                onOpenChange(false);
                return;
            }

            const result = await updateNLSearchModel(model.id, changedFields);
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
                    description:
                        result.error || 'Failed to update NL search model.',
                    variant: 'destructive',
                });
            }
        } catch {
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
                        Update the configuration for &quot;{model.id}&quot;
                        natural language search model.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label>Model ID</Label>
                            <div className="p-3 bg-muted rounded-md">
                                <span className="text-sm font-medium">
                                    {model.id}
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Model ID cannot be changed
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label>Model Name</Label>
                            <div className="p-3 bg-muted rounded-md">
                                <span className="text-sm font-medium">
                                    {model.model_name}
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Model name cannot be changed after creation
                                </p>
                            </div>
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
                                <Select
                                    onValueChange={handleSystemPromptTemplate}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Use a template (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">
                                            General Search
                                        </SelectItem>
                                        <SelectItem value="ecommerce">
                                            E-commerce
                                        </SelectItem>
                                        <SelectItem value="support">
                                            Support Knowledge Base
                                        </SelectItem>
                                        <SelectItem value="content">
                                            Content Discovery
                                        </SelectItem>
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
                                            max_bytes:
                                                parseInt(e.target.value) ||
                                                16000,
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
                                            temperature:
                                                parseFloat(e.target.value) ||
                                                0.0,
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
                            {isLoading ? 'Updating...' : 'Update Model'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
