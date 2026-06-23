'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export const TransactionFilters: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Đọc các giá trị filter hiện tại từ URL
  const currentType = searchParams.get('type') || 'ALL';
  const currentStatus = searchParams.get('status') || 'ALL';

  const types = [
    { key: 'ALL', label: 'Tất cả loại' },
    { key: 'CREDIT', label: 'Nạp tiền (+)' },
    { key: 'DEBIT', label: 'Chi tiêu (-)' },
  ];

  const statuses = [
    { key: 'ALL', label: 'Tất cả trạng thái' },
    { key: 'SUCCESS', label: 'Thành công' },
    { key: 'PENDING', label: 'Đang xử lý' },
    { key: 'FAILED', label: 'Thất bại' },
  ];

  const updateFilters = (newType: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newType === 'ALL') {
      params.delete('type');
    } else {
      params.set('type', newType);
    }

    if (newStatus === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-neutral-100">
      {/* Filter theo Loại */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] font-sans font-bold text-neutral-400 uppercase tracking-wider mr-2 select-none">Loại:</span>
        {types.map((t) => {
          const isActive = currentType === t.key;
          return (
            <button
              key={t.key}
              onClick={() => updateFilters(t.key, currentStatus)}
              className={`px-3 py-1 font-sans text-[12.5px] font-semibold rounded-full border transition-all active:scale-95 ${
                isActive
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filter theo Trạng thái */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] font-sans font-bold text-neutral-400 uppercase tracking-wider mr-2 select-none">Trạng thái:</span>
        {statuses.map((s) => {
          const isActive = currentStatus === s.key;
          return (
            <button
              key={s.key}
              onClick={() => updateFilters(currentType, s.key)}
              className={`px-3 py-1 font-sans text-[12.5px] font-semibold rounded-full border transition-all active:scale-95 ${
                isActive
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
