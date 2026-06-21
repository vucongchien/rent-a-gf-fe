import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse" data-testid="dashboard-skeleton">
      <div className="h-36 bg-neutral-200 rounded-3xl" />
      <div className="space-y-4">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-24 bg-neutral-200 rounded-2xl" />
          <div className="h-24 bg-neutral-200 rounded-2xl" />
          <div className="h-24 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 bg-neutral-200 rounded" />
        <div className="h-24 bg-neutral-200 rounded-2xl" />
        <div className="h-24 bg-neutral-200 rounded-2xl" />
      </div>
    </div>
  );
};
