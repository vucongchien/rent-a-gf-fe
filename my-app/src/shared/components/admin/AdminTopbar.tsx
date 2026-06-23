import React from 'react';
import type { User } from '@/shared/types';

interface AdminTopbarProps {
  user: User;
  title?: string;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ user, title }) => {
  return (
    <header className="h-[64px] border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-text-muted">Admin Console</span>
        <h1 className="text-[15px] font-semibold text-neutral-900">
          {title ?? 'Overview'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:flex flex-col">
          <span className="text-[13px] font-medium text-neutral-900">{user.displayName}</span>
          <span className="text-[11px] text-text-muted">{user.email}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-neutral-200 grid place-items-center text-[13px] font-semibold text-neutral-700">
          {user.displayName.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
