'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/profile', label: 'Hồ sơ' },
  { href: '/dashboard/profile/scenarios', label: 'Dịch vụ' },
] as const;

export function ProfileTabs() {
  const pathname = usePathname();
  return (
    <nav
      className="flex gap-2 mb-4 sticky top-0 bg-surface/90 backdrop-blur z-10 py-2"
      aria-label="Profile sections"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            data-active={active}
            className="px-3 py-1.5 rounded-full font-sans font-medium text-[13px] transition-colors data-[active=true]:bg-neutral-900 data-[active=true]:text-white data-[active=false]:bg-neutral-100 data-[active=false]:text-neutral-700 data-[active=false]:hover:bg-neutral-200"
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
