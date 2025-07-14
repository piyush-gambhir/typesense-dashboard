'use client';

import { Edit, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { GlobalOverride } from '@/hooks/presets/use-global-search-overrides';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface GlobalPresetsListProps {
    overrides: GlobalOverride[];
    collections: string[];
    loading: boolean;
    onEdit: (override: GlobalOverride) => void;
    onDelete: (override: GlobalOverride) => void;
}

export default function GlobalPresetsList({
    overrides,
    collections,
    loading,
    onEdit,
    onDelete,
}: GlobalPresetsListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState<string>('all');

    // Filter overrides based on search term and collection
    const filteredOverrides = overrides.filter((override) => {
        const matchesSearch =
            !searchTerm.trim() ||
            override.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            override.rule.query
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            override.collection_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesCollection =
            selectedCollection === 'all' ||
            override.collection_name === selectedCollection;

        return matchesSearch && matchesCollection;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search presets by ID, query, or collection..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={selectedCollection}
                    onValueChange={setSelectedCollection}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by collection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Collections</SelectItem>
                        {collections.map((collection) => (
                            <SelectItem key={collection} value={collection}>
                                {collection}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Collection</TableHead>
                            <TableHead>Query</TableHead>
                            <TableHead>Match Type</TableHead>
                            <TableHead>Applies To</TableHead>
                            <TableHead>Includes</TableHead>
                            <TableHead>Excludes</TableHead>
                            <TableHead>Stop Words</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOverrides.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="text-center py-12"
                                >
                                    {searchTerm.trim() ||
                                    selectedCollection !== 'all' ? (
                                        <div className="text-muted-foreground">
                                            No presets found matching your
                                            filters.
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground">
                                            No search presets found. Create your
                                            first preset to get started.
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOverrides.map((override) => (
                                <TableRow
                                    key={`${override.collection_name}-${override.id}`}
                                >
                                    <TableCell className="font-medium">
                                        {override.id}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {override.collection_name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <code className="rounded bg-muted px-2 py-1 text-sm">
                                            {override.rule.query}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                override.rule.match === 'exact'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {override.rule.match || 'contains'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                override.applies_to === 'always'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {override.applies_to}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {Array.isArray(
                                            override.force_include,
                                        ) &&
                                        override.force_include.length > 0 ? (
                                            <Badge variant="outline">
                                                {override.force_include.length}{' '}
                                                document
                                                {override.force_include
                                                    .length !== 1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                None
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {Array.isArray(
                                            override.force_exclude,
                                        ) &&
                                        override.force_exclude.length > 0 ? (
                                            <Badge variant="outline">
                                                {override.force_exclude.length}{' '}
                                                document
                                                {override.force_exclude
                                                    .length !== 1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                None
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {Array.isArray(override.stop_words) &&
                                        override.stop_words.length > 0 ? (
                                            <Badge variant="outline">
                                                {override.stop_words.length}{' '}
                                                word
                                                {override.stop_words.length !==
                                                1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                None
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(override)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    onDelete(override)
                                                }
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
