'use client';

import React from 'react';

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 w-full" aria-busy="true" aria-label="Đang tải thông báo">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-start gap-4 py-3.5 px-4 md:p-4 rounded-none md:rounded-2xl bg-white border-none md:border md:border-neutral-100/80 animate-pulse shadow-none md:shadow-sm"
        >
          {/* Avatar / Icon Placeholder */}
          <div className="w-12 h-12 rounded-full bg-neutral-100 shrink-0" />
          
          {/* Content Lines */}
          <div className="flex-1 flex flex-col gap-2 mt-1">
            <div className="h-4 w-1/4 rounded bg-neutral-100" />
            <div className="h-3.5 w-3/4 rounded bg-neutral-100" />
            <div className="h-3 w-16 rounded bg-neutral-100 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
