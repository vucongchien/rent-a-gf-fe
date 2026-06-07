import React from 'react';
import { SearchInput } from '../atoms/SearchInput';
import { Button } from '../atoms/Button';

export interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`
        absolute inset-y-1.5 left-0 right-0 bg-white flex items-center gap-2 px-1 z-20
        transition-all duration-200 ease-out
        ${isOpen 
          ? 'translate-x-0 opacity-100 pointer-events-auto' 
          : 'translate-x-full opacity-0 pointer-events-none'
        }
      `}
    >
      <SearchInput
        placeholder="Tìm tên, sở thích, địa điểm..."
        className="flex-1"
        autoFocus={isOpen}
      />
      <Button
        variant="ghost"
        onClick={onClose}
        className="h-9 px-3 rounded-md text-sm text-neutral-500 font-medium hover:text-neutral-900 border-none shadow-none"
      >
        Hủy
      </Button>
    </div>
  );
};
