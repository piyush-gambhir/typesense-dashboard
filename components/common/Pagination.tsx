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
  showInfo?: boolean;
  className?: string;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  className,
}) => {
  const paginationRange = useMemo(() => {
    const totalPagesToShow = 7; // Number of pagination items to show
    if (totalPages <= totalPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPages = [1, 2]; // First pages to always show
    const endPages = [totalPages - 1, totalPages]; // Last pages to always show
    const middleRange = [];

    if (currentPage > 3 && currentPage < totalPages - 2) {
      middleRange.push(currentPage - 1, currentPage, currentPage + 1);
    } else if (currentPage === 3) {
      middleRange.push(currentPage, currentPage + 1);
    } else if (currentPage === totalPages - 2) {
      middleRange.push(currentPage - 1, currentPage);
    }

    return [
      ...startPages,
      currentPage > 4 ? '...' : null,
      ...middleRange,
      currentPage < totalPages - 3 ? '...' : null,
      ...endPages,
    ].filter(Boolean); // Remove null values
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {showInfo && (
        <div className="text-sm w-full">
          Page {currentPage} of {totalPages}
        </div>
      )}
      
      <Pagination>
        <PaginationContent className="flex items-center gap-1">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.max(currentPage - 1, 1));
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {paginationRange.map((item, index) => (
            <PaginationItem key={index}>
              {typeof item === 'number' ? (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(item);
                  }}
                  isActive={currentPage === item}
                  className="min-w-[2.5rem]"
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
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.min(currentPage + 1, totalPages));
              }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationComponent;
