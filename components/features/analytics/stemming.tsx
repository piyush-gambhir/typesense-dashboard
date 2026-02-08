'use client';

import { BookOpen, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    getStemmingDictionary,
    importStemmingDictionary,
    listStemmingDictionaries,
    StemmingWord,
} from '@/lib/typesense/stemming';

import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
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
import { LoadingSpinner } from '@/components/ui/loading';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface DictionaryEntry {
    id: string;
    words?: StemmingWord[];
}

export default function Stemming() {
    const [dictionaries, setDictionaries] = useState<DictionaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newDictionaryId, setNewDictionaryId] = useState('');
    const [newWords, setNewWords] = useState('');
    const [expandedDictionary, setExpandedDictionary] = useState<string | null>(
        null,
    );
    const [expandedWords, setExpandedWords] = useState<StemmingWord[]>([]);
    const [isLoadingWords, setIsLoadingWords] = useState(false);

    const fetchDictionaries = async () => {
        setIsLoading(true);
        try {
            const result = await listStemmingDictionaries();
            if (result.success) {
                setDictionaries(result.data);
            } else {
                toast({
                    title: 'Error',
                    description:
                        result.error || 'Failed to load stemming dictionaries.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load stemming dictionaries.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDictionaries();
    }, []);

    const handleExpand = async (dictionaryId: string) => {
        if (expandedDictionary === dictionaryId) {
            setExpandedDictionary(null);
            setExpandedWords([]);
            return;
        }
        setExpandedDictionary(dictionaryId);
        setIsLoadingWords(true);
        try {
            const result = await getStemmingDictionary(dictionaryId);
            if (result.success && result.data) {
                setExpandedWords(result.data.words || []);
            } else {
                toast({
                    title: 'Error',
                    description:
                        result.error || 'Failed to load dictionary words.',
                    variant: 'destructive',
                });
                setExpandedWords([]);
            }
        } catch {
            setExpandedWords([]);
        } finally {
            setIsLoadingWords(false);
        }
    };

    const handleCreate = async () => {
        if (!newDictionaryId.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please provide a dictionary ID.',
                variant: 'destructive',
            });
            return;
        }

        // Parse words: expect "word:root" per line
        const lines = newWords
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l);

        const words: StemmingWord[] = [];
        for (const line of lines) {
            const parts = line.split(':').map((p) => p.trim());
            if (parts.length === 2 && parts[0] && parts[1]) {
                words.push({ word: parts[0], root: parts[1] });
            } else {
                toast({
                    title: 'Validation Error',
                    description: `Invalid format on line: "${line}". Expected "word:root".`,
                    variant: 'destructive',
                });
                return;
            }
        }

        if (words.length === 0) {
            toast({
                title: 'Validation Error',
                description:
                    'Please provide at least one word mapping (word:root).',
                variant: 'destructive',
            });
            return;
        }

        setIsCreating(true);
        try {
            const result = await importStemmingDictionary(
                newDictionaryId,
                words,
            );
            if (result.success) {
                toast({
                    title: 'Dictionary Created',
                    description: `Stemming dictionary "${newDictionaryId}" imported successfully.`,
                });
                setNewDictionaryId('');
                setNewWords('');
                setIsCreateOpen(false);
                fetchDictionaries();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to import dictionary.',
                    variant: 'destructive',
                });
            }
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to import dictionary.',
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Stemming Dictionaries
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage custom stemming dictionaries to map words to
                        their root forms.
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Import Dictionary
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Import Stemming Dictionary
                            </DialogTitle>
                            <DialogDescription>
                                Create or replace a stemming dictionary with
                                word-to-root mappings.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="dictionary-id">
                                    Dictionary ID
                                </Label>
                                <Input
                                    id="dictionary-id"
                                    placeholder="e.g. english-stems"
                                    value={newDictionaryId}
                                    onChange={(e) =>
                                        setNewDictionaryId(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="words">
                                    Word Mappings (one per line, format:
                                    word:root)
                                </Label>
                                <Textarea
                                    id="words"
                                    placeholder={`running:run\nswimming:swim\njumped:jump`}
                                    value={newWords}
                                    onChange={(e) =>
                                        setNewWords(e.target.value)
                                    }
                                    rows={8}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isCreating}
                            >
                                {isCreating ? 'Importing...' : 'Import'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {dictionaries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                        No stemming dictionaries found.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Import a dictionary to get started.
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dictionary ID</TableHead>
                                <TableHead className="w-[100px] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dictionaries.map((dict) => (
                                <>
                                    <TableRow
                                        key={dict.id}
                                        className="cursor-pointer"
                                        onClick={() => handleExpand(dict.id)}
                                    >
                                        <TableCell className="font-mono text-sm">
                                            {dict.id}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExpand(dict.id);
                                                }}
                                            >
                                                {expandedDictionary === dict.id
                                                    ? 'Collapse'
                                                    : 'View'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    {expandedDictionary === dict.id && (
                                        <TableRow key={`${dict.id}-expanded`}>
                                            <TableCell
                                                colSpan={2}
                                                className="bg-muted/30 p-4"
                                            >
                                                {isLoadingWords ? (
                                                    <div className="flex justify-center py-4">
                                                        <LoadingSpinner />
                                                    </div>
                                                ) : expandedWords.length ===
                                                  0 ? (
                                                    <p className="text-sm text-muted-foreground text-center py-2">
                                                        No word mappings found.
                                                    </p>
                                                ) : (
                                                    <div className="max-h-64 overflow-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>
                                                                        Word
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Root
                                                                    </TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {expandedWords.map(
                                                                    (w, i) => (
                                                                        <TableRow
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            <TableCell className="font-mono text-sm">
                                                                                {
                                                                                    w.word
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell className="font-mono text-sm">
                                                                                {
                                                                                    w.root
                                                                                }
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ),
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
