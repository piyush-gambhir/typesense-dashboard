import typesenseClient from '@/lib/typesense/typesenseClient';

type SearchQuery = {
  collection: string;
  q: string;
  queryBy: string;
  filterBy?: string;
  sortBy?: string;
  perPage?: number;
  page?: number;
  exhaustiveSearch?: boolean;
  facetBy?: string;
  highlightFullFields?: string;
  groupBy?: string;
  maxFacetValues?: number;
  facetQuery?: string;
};

export async function multiSearch({
  searchQueries,
}: {
  searchQueries: SearchQuery[];
}) {
  console.log('Search Queries', searchQueries);
  try {
    const multiSearchRequests = searchQueries.map((query) => ({
      collection: query.collection,
      q: query.q,
      query_by: query.queryBy,
      filter_by: query.filterBy ?? '',
      sort_by: query.sortBy ?? '',
      facet_by: query.facetBy ?? '',
      facet_query: query.facetQuery ?? '',
      highlight_full_fields: query.highlightFullFields ?? '',
      max_facet_values: query.maxFacetValues ?? 10,
      per_page: query.perPage ?? 10,
      page: query.page ?? 1,
      exhaustive_search: query.exhaustiveSearch ?? true,
    }));

    const response = await typesenseClient?.multiSearch?.perform({
      searches: multiSearchRequests,
    });

    return response ?? null;
  } catch (error) {
    console.error('Error performing multi-search:', error);
    return null;
  }
}

