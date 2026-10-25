import { beforeEach, describe, expect, it, vi } from 'vitest';

const { retrieve, update } = vi.hoisted(() => ({
    retrieve: vi.fn(),
    update: vi.fn(),
}));

vi.mock('@/lib/typesense/typesense-client', () => ({
    getTypesenseClient: () => ({ collections: () => ({ retrieve, update }) }),
}));

import { updateCollection } from '@/lib/typesense/collections';

const existing = {
    name: 'books',
    fields: [{ name: 'title', type: 'string' }],
    default_sorting_field: '',
    enable_nested_fields: false,
    num_documents: 1,
};

beforeEach(() => {
    vi.clearAllMocks();
    retrieve.mockResolvedValue(existing);
    update.mockResolvedValue({ fields: [{ name: 'author', type: 'string' }] });
});

describe('collection schema update API contract', () => {
    it('adds a field without sending creation-only collection options', async () => {
        const added = { name: 'author', type: 'string', optional: true };
        expect(await updateCollection('books', {
            ...existing,
            fields: [...existing.fields, added],
        })).not.toBeNull();
        expect(update).toHaveBeenCalledWith({ fields: [added] });
    });

    it('does not send an empty patch when the schema is unchanged', async () => {
        expect(await updateCollection('books', existing)).toEqual(existing);
        expect(update).not.toHaveBeenCalled();
    });

    it.each([
        { default_sorting_field: 'score' },
        { enable_nested_fields: true },
    ])('rejects changes to creation-only options: %j', async (change) => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            expect(await updateCollection('books', { ...existing, ...change })).toBeNull();
            expect(update).not.toHaveBeenCalled();
        } finally {
            error.mockRestore();
        }
    });
});
