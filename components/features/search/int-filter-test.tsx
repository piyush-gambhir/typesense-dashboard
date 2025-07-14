'use client';

import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FacetValue {
    value: string | number | boolean;
    count: number;
}

interface TestField {
    name: string;
    type: string;
    facet: boolean;
}

const IntFilterTest = () => {
    // Simulate test data
    const testCollectionSchema = {
        fields: [
            { name: 'age', type: 'int32', facet: true },
            { name: 'price', type: 'float', facet: true },
            { name: 'is_active', type: 'bool', facet: true },
            { name: 'category', type: 'string', facet: true },
        ] as TestField[],
    };

    const testFacetValues: Record<string, FacetValue[]> = {
        age: [
            { value: 25, count: 10 },
            { value: 30, count: 15 },
            { value: 35, count: 8 },
        ],
        price: [
            { value: 100.5, count: 5 },
            { value: 200.75, count: 12 },
            { value: 300.25, count: 7 },
        ],
        is_active: [
            { value: true, count: 20 },
            { value: false, count: 5 },
        ],
        category: [
            { value: 'electronics', count: 15 },
            { value: 'books', count: 10 },
        ],
    };

    const testFilterBy: Record<string, (string | number | boolean)[]> = {};

    const getFieldType = (field: string): string => {
        const schemaField = testCollectionSchema.fields.find(
            (f) => f.name === field && f.facet,
        );
        if (!schemaField) return 'string';
        return schemaField.type;
    };

    const renderNumberFilter = (field: string, values: FacetValue[]) => {
        console.log(`[IntFilterTest] renderNumberFilter called for ${field}:`, {
            values,
            fieldType: getFieldType(field),
        });

        if (values.length === 0) {
            console.log(`[IntFilterTest] No values for ${field}`);
            return <div>No values available</div>;
        }

        return (
            <div className="space-y-2">
                <h4 className="text-sm font-medium">{field} (Number Filter)</h4>
                <div className="space-y-1">
                    {values.map((facet, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-2"
                        >
                            <input type="checkbox" id={`${field}-${index}`} />
                            <label
                                htmlFor={`${field}-${index}`}
                                className="text-sm"
                            >
                                {String(facet.value)} ({facet.count})
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderBooleanFilter = (field: string) => {
        return (
            <div className="space-y-2">
                <h4 className="text-sm font-medium">
                    {field} (Boolean Filter)
                </h4>
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id={`${field}-true`} />
                        <label htmlFor={`${field}-true`} className="text-sm">
                            True
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id={`${field}-false`} />
                        <label htmlFor={`${field}-false`} className="text-sm">
                            False
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    const renderMultiSelectFilter = (field: string, values: FacetValue[]) => {
        return (
            <div className="space-y-2">
                <h4 className="text-sm font-medium">
                    {field} (Multi-Select Filter)
                </h4>
                <div className="space-y-1">
                    {values.map((facet, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-2"
                        >
                            <input type="checkbox" id={`${field}-${index}`} />
                            <label
                                htmlFor={`${field}-${index}`}
                                className="text-sm"
                            >
                                {String(facet.value)} ({facet.count})
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Int Filter Test Component</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Test Data:</h3>
                        <pre className="text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(
                                { testCollectionSchema, testFacetValues },
                                null,
                                2,
                            )}
                        </pre>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">
                            Rendered Filters:
                        </h3>
                        <div className="grid gap-4">
                            {Object.entries(testFacetValues).map(
                                ([field, values]) => {
                                    const fieldType = getFieldType(field);
                                    console.log(
                                        `[IntFilterTest] Rendering field: ${field}`,
                                        {
                                            fieldType,
                                            valuesCount: values.length,
                                            isIntField: [
                                                'float',
                                                'int32',
                                                'int64',
                                                'double',
                                            ].includes(fieldType),
                                        },
                                    );

                                    return (
                                        <div
                                            key={field}
                                            className="border p-3 rounded"
                                        >
                                            <h4 className="font-medium mb-2">
                                                Field: {field} (Type:{' '}
                                                {fieldType})
                                            </h4>
                                            {fieldType === 'bool' &&
                                                renderBooleanFilter(field)}
                                            {[
                                                'float',
                                                'int32',
                                                'int64',
                                                'double',
                                            ].includes(fieldType) &&
                                                renderNumberFilter(
                                                    field,
                                                    values,
                                                )}
                                            {(fieldType === 'string' ||
                                                fieldType === 'string[]') &&
                                                renderMultiSelectFilter(
                                                    field,
                                                    values,
                                                )}
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default IntFilterTest;
