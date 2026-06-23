'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  page,
  pageSize,
  total,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const goto = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    const sp = new URLSearchParams(searchParams.toString());
    if (next === 1) sp.delete('page');
    else sp.set('page', String(next));
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex items-center justify-between text-[12.5px] text-text-muted">
      <span>
        Hiển thị <strong className="text-neutral-900">{start}</strong>–
        <strong className="text-neutral-900">{end}</strong> trong tổng{' '}
        <strong className="text-neutral-900">{total}</strong>
      </span>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => goto(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 rounded-md border border-border bg-surface text-neutral-700 disabled:opacity-40 hover:bg-neutral-50"
        >
          ‹
        </button>
        <span className="px-3 h-8 inline-flex items-center text-neutral-900 font-medium">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => goto(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 rounded-md border border-border bg-surface text-neutral-700 disabled:opacity-40 hover:bg-neutral-50"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
