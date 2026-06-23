'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface AdminFilterTabItem {
  value: string;
  label: string;
  count?: number;
}

interface AdminFilterTabsProps {
  param: string;
  items: AdminFilterTabItem[];
  defaultValue?: string;
}

export const AdminFilterTabs: React.FC<AdminFilterTabsProps> = ({
  param,
  items,
  defaultValue = 'ALL',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? defaultValue;

  const handleClick = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      next.delete(param);
    } else {
      next.set(param, value);
    }
    next.delete('page');
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
      {items.map((item) => {
        const isActive = current === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => handleClick(item.value)}
            className={[
              'h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors inline-flex items-center gap-1.5',
              isActive
                ? 'bg-surface text-neutral-900 shadow-sm'
                : 'text-text-muted hover:text-neutral-900',
            ].join(' ')}
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={[
                  'text-[11px] px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-200 text-neutral-600',
                ].join(' ')}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AdminFilterTabs;
