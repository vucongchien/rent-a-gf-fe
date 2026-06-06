'use client';

import React from 'react';
import { FilterChip } from '../atoms/FilterChip';

export interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: { id: string; label: string }[];
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  filters,
  className = '',
}) => {
  return (
    <div className={`py-[10px] bg-white z-20 ${className}`}>
      {/* Filter Chips — scroll ngang trên mobile, không wrap */}
      <div className="flex gap-[8px] items-center overflow-x-auto scrollbar-none flex-nowrap pb-[2px]">
        {filters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            active={activeFilter === filter.id}
            onClick={() => onFilterChange(filter.id)}
          />
        ))}
      </div>
    </div>
  );
};
