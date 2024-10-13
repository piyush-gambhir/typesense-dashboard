'use client';

import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface FacetValue {
  value: string | number | boolean;
  count: number;
}

interface FilterProps {
  collectionSchema: {
    fields: Array<{
      name: string;
      type: string;
      facet: boolean;
    }>;
  };
  facetValues: Record<string, FacetValue[]>;
  filterBy: Record<string, (string | number | boolean)[]>;
  onFilterChange: (
    field: string,
    value: string | number | boolean,
    checked: boolean,
  ) => void;
}

const Filter: React.FC<FilterProps> = ({
  collectionSchema,
  facetValues,
  filterBy,
  onFilterChange,
}) => {
  const getFieldType = (field: string): string => {
    const schemaField = collectionSchema.fields.find(
      (f) => f.name === field && f.facet,
    );
    return schemaField ? schemaField.type : 'string';
  };

  const renderStringFilter = (field: string, values: FacetValue[]) => (
    <div className="space-y-2">
      {values.map((facet) => (
        <div
          key={`${field}-${facet.value}`}
          className="flex items-center space-x-2"
        >
          <Checkbox
            id={`${field}-${facet.value}`}
            checked={filterBy[field]?.includes(facet.value)}
            onCheckedChange={(checked) =>
              onFilterChange(field, facet.value as string, checked as boolean)
            }
          />
          <Label
            htmlFor={`${field}-${facet.value}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {facet.value as string}
          </Label>
          <span className="text-sm text-muted-foreground">({facet.count})</span>
        </div>
      ))}
    </div>
  );

  const renderBooleanFilter = (field: string) => (
    <div className="flex items-center space-x-2">
      <Switch
        id={`${field}-switch`}
        checked={filterBy[field]?.includes(true)}
        onCheckedChange={(checked) => onFilterChange(field, checked, true)}
      />
      <Label
        htmlFor={`${field}-switch`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {field.charAt(0).toUpperCase() + field.slice(1)}
      </Label>
    </div>
  );

  const renderNumberFilter = (field: string, values: FacetValue[]) => {
    const minValue = Math.min(...values.map((v) => Number(v.value)));
    const maxValue = Math.max(...values.map((v) => Number(v.value)));
    const currentValue = filterBy[field]?.[0] as number;
    const value = currentValue ?? maxValue;

    return (
      <div className="space-y-2">
        <Label htmlFor={`${field}-slider`} className="text-sm font-medium">
          {field.charAt(0).toUpperCase() + field.slice(1)}: {value.toFixed(2)}
        </Label>
        <Slider
          id={`${field}-slider`}
          min={minValue}
          max={maxValue}
          step={(maxValue - minValue) / 100}
          value={[value]}
          onValueChange={([newValue]) => onFilterChange(field, newValue, true)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(facetValues).map(([field, values]) => {
        if (values.length <= 1) return null; // Don't render if there's only one or zero options

        const fieldType = getFieldType(field);

        return (
          <div key={field} className="border-b last:border-b-0 pb-4">
            <h3 className="font-medium mb-2 text-lg">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </h3>
            {(fieldType === 'string' || fieldType === 'string[]') &&
              renderStringFilter(field, values)}
            {fieldType === 'bool' && renderBooleanFilter(field)}
            {(fieldType === 'float' || fieldType === 'int32') &&
              renderNumberFilter(field, values)}
          </div>
        );
      })}
    </div>
  );
};

export default Filter;
