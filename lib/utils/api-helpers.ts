import { toast } from '@/hooks/use-toast';

// Standard API response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Error handling utilities
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Standardized error handler
export function handleApiError(error: unknown, context?: string): ApiResponse {
    console.error(context ? `[${context}]` : '[API Error]', error);

    let message = 'An unexpected error occurred';
    let status: number | undefined;
    let code: string | undefined;

    if (error instanceof ApiError) {
        message = error.message;
        status = error.status;
        code = error.code;
    } else if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }

    return {
        success: false,
        error: message,
    };
}

// Toast helpers for consistent notifications
export const apiToast = {
    success: (message: string, description?: string) => {
        toast({
            title: message,
            description,
        });
    },

    error: (message: string, description?: string) => {
        toast({
            title: message,
            description,
            variant: 'destructive',
        });
    },

    loading: (message: string) => {
        toast({
            title: message,
            description: 'Please wait...',
        });
    },

    promise: <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        },
    ) => {
        toast({
            title: messages.loading,
            description: 'Please wait...',
        });

        return promise
            .then((result) => {
                toast({
                    title: messages.success,
                });
                return result;
            })
            .catch((error) => {
                toast({
                    title: messages.error,
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Operation failed',
                    variant: 'destructive',
                });
                throw error;
            });
    },
};

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string,
): Promise<ApiResponse<T>> {
    try {
        const data = await operation();
        return {
            success: true,
            data,
        };
    } catch (error) {
        return handleApiError(error, context);
    }
}

// Form submission helper
export async function handleFormSubmission<T extends Record<string, any>>(
    data: T,
    submitFn: (data: T) => Promise<any>,
    options: {
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: () => void;
        onError?: (error: string) => void;
    } = {},
) {
    try {
        const result = await submitFn(data);

        if (result?.success !== false) {
            apiToast.success(
                options.successMessage || 'Operation completed successfully',
            );
            options.onSuccess?.();
            return { success: true, data: result };
        } else {
            throw new Error(result.error || 'Operation failed');
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Operation failed';
        apiToast.error(
            options.errorMessage || 'Operation failed',
            errorMessage,
        );
        options.onError?.(errorMessage);
        return { success: false, error: errorMessage };
    }
}

// Collection operation helpers
export const collectionHelpers = {
    async create(data: any, onSuccess?: () => void) {
        return handleFormSubmission(
            data,
            async (formData) => {
                const { createCollection } = await import(
                    '@/lib/typesense/collections'
                );
                return createCollection(formData);
            },
            {
                successMessage: 'Collection created successfully',
                errorMessage: 'Failed to create collection',
                onSuccess,
            },
        );
    },

    async update(name: string, data: any, onSuccess?: () => void) {
        return handleFormSubmission(
            data,
            async (formData) => {
                const { updateCollection } = await import(
                    '@/lib/typesense/collections'
                );
                return updateCollection(name, formData);
            },
            {
                successMessage: 'Collection updated successfully',
                errorMessage: 'Failed to update collection',
                onSuccess,
            },
        );
    },

    async delete(name: string, onSuccess?: () => void) {
        return withErrorHandling(async () => {
            const { deleteCollection } = await import(
                '@/lib/typesense/collections'
            );
            const result = await deleteCollection(name);

            if (result) {
                apiToast.success('Collection deleted successfully');
                onSuccess?.();
            } else {
                throw new Error('Failed to delete collection');
            }

            return result;
        }, 'Collection deletion');
    },
};

// Document operation helpers
export const documentHelpers = {
    async create(collectionName: string, data: any, onSuccess?: () => void) {
        return handleFormSubmission(
            data,
            async (formData) => {
                const { createDocument } = await import(
                    '@/lib/typesense/documents'
                );
                return createDocument(collectionName, formData);
            },
            {
                successMessage: 'Document created successfully',
                errorMessage: 'Failed to create document',
                onSuccess,
            },
        );
    },

    async update(
        collectionName: string,
        documentId: string,
        data: any,
        onSuccess?: () => void,
    ) {
        return handleFormSubmission(
            data,
            async (formData) => {
                const { updateDocument } = await import(
                    '@/lib/typesense/documents'
                );
                return updateDocument(collectionName, documentId, formData);
            },
            {
                successMessage: 'Document updated successfully',
                errorMessage: 'Failed to update document',
                onSuccess,
            },
        );
    },

    async delete(
        collectionName: string,
        documentId: string,
        onSuccess?: () => void,
    ) {
        return withErrorHandling(async () => {
            const { deleteDocument } = await import(
                '@/lib/typesense/documents'
            );
            const result = await deleteDocument(collectionName, documentId);

            if (result) {
                apiToast.success('Document deleted successfully');
                onSuccess?.();
            } else {
                throw new Error('Failed to delete document');
            }

            return result;
        }, 'Document deletion');
    },
};

// Generic data fetching with error handling
export async function fetchWithErrorHandling<T>(
    fetchFn: () => Promise<T>,
    fallback?: T,
    context?: string,
): Promise<T | null> {
    try {
        return await fetchFn();
    } catch (error) {
        console.error(context ? `[${context}]` : '[Fetch Error]', error);

        if (fallback !== undefined) {
            return fallback;
        }

        // Show error toast for failed fetches
        apiToast.error(
            'Failed to load data',
            error instanceof Error ? error.message : 'Please try again',
        );

        return null;
    }
}
