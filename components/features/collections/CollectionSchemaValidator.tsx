'use client';

import { AlertTriangle, CheckCircle, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

import { validateCollectionSchema } from '@/lib/typesense/collections';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CollectionSchemaValidatorProps {
    schema: CollectionCreateSchema;
    onValidationComplete?: (isValid: boolean) => void;
}

interface ValidationResult {
    success: boolean;
    errors: string[];
    warnings: string[];
    schema: CollectionCreateSchema;
}

export default function CollectionSchemaValidator({
    schema,
    onValidationComplete,
}: CollectionSchemaValidatorProps) {
    const [validationResult, setValidationResult] =
        useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const handleValidate = async () => {
        setIsValidating(true);
        try {
            const result = await validateCollectionSchema(schema);
            setValidationResult(result);
            onValidationComplete?.(result.success);
        } catch (error) {
            console.error('Validation error:', error);
            setValidationResult({
                success: false,
                errors: ['Validation failed due to an unexpected error'],
                warnings: [],
                schema,
            });
            onValidationComplete?.(false);
        } finally {
            setIsValidating(false);
        }
    };

    const getValidationIcon = () => {
        if (!validationResult) return null;

        if (validationResult.success) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        } else {
            return <XCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getValidationStatus = () => {
        if (!validationResult) return 'Not validated';

        if (validationResult.success) {
            return 'Valid';
        } else {
            return 'Invalid';
        }
    };

    const getValidationColor = () => {
        if (!validationResult) return 'text-muted-foreground';

        if (validationResult.success) {
            return 'text-green-600';
        } else {
            return 'text-red-600';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Schema Validation</span>
                </CardTitle>
                <CardDescription>
                    Validate your collection schema before creation
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {getValidationIcon()}
                        <span className={`font-medium ${getValidationColor()}`}>
                            {getValidationStatus()}
                        </span>
                    </div>
                    <Button
                        onClick={handleValidate}
                        disabled={isValidating}
                        variant="outline"
                        size="sm"
                    >
                        {isValidating ? 'Validating...' : 'Validate Schema'}
                    </Button>
                </div>

                {validationResult && (
                    <div className="space-y-4">
                        {/* Errors */}
                        {validationResult.errors.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="font-medium text-red-600">
                                        Errors ({validationResult.errors.length}
                                        )
                                    </span>
                                </div>
                                <ScrollArea className="h-32 w-full rounded-md border p-3">
                                    <div className="space-y-1">
                                        {validationResult.errors.map(
                                            (error, index) => (
                                                <div
                                                    key={index}
                                                    className="text-sm text-red-600 flex items-start space-x-2"
                                                >
                                                    <span className="text-red-500">
                                                        •
                                                    </span>
                                                    <span>{error}</span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        {/* Warnings */}
                        {validationResult.warnings.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <span className="font-medium text-yellow-600">
                                        Warnings (
                                        {validationResult.warnings.length})
                                    </span>
                                </div>
                                <ScrollArea className="h-32 w-full rounded-md border p-3">
                                    <div className="space-y-1">
                                        {validationResult.warnings.map(
                                            (warning, index) => (
                                                <div
                                                    key={index}
                                                    className="text-sm text-yellow-600 flex items-start space-x-2"
                                                >
                                                    <span className="text-yellow-500">
                                                        •
                                                    </span>
                                                    <span>{warning}</span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        {/* Success Message */}
                        {validationResult.success &&
                            validationResult.errors.length === 0 && (
                                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md border border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-700">
                                        Schema is valid and ready for collection
                                        creation
                                    </span>
                                </div>
                            )}

                        <Separator />

                        {/* Schema Summary */}
                        <div className="space-y-2">
                            <h4 className="font-medium">Schema Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        Collection Name:
                                    </span>
                                    <span className="ml-2 font-medium">
                                        {schema.name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Fields:
                                    </span>
                                    <span className="ml-2 font-medium">
                                        {schema.fields?.length || 0}
                                    </span>
                                </div>
                                {schema.default_sorting_field && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            Default Sorting:
                                        </span>
                                        <span className="ml-2 font-medium">
                                            {schema.default_sorting_field}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground">
                                        Nested Fields:
                                    </span>
                                    <span className="ml-2 font-medium">
                                        {schema.enable_nested_fields
                                            ? 'Enabled'
                                            : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
