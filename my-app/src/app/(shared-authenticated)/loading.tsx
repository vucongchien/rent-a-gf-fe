import React from 'react';

export default function SharedAuthenticatedLoading() {
  return (
    <div className="flex flex-col h-full bg-surface p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 bg-neutral-100 rounded-2xl w-full mb-6" />
      {/* Content skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="h-6 bg-neutral-100 rounded-md w-1/3" />
        <div className="h-4 bg-neutral-100 rounded-md w-1/4" />
      </div>
    </div>
  );
}
