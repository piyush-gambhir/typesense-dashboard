// components/PaginationComponent.tsx
import React, { useMemo } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const paginationRange = useMemo(() => {
    const totalPagesToShow = 5; // Number of pagination items to show
    if (totalPages <= totalPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPages = [1, 2]; // First pages to always show
    const endPages = [totalPages - 1, totalPages]; // Last pages to always show
    const middleRange = [];

    if (currentPage > 2 && currentPage < totalPages - 1) {
      middleRange.push(currentPage - 1, currentPage, currentPage + 1);
    } else if (currentPage === 2) {
      middleRange.push(currentPage, currentPage + 1);
    } else if (currentPage === totalPages - 1) {
      middleRange.push(currentPage - 1, currentPage);
    }

    return [
      ...startPages,
      currentPage > 3 ? '...' : null,
      ...middleRange,
      currentPage < totalPages - 2 ? '...' : null,
      ...endPages,
    ].filter(Boolean); // Remove null values
  }, [currentPage, totalPages]);

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          />
        </PaginationItem>
        {paginationRange.map((item, index) => (
          <PaginationItem key={index}>
            {typeof item === 'number' ? (
              <PaginationLink
                href="#"
                onClick={() => onPageChange(item)}
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
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
