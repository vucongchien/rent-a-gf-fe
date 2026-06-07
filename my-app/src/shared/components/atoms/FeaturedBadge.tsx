import React from 'react';

export interface FeaturedBadgeProps {
  className?: string;
}

export const FeaturedBadge: React.FC<FeaturedBadgeProps> = ({ className = '' }) => {
  return (
    <span className={`absolute top-[24px] left-[24px] z-20 bg-accent border-[1.5px] border-neutral-900 rounded-full py-[6px] px-[13px] font-sans font-semibold text-[12px] leading-none shadow-[0_3px_0_var(--color-neutral-900)] text-neutral-900 ${className}`}>
      ★ Companion of the day
    </span>
  );
};
