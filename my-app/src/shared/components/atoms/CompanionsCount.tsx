import React from 'react';

export interface CompanionsCountProps {
  count: number;
  className?: string;
}

export const CompanionsCount: React.FC<CompanionsCountProps> = ({ count, className = '' }) => {
  return (
    <div className={`hidden sm:inline-flex items-center gap-[9px] font-mono text-[11px] tracking-[0.2em] uppercase text-neutral-500 bg-white border border-neutral-200 py-[7px] px-[13px] rounded-full mb-[22px] ${className}`}>
      <span className="w-[8px] h-[8px] rounded-full bg-brand-hover shadow-[0_0_0_0_rgba(251,105,153,0.7)] animate-pulse" />
      {count} companions ready to meet
    </div>
  );
};
