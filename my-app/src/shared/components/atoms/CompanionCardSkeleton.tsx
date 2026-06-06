import React from 'react';

export const CompanionCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface border border-border rounded-2xl p-3 shadow-companion-card flex flex-col animate-pulse">
      {/* Media skeleton area */}
      <div className="relative rounded-xl overflow-hidden aspect-square bg-neutral-100 border border-border" />

      {/* Info skeleton area */}
      <div className="pt-3.5 px-2 pb-2 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-2">
          {/* Name skeleton */}
          <div className="h-5 w-24 bg-neutral-200 rounded-md" />
          {/* Location skeleton */}
          <div className="h-3 w-12 bg-neutral-100 rounded-md" />
        </div>

        {/* Metadata skeleton */}
        <div className="mt-1 flex items-center gap-1.5">
          <div className="h-3 w-14 bg-neutral-100 rounded-md" />
          <div className="w-1 h-1 rounded-full bg-neutral-200" />
          <div className="h-3 w-10 bg-neutral-100 rounded-md" />
          <div className="w-1 h-1 rounded-full bg-neutral-200" />
          <div className="h-3 w-8 bg-neutral-100 rounded-md" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between gap-2.5 mt-3.5 pt-3 border-t border-dashed border-border-card-dashed">
          {/* Price skeleton */}
          <div className="h-4 w-20 bg-neutral-200 rounded-md" />
          {/* Button skeleton */}
          <div className="h-10 w-22 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
