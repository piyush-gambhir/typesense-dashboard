'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import useQueryParams from '@/hooks/useQueryParams';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SearchComponent = () => {
  const { queryParams, setQueryParams } = useQueryParams();
  const [searchQuery, setSearchQuery] = useState(
    Array.isArray(queryParams.q) ? queryParams.q[0] || '' : queryParams.q || ''
  );

  // Update search input when queryParams change
  useEffect(() => {
    const newQuery = Array.isArray(queryParams.q) ? queryParams.q[0] || '' : queryParams.q || '';
    setSearchQuery(newQuery);
  }, [queryParams.q]);

  const handleSearch = () => {
    const newParams = { ...queryParams };
    if (searchQuery) {
      newParams.q = searchQuery;
    } else {
      delete newParams.q;
    }
    newParams.page = '1';
    setQueryParams(newParams);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h2 className="text-2xl mb-4">Search Component</h2>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Display query parameters for demonstration */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Current Query Params:</h3>
        <pre className="text-sm overflow-auto">{JSON.stringify(queryParams, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SearchComponent;
