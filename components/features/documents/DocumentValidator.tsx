'use client';

import { AlertCircle, CheckCircle, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';

import { validateDocument } from '@/lib/typesense/documents';

import { toast } from '@/hooks/useToast';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DocumentValidatorProps {
    collectionName: string;
}

interface ValidationResult {
    success: boolean;
    isValid: boolean;
    errors: string[];
    fieldCount: number;
    documentFieldCount: number;
}

export default function DocumentValidator({
    collectionName,
}: Readonly<DocumentValidatorProps>) {
    const [documentJson, setDocumentJson] = useState<string>('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] =
        useState<ValidationResult | null>(null);

    const handleValidation = async () => {
        if (!documentJson.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a document to validate',
                variant: 'destructive',
            });
            return;
        }

        setIsValidating(true);
        setValidationResult(null);

        try {
            let document: Record<string, unknown>;
            try {
                document = JSON.parse(documentJson);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Invalid JSON format',
                    variant: 'destructive',
                });
                return;
            }

            const result = await validateDocument(collectionName, document);

            if (result.success) {
                setValidationResult(result as ValidationResult);

                if (result.isValid) {
                    toast({
                        title: 'Success',
                        description:
                            'Document is valid for the collection schema',
                    });
                } else {
                    toast({
                        title: 'Validation Failed',
                        description: `Document has ${(result as ValidationResult).errors.length} validation errors`,
                        variant: 'destructive',
                    });
                }
            } else {
                toast({
                    title: 'Validation Error',
                    description: result.error || 'Validation failed',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.message || 'Validation failed',
                variant: 'destructive',
            });
        } finally {
            setIsValidating(false);
        }
    };

    const clearValidation = () => {
        setDocumentJson('');
        setValidationResult(null);
    };

    const getSampleDocument = () => {
        const sample = {
            id: 'sample-document-id',
            title: 'Sample Document Title',
            content: 'This is a sample document content',
            tags: ['sample', 'example'],
            rating: 4.5,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        setDocumentJson(JSON.stringify(sample, null, 2));
    };

    return (
        <div className="container mx-auto p-8">
            <Card className="shadow-none border-none">
                <CardHeader>
                    <CardTitle>Document Validator</CardTitle>
                    <CardDescription>
                        Validate documents against the {collectionName}{' '}
                        collection schema
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="document-json">Document JSON</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={getSampleDocument}
                                disabled={isValidating}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Load Sample
                            </Button>
                        </div>
                        <Textarea
                            id="document-json"
                            placeholder="Enter document as JSON..."
                            value={documentJson}
                            onChange={(e) => setDocumentJson(e.target.value)}
                            disabled={isValidating}
                            rows={12}
                            className="font-mono text-sm"
                        />
                    </div>

                    {validationResult && (
                        <div className="space-y-4">
                            {/* Validation Summary */}
                            <Alert
                                className={
                                    validationResult.isValid
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-red-200 bg-red-50'
                                }
                            >
                                <div className="flex items-center space-x-2">
                                    {validationResult.isValid ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <AlertDescription
                                        className={
                                            validationResult.isValid
                                                ? 'text-green-800'
                                                : 'text-red-800'
                                        }
                                    >
                                        <strong>
                                            {validationResult.isValid
                                                ? 'Document is Valid'
                                                : 'Document is Invalid'}
                                        </strong>
                                        {validationResult.isValid
                                            ? ' - Document conforms to the collection schema'
                                            : ` - Found ${validationResult.errors.length} validation errors`}
                                    </AlertDescription>
                                </div>
                            </Alert>

                            {/* Field Counts */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground">
                                        Schema Fields
                                    </h4>
                                    <p className="text-2xl font-bold">
                                        {validationResult.fieldCount}
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground">
                                        Document Fields
                                    </h4>
                                    <p className="text-2xl font-bold">
                                        {validationResult.documentFieldCount}
                                    </p>
                                </div>
                            </div>

                            {/* Validation Errors */}
                            {!validationResult.isValid &&
                                validationResult.errors.length > 0 && (
                                    <div className="border rounded-lg p-4 bg-red-50">
                                        <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Validation Errors (
                                            {validationResult.errors.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {validationResult.errors.map(
                                                (error, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start space-x-2"
                                                    >
                                                        <Badge
                                                            variant="destructive"
                                                            className="mt-0.5"
                                                        >
                                                            Error {index + 1}
                                                        </Badge>
                                                        <span className="text-sm text-red-700">
                                                            {error}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Validation Success Details */}
                            {validationResult.isValid && (
                                <div className="border rounded-lg p-4 bg-green-50">
                                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Validation Details
                                    </h4>
                                    <div className="text-sm text-green-700 space-y-1">
                                        <p>✓ All required fields are present</p>
                                        <p>✓ Field types match the schema</p>
                                        <p>✓ Document structure is valid</p>
                                        <p>
                                            ✓ Ready for import into collection
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-4">
                    <Button
                        onClick={handleValidation}
                        disabled={isValidating || !documentJson.trim()}
                    >
                        {isValidating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Validating...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Validate Document
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={clearValidation}
                        variant="outline"
                        disabled={isValidating}
                    >
                        Clear
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
