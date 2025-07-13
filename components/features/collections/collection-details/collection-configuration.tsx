'use client';

import { Settings } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Field {
    name: string;
    type: string;
}

interface CollectionConfigurationProps {
    fields: Field[];
    defaultSortingField?: string;
    enableNestedFields?: boolean;
    onDefaultSortingFieldChange: (value: string) => void;
    onNestedFieldsChange: (checked: boolean) => void;
}

export default function CollectionConfiguration({
    fields,
    defaultSortingField,
    enableNestedFields,
    onDefaultSortingFieldChange,
    onNestedFieldsChange
}: CollectionConfigurationProps) {
    return (
        <Card className="border border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Collection Configuration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Default Sorting Field</label>
                        <Select
                            value={defaultSortingField}
                            onValueChange={onDefaultSortingFieldChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a field" />
                            </SelectTrigger>
                            <SelectContent>
                                {fields.map((field) => (
                                    <SelectItem key={field.name} value={field.name}>
                                        {field.name} ({field.type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Enable Nested Fields</label>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={enableNestedFields}
                                onCheckedChange={onNestedFieldsChange}
                            />
                            <span className="text-sm text-muted-foreground">
                                {enableNestedFields ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}