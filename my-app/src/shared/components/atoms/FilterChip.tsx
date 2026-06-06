import React from 'react';

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({ 
  active = false, 
  label, 
  className = '', 
  ...props 
}) => {
  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center font-sans font-medium text-[13.5px] leading-none 
        px-[16px] py-[10px] rounded-full border transition-colors duration-150 cursor-pointer
        ${active 
          ? 'bg-neutral-900 text-white border-neutral-900' 
          : 'bg-white text-neutral-500 border-neutral-200 hover:text-neutral-900 hover:border-neutral-400'
        }
        ${className}
      `}
      {...props}
    >
      {label}
    </button>
  );
};
