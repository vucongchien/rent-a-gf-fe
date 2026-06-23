import React from 'react';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4 animate-pulse" data-testid="profile-skeleton">
      <div className="h-20 bg-neutral-200 rounded-2xl" />
      <div className="h-40 bg-neutral-200 rounded-2xl" />
      <div className="h-32 bg-neutral-200 rounded-2xl" />
    </div>
  );
};
