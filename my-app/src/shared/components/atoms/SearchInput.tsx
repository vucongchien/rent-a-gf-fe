import React from 'react';
import { SearchIcon } from './Icons';

export type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <label 
        className={`flex items-center gap-[9px] h-[42px] px-[15px] bg-white border border-neutral-200 rounded-xl text-neutral-500 text-[13.5px] min-w-[210px] cursor-text transition-all duration-180 focus-within:border-[#fb6999] focus-within:ring-4 focus-within:ring-[#fb6999]/10 ${className}`}
      >
        <SearchIcon size={16} />
        <input 
          ref={ref}
          className="border-none outline-none bg-transparent font-inherit text-neutral-900 flex-1 min-w-0" 
          {...props} 
        />
      </label>
    );
  }
);

SearchInput.displayName = 'SearchInput';
