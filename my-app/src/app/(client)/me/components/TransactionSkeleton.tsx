import React from 'react';

export const TransactionSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full animate-pulse">
      {/* 4 dòng skeleton giả lập giao dịch */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between py-3.5 border-b border-neutral-100 last:border-0">
          <div className="flex items-center gap-3">
            {/* Icon placeholder */}
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex-shrink-0" />
            
            {/* Description & Date placeholder */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-44 bg-neutral-200 rounded-md" />
              <div className="h-3 w-28 bg-neutral-100 rounded" />
            </div>
          </div>

          {/* Amount & Status placeholder */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="h-4.5 w-16 bg-neutral-200 rounded-md" />
            <div className="h-3.5 w-12 bg-neutral-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionSkeleton;
