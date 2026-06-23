'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AdminSearchInputProps {
  param: string;
  placeholder?: string;
}

export const AdminSearchInput: React.FC<AdminSearchInputProps> = ({
  param,
  placeholder = 'Tìm kiếm...',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get(param) ?? '';
  const [value, setValue] = useState(initial);

  // Debounce sync URL
  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) next.set(param, trimmed);
      else next.delete(param);
      next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full max-w-[280px]">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface text-[13px] text-neutral-900 placeholder:text-text-muted focus:outline-none focus:border-neutral-900 transition-colors"
      />
      <span
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-text-muted"
      >
        🔍
      </span>
    </div>
  );
};

export default AdminSearchInput;
