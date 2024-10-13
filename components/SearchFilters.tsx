import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';

interface FacetValue {
  value: string;
  count: number;
}

interface FilterProps {
  facetValues: Record<string, FacetValue[]>;
  filterBy: string[];
  onFilterChange: (value: string, checked: boolean) => void;
}

const Filter: React.FC<FilterProps> = ({
  facetValues,
  filterBy,
  onFilterChange,
}) => {
  console.log('Facet Values', facetValues);
  return (
    <>
      {Object.entries(facetValues).map(([field, values]) => {
        if (values.length <= 1) return null; // Don't render if there's only one or zero options

        return (
          <div key={field} className="border-b last:border-b-0 py-4">
            <span className="font-medium py-4">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </span>

            <div className="py-4 space-y-2">
              {values.map((facet) => (
                <div key={facet.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field}-${facet.value}`}
                    checked={filterBy.includes(`${field}:${facet.value}`)}
                    onCheckedChange={(checked) =>
                      onFilterChange(
                        `${field}:${facet.value}`,
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`${field}-${facet.value}`}
                    className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow"
                  >
                    {facet.value}
                  </label>
                  <span className="text-muted-foreground">{facet.count}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Filter;
