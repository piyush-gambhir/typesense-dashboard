'use client';

import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FacetValue {
    value: string | number | boolean;
    count: number;
}

interface FacetDebuggerProps {
    collectionSchema: {
        fields: Array<{
            name: string;
            type: string;
            facet: boolean;
        }>;
    } | null;
    facetValues: Record<string, FacetValue[]>;
    facetFields: string[];
    nonBooleanFacetFields: string[];
}

const FacetDebugger = ({
    collectionSchema,
    facetValues,
    facetFields,
    nonBooleanFacetFields,
}: FacetDebuggerProps) => {
    const intFields = facetFields.filter((field) => {
        const fieldInfo = collectionSchema?.fields?.find(
            (f) => f.name === field,
        );
        return (
            fieldInfo &&
            ['int32', 'int64', 'float', 'double'].includes(fieldInfo.type)
        );
    });

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Facet Debugger</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Collection Schema:</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(
                                collectionSchema?.fields?.filter(
                                    (f) => f.facet,
                                ),
                                null,
                                2,
                            )}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Facet Fields:</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h5 className="text-sm font-medium">
                                    All Facet Fields:
                                </h5>
                                <ul className="text-xs space-y-1">
                                    {facetFields.map((field) => {
                                        const fieldInfo =
                                            collectionSchema?.fields?.find(
                                                (f) => f.name === field,
                                            );
                                        return (
                                            <li
                                                key={field}
                                                className="flex justify-between"
                                            >
                                                <span>{field}</span>
                                                <span className="text-gray-500">
                                                    ({fieldInfo?.type})
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-sm font-medium">
                                    Non-Boolean Facet Fields:
                                </h5>
                                <ul className="text-xs space-y-1">
                                    {nonBooleanFacetFields.map((field) => {
                                        const fieldInfo =
                                            collectionSchema?.fields?.find(
                                                (f) => f.name === field,
                                            );
                                        return (
                                            <li
                                                key={field}
                                                className="flex justify-between"
                                            >
                                                <span>{field}</span>
                                                <span className="text-gray-500">
                                                    ({fieldInfo?.type})
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Int Fields:</h4>
                        <ul className="text-xs space-y-1">
                            {intFields.map((field) => {
                                const fieldInfo =
                                    collectionSchema?.fields?.find(
                                        (f) => f.name === field,
                                    );
                                return (
                                    <li
                                        key={field}
                                        className="flex justify-between"
                                    >
                                        <span>{field}</span>
                                        <span className="text-gray-500">
                                            ({fieldInfo?.type})
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Facet Values:</h4>
                        <div className="space-y-2">
                            {Object.entries(facetValues).map(
                                ([field, values]) => {
                                    const fieldInfo =
                                        collectionSchema?.fields?.find(
                                            (f) => f.name === field,
                                        );
                                    const isIntField =
                                        fieldInfo &&
                                        [
                                            'int32',
                                            'int64',
                                            'float',
                                            'double',
                                        ].includes(fieldInfo.type);

                                    return (
                                        <div
                                            key={field}
                                            className="border p-2 rounded"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-sm">
                                                    {field}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        isIntField
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {fieldInfo?.type}{' '}
                                                    {isIntField ? '(INT)' : ''}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Values: {values.length} |
                                                {values
                                                    .slice(0, 3)
                                                    .map(
                                                        (v) =>
                                                            `${v.value}(${v.count})`,
                                                    )
                                                    .join(', ')}
                                                {values.length > 3 &&
                                                    `... and ${values.length - 3} more`}
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">
                            Missing Int Fields:
                        </h4>
                        <ul className="text-xs space-y-1">
                            {intFields
                                .filter(
                                    (field) =>
                                        !facetValues[field] ||
                                        facetValues[field].length === 0,
                                )
                                .map((field) => (
                                    <li key={field} className="text-red-600">
                                        {field} - No facet values found
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FacetDebugger;
