import React from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchControlsProps {
  perPage: number;
  sortBy: string;
  setPerPage: (value: number) => void;
  setSortBy: (value: string) => void;
  sortDropdownOptions: { label: string; value: string }[];
  countDropdownOptions: { label: string; value: number }[];
  totalResults: number;
  paginationRange: (number | string)[];
  currentPage: number;
  setCurrentPage: (value: number) => void;
}

const SearchControls: React.FC<SearchControlsProps> = ({
  perPage,
  sortBy,
  setPerPage,
  setSortBy,
  sortDropdownOptions,
  countDropdownOptions,
  totalResults,
  paginationRange,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <div>
      <div className="flex justify-end items-center mb-4 gap-x-4">
        <Select
          value={perPage.toString()}
          onValueChange={(value) => setPerPage(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue>Results per page</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countDropdownOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>Sort by</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortDropdownOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <p>{totalResults} results found</p>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              />
            </PaginationItem>
            {paginationRange.map((item, index) => (
              <PaginationItem key={index}>
                {typeof item === 'number' ? (
                  <PaginationLink
                    href="#"
                    onClick={() => setCurrentPage(item)}
                    isActive={currentPage === item}
                  >
                    {item}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default SearchControls;
