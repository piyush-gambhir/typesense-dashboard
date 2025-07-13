'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Field {
    name: string;
    type: string;
    facet?: boolean;
    index?: boolean;
    optional?: boolean;
    sort?: boolean;
    store?: boolean;
}

interface SchemaFieldsTableProps {
    fields: Field[];
    onFieldChange: (index: number, key: keyof Field, value: boolean | string) => void;
}

const fieldTypes = [
    'string',
    'int32',
    'int64',
    'float',
    'bool',
    'string[]',
    'int32[]',
    'int64[]',
    'float[]',
    'bool[]',
];

export default function SchemaFieldsTable({ fields, onFieldChange }: SchemaFieldsTableProps) {
    return (
        <div className="border rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Field Name</TableHead>
                            <TableHead className="font-semibold">Data Type</TableHead>
                            <TableHead className="font-semibold text-center">Facet</TableHead>
                            <TableHead className="font-semibold text-center">Index</TableHead>
                            <TableHead className="font-semibold text-center">Optional</TableHead>
                            <TableHead className="font-semibold text-center">Sort</TableHead>
                            <TableHead className="font-semibold text-center">Store</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => {
                            const isNewField = field.name.startsWith('new_field_');

                            return (
                                <TableRow key={field.name} className="border-border/50">
                                    <TableCell className="font-medium">
                                        {isNewField ? (
                                            <Input
                                                value={field.name}
                                                onChange={(e) =>
                                                    onFieldChange(
                                                        index,
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full"
                                                placeholder="Enter field name"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {field.name}
                                                </Badge>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isNewField ? (
                                            <Select
                                                value={field.type}
                                                onValueChange={(value) =>
                                                    onFieldChange(index, 'type', value)
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fieldTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            <code className="text-xs">{type}</code>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {field.type}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={field.facet}
                                            onCheckedChange={(checked) =>
                                                onFieldChange(index, 'facet', checked)
                                            }
                                            disabled={!isNewField}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={field.index}
                                            onCheckedChange={(checked) =>
                                                onFieldChange(index, 'index', checked)
                                            }
                                            disabled={!isNewField}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={field.optional}
                                            onCheckedChange={(checked) =>
                                                onFieldChange(index, 'optional', checked)
                                            }
                                            disabled={!isNewField}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={field.sort}
                                            onCheckedChange={(checked) =>
                                                onFieldChange(index, 'sort', checked)
                                            }
                                            disabled={!isNewField}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={field.store}
                                            onCheckedChange={(checked) =>
                                                onFieldChange(index, 'store', checked)
                                            }
                                            disabled={!isNewField}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}