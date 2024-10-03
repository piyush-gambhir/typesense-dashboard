'use client';

import { useEffect, useState } from 'react';

import { useQueryParams } from '@/hooks/useQueryParams';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SearchComponent = () => {
  const [queryParams, setQueryParams] = useQueryParams();
  const [searchQuery, setSearchQuery] = useState(queryParams.q || '');

  // Update search input when queryParams change
  useEffect(() => {
    setSearchQuery(queryParams.q || '');
  }, [queryParams]);

  const handleSearch = () => {
    setQueryParams({ ...queryParams, q: searchQuery, page: '1' });
  };

  return (
    <div className="container mx-auto py-4">
      <h2 className="text-2xl mb-4">Search Component</h2>
      <div className="flex gap-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="flex-grow"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Display query parameters for demonstration */}
      <div className="mt-4">
        <h3 className="font-bold">Current Query Params:</h3>
        <pre>{JSON.stringify(queryParams, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SearchComponent;
