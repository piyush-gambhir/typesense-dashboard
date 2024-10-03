import typesenseClient from '@/lib/typesense/typesenseClient';

type SearchQuery = {
  collection: string; // The collection to search
  q: string; // The search query string
  query_by: string; // Fields to query by
  filter_by?: string; // Optional filters
  sort_by?: string; // Optional sort order
  per_page?: number; // Number of results per page
  num_typos?: number; // Optional typo tolerance
  facet_by?: string; // Facet fields
  highlight_full_fields?: string; // Highlight fields
  group_by?: string; // Group by field
  max_facet_values?: number; // Limit for facet values
};

// Perform a multi-search across multiple collections
export async function multiSearch(searchQueries: SearchQuery[]) {
  try {
    // Construct the multi-search request format
    const multiSearchRequests = searchQueries.map((query) => ({
      collection: query.collection,
      q: query.q,
      query_by: query.query_by,
      filter_by: query.filter_by || '',
      sort_by: query.sort_by || '',
      per_page: query.per_page || 10,
      num_typos: query.num_typos || 2,
      facet_by: query.facet_by || '',
      highlight_full_fields: query.highlight_full_fields || '',
      group_by: query.group_by || '',
      max_facet_values: query.max_facet_values || 10,
    }));

    // Perform the multi-search operation
    const response = await typesenseClient.multiSearch.perform({
      searches: multiSearchRequests,
    });

    return response;
  } catch (error) {
    console.error('Error performing multi-search:', error);
    return null;
  }
}
