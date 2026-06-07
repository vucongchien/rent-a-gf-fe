import React from 'react';
import { HeartIcon } from '../atoms/Icons';
import { CloseButton } from '../atoms/CloseButton';

export interface SidebarHeaderProps {
  onClose: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4">
      {/* Logo nhỏ */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md grid place-items-center bg-gradient-to-br from-white via-chizuru-100 to-chizuru-500 shadow-[0_4px_10px_-4px_rgba(251,105,153,0.5)]">
          <HeartIcon fill="#fff" size={17} className="text-white" />
        </div>
        <span className="font-sans text-lg tracking-[-0.02em] font-semibold">
          <em className="not-italic italic text-chizuru-600">kanojo</em>
        </span>
      </div>

      {/* Close button */}
      <CloseButton onClose={onClose} size={18} />
    </div>
  );
};
