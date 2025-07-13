'use client';

import { FileText, Hash, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getCollection } from '@/lib/typesense/collections';
import { getDocumentSuggestions } from '@/lib/typesense/documents';

import { toast } from '@/hooks/use-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DocumentSuggestionsProps {
    collectionName: string;
}

export default function DocumentSuggestions({
    collectionName,
}: Readonly<DocumentSuggestionsProps>) {
    const [collectionFields, setCollectionFields] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<string>('');
    const [query, setQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [limit, setLimit] = useState<number>(10);

    useEffect(() => {
        loadCollectionFields();
    }, [collectionName]);

    const loadCollectionFields = async () => {
        try {
            const collectionResult = await getCollection(collectionName);
            if (collectionResult?.success && collectionResult.data) {
                const fields = collectionResult.data.fields || [];
                setCollectionFields(fields);
                if (fields.length > 0) {
                    setSelectedField(fields[0].name);
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load collection fields',
                variant: 'destructive',
            });
        }
    };

    const getSuggestions = async () => {
        if (!selectedField || !query.trim()) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const result = await getDocumentSuggestions(
                collectionName,
                query,
                selectedField,
                limit,
            );

            if (result?.success && result.data) {
                setSuggestions(result.data);
            } else {
                toast({
                    title: 'Error',
                    description: result?.error || 'Failed to get suggestions',
                    variant: 'destructive',
                });
                setSuggestions([]);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to get suggestions',
                variant: 'destructive',
            });
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
        if (value.trim() && selectedField) {
            // Debounce the search
            const timeoutId = setTimeout(() => {
                getSuggestions();
            }, 300);

            return () => clearTimeout(timeoutId);
        } else {
            setSuggestions([]);
        }
    };

    const handleFieldChange = (fieldName: string) => {
        setSelectedField(fieldName);
        setSuggestions([]);
        if (query.trim()) {
            getSuggestions();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied',
            description: 'Suggestion copied to clipboard',
        });
    };

    const getFieldTypeIcon = (fieldType: string) => {
        switch (fieldType) {
            case 'string':
                return <FileText className="h-3 w-3" />;
            case 'int32':
            case 'int64':
            case 'float':
                return <Hash className="h-3 w-3" />;
            default:
                return <FileText className="h-3 w-3" />;
        }
    };

    return (
        <div className="container mx-auto p-8">
            <Card className="shadow-none border-none">
                <CardHeader>
                    <CardTitle>Document Suggestions</CardTitle>
                    <CardDescription>
                        Get autocomplete suggestions for field values in the{' '}
                        {collectionName} collection
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Field Selection */}
                    <div className="flex flex-col space-y-3">
                        <Label htmlFor="field-select">Select Field</Label>
                        <Select
                            value={selectedField}
                            onValueChange={handleFieldChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a field" />
                            </SelectTrigger>
                            <SelectContent>
                                {collectionFields.map((field) => (
                                    <SelectItem
                                        key={field.name}
                                        value={field.name}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {getFieldTypeIcon(field.type)}
                                            <span>{field.name}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {field.type}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Query Input */}
                    <div className="flex flex-col space-y-3">
                        <Label htmlFor="query-input">Search Query</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="query-input"
                                placeholder="Type to get suggestions..."
                                value={query}
                                onChange={(e) =>
                                    handleQueryChange(e.target.value)
                                }
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Limit Selection */}
                    <div className="flex flex-col space-y-3">
                        <Label htmlFor="limit-select">Results Limit</Label>
                        <Select
                            value={limit.toString()}
                            onValueChange={(value) => setLimit(parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 suggestions</SelectItem>
                                <SelectItem value="10">
                                    10 suggestions
                                </SelectItem>
                                <SelectItem value="20">
                                    20 suggestions
                                </SelectItem>
                                <SelectItem value="50">
                                    50 suggestions
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2 text-sm text-muted-foreground">
                                Getting suggestions...
                            </span>
                        </div>
                    )}

                    {/* Suggestions Results */}
                    {!isLoading && suggestions.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold">
                                    Suggestions ({suggestions.length})
                                </h4>
                                <Badge variant="secondary">
                                    Field: {selectedField}
                                </Badge>
                            </div>

                            <div className="grid gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="font-mono text-sm flex-1">
                                            {suggestion || '(empty value)'}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                copyToClipboard(suggestion)
                                            }
                                            className="ml-2"
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {!isLoading && query.trim() && suggestions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No suggestions found for "{query}"</p>
                            <p className="text-sm">
                                Try a different query or field
                            </p>
                        </div>
                    )}

                    {/* Instructions */}
                    {!query.trim() && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>
                                Select a field and start typing to get
                                suggestions
                            </p>
                            <p className="text-sm">
                                Suggestions are based on existing values in the
                                collection
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                        {selectedField && (
                            <span>
                                Searching in: <strong>{selectedField}</strong>
                            </span>
                        )}
                    </div>

                    <Button
                        onClick={getSuggestions}
                        disabled={!selectedField || !query.trim() || isLoading}
                        variant="outline"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Refresh Suggestions
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
