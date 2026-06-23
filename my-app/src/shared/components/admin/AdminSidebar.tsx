'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  emoji: string;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'companions', label: 'Companions', href: '/admin/companions', emoji: '👥' },
  { id: 'users', label: 'Users', href: '/admin/users', emoji: '🧑' },
  { id: 'transactions', label: 'Transactions', href: '/admin/transactions', emoji: '💳' },
  { id: 'disputes', label: 'Disputes', href: '/admin/disputes', emoji: '⚖️' },
  { id: 'settings', label: 'Settings', href: '/admin/settings', emoji: '⚙️' },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r border-border bg-surface">
      <div className="h-[64px] px-5 flex items-center gap-2 border-b border-border">
        <div className="w-8 h-8 rounded-md bg-neutral-900 text-white grid place-items-center font-display text-sm">
          K
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-neutral-900">Kanojo Admin</span>
          <span className="text-[11px] text-text-muted">Internal console</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={[
                'h-10 px-3 rounded-md flex items-center gap-2.5 text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100',
              ].join(' ')}
            >
              <span aria-hidden className="text-base leading-none">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border text-[11px] text-text-muted">
        v0.1 · admin
      </div>
    </aside>
  );
};

export default AdminSidebar;
