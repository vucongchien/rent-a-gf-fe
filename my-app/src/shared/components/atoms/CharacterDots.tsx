import React from 'react';

export interface CharacterDotsProps {
  className?: string;
}

export const CharacterDots: React.FC<CharacterDotsProps> = ({ className = '' }) => {
  return (
    <div className={`flex gap-[6px] mt-[30px] ${className}`}>
      <span className="w-[10px] h-[10px] rounded-full block bg-ruka-500" />
      <span className="w-[10px] h-[10px] rounded-full block bg-mami-500" />
      <span className="w-[10px] h-[10px] rounded-full block bg-brand-hover" />
      <span className="w-[10px] h-[10px] rounded-full block bg-neutral-200" />
    </div>
  );
};
