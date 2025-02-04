import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, SlidersHorizontal, Search } from "lucide-react";

export interface SearchField<T> {
  key: keyof T;
  label: string;
  placeholder: string;
  type?: 'text' | 'number';
}

interface DataTableToolbarProps<T> {
  searchFields: SearchField<T>[];
  searchValues: Partial<Record<keyof T, string>>;
  onSearchChange: (field: keyof T, value: string) => void;
  sortOptions: {
    label: string;
    value: keyof T;
  }[];
  sortBy: keyof T;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: keyof T, order: 'asc' | 'desc') => void;
  filterOptions: {
    label: string;
    value: string;
    field: keyof T;
  }[];
  activeFilters: { field: keyof T; value: string }[];
  onFilterChange: (filters: { field: keyof T; value: string }[]) => void;
}

export function DataTableToolbar<T>({
  searchFields,
  searchValues,
  onSearchChange,
  sortOptions,
  sortBy,
  sortOrder,
  onSortChange,
  filterOptions,
  activeFilters,
  onFilterChange,
}: DataTableToolbarProps<T>) {
  const handleFilterToggle = (field: keyof T, value: string, checked: boolean) => {
    if (checked) {
      onFilterChange([...activeFilters, { field, value }]);
    } else {
      onFilterChange(activeFilters.filter(f => !(f.field === field && f.value === value)));
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
    searchFields.forEach(field => onSearchChange(field.key, ""));
  };

  const hasActiveSearches = Object.values(searchValues).some(value => value);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {searchFields.map((field) => (
            <div key={String(field.key)} className="flex relative">
              <Input
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={searchValues[field.key] || ""}
                onChange={(e) => onSearchChange(field.key, e.target.value)}
                className="w-full pl-9"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
            </div>
          ))}
        </div>
        
        <Select
          value={`${String(sortBy)}-${sortOrder}`}
          onValueChange={(value) => {
            const [field, order] = value.split('-') as [keyof T, 'asc' | 'desc'];
            onSortChange(field, order);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <React.Fragment key={String(option.value)}>
                <SelectItem value={`${String(option.value)}-asc`}>
                  {option.label} (A-Z)
                </SelectItem>
                <SelectItem value={`${String(option.value)}-desc`}>
                  {option.label} (Z-A)
                </SelectItem>
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {filterOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={`${String(option.field)}-${option.value}`}
                checked={activeFilters.some(
                  (f) => f.field === option.field && f.value === option.value
                )}
                onCheckedChange={(checked) =>
                  handleFilterToggle(option.field, option.value, checked)
                }
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(activeFilters.length > 0 || hasActiveSearches) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <div
              key={index}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              <span>
                {filterOptions.find(
                  (o) => o.field === filter.field && o.value === filter.value
                )?.label}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() =>
                  onFilterChange(
                    activeFilters.filter((_, i) => i !== index)
                  )
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}