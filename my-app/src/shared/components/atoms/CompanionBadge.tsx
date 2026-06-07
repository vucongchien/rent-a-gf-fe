import React from 'react';

export type CompanionTrait = 'new' | 'hot' | 'verified' | 'top';

export interface CompanionBadgeProps {
  traits: CompanionTrait[];
  className?: string;
}

const traitDictionary: Record<CompanionTrait, { label: string; bgClass: string }> = {
  new: { label: 'Mới', bgClass: 'bg-[var(--color-chizuru-500)]' },
  hot: { label: 'Hot', bgClass: 'bg-[var(--color-mami-500)]' },
  verified: { label: 'Verified', bgClass: 'bg-[var(--color-ruka-500)]' },
  top: { label: 'Top', bgClass: 'bg-[var(--color-warning)]' }, // amber-400
};

export const CompanionBadge: React.FC<CompanionBadgeProps> = ({ traits, className = '' }) => {
  if (!traits || traits.length === 0) return null;

  const labels = traits.map(t => traitDictionary[t]?.label).filter(Boolean).join(' · ');

  // Xử lý background: Nếu 1 trait thì dùng màu solid của trait đó.
  // Nếu >1 trait, dùng một gradient cố định cho đẹp mắt (hoặc trộn class màu gradient).
  let backgroundStyle = traitDictionary[traits[0]]?.bgClass || 'bg-white';
  
  if (traits.length > 1) {
    // Gradient mix cho đa đặc tính
    backgroundStyle = 'bg-gradient-to-r from-[var(--color-chizuru-500)] to-[var(--color-mami-500)]';
  }

  return (
    <div 
      className={`
        absolute top-[11px] left-[11px] z-10 rounded-full px-[11px] py-[5px] 
        font-sans font-bold text-[11px] leading-none border-[1.5px] border-neutral-900 
        shadow-[0_3px_0_var(--color-neutral-900)] text-neutral-900
        ${backgroundStyle}
        ${className}
      `}
    >
      {labels}
    </div>
  );
};
