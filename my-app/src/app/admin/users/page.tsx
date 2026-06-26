import React from 'react';
import Link from 'next/link';
import { authService } from '@/shared/services/authService';
import { adminUserService } from '@/shared/services/adminUserService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { AdminFilterTabs } from '@/shared/components/admin/AdminFilterTabs';
import { AdminSearchInput } from '@/shared/components/admin/AdminSearchInput';
import { AdminPagination } from '@/shared/components/admin/AdminPagination';
import { DataTable, type DataTableColumn } from '@/shared/components/admin/DataTable';
import type {
  AdminUserListParams,
  AdminUserRow,
  AdminUserStatus,
} from '@/shared/types';

const STATUS_LIST: AdminUserStatus[] = ['ACTIVE', 'LOCKED'];
const ROLE_LIST = ['CLIENT', 'COMPANION', 'ADMIN'] as const;

function parseStatus(raw: string | undefined): AdminUserListParams['status'] {
  if (!raw) return 'ALL';
  const upper = raw.toUpperCase();
  if (upper === 'ALL') return 'ALL';
  if ((STATUS_LIST as string[]).includes(upper)) return upper as AdminUserStatus;
  return 'ALL';
}

function parseRole(raw: string | undefined): AdminUserListParams['role'] {
  if (!raw) return 'ALL';
  const upper = raw.toUpperCase();
  if (upper === 'ALL') return 'ALL';
  if ((ROLE_LIST as readonly string[]).includes(upper)) {
    return upper as 'CLIENT' | 'COMPANION' | 'ADMIN';
  }
  return 'ALL';
}

const ROLE_LABEL: Record<string, string> = {
  CLIENT: 'Khách',
  COMPANION: 'Companion',
  ADMIN: 'Admin',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await authService.getMe();
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const role = parseRole(sp.role);
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, Number(sp.page ?? '1'));

  const result = await adminUserService.list({
    status,
    role,
    q,
    page,
    pageSize: 12,
  });

  const statusTabs = [
    { value: 'ALL', label: 'Tất cả', count: result.counts.ACTIVE + result.counts.LOCKED },
    { value: 'ACTIVE', label: 'Hoạt động', count: result.counts.ACTIVE },
    { value: 'LOCKED', label: 'Bị khóa', count: result.counts.LOCKED },
  ];

  const roleTabs = [
    { value: 'ALL', label: 'Mọi role' },
    { value: 'CLIENT', label: 'Khách' },
    { value: 'COMPANION', label: 'Companion' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const columns: DataTableColumn<AdminUserRow>[] = [
    {
      key: 'user',
      header: 'User',
      className: 'w-[32%]',
      render: (row) => (
        <Link
          href={`/admin/users/${row.userId}`}
          className="inline-flex items-center gap-3 group"
        >
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-neutral-900 group-hover:underline truncate">
              {row.displayName}
            </span>
            <span className="text-[11px] text-text-muted truncate">{row.email}</span>
          </div>
        </Link>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      className: 'w-[12%]',
      render: (row) => (
        <span className="inline-flex items-center px-2 h-5 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-semibold">
          {ROLE_LABEL[row.role] ?? row.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-[12%]',
      render: (row) => (
        <span
          className={[
            'inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold',
            row.status === 'ACTIVE'
              ? 'bg-ruka-100 text-neutral-800'
              : 'bg-sumi-100 text-neutral-800',
          ].join(' ')}
        >
          {row.status === 'ACTIVE' ? 'Active' : 'Locked'}
        </span>
      ),
    },
    {
      key: 'wallet',
      header: 'Ví',
      className: 'w-[12%]',
      render: (row) => (
        <span className="text-neutral-700 font-mono text-[12.5px]">
          {row.walletBalance.toLocaleString('vi-VN')} coin
        </span>
      ),
    },
    {
      key: 'bookings',
      header: 'Bookings',
      className: 'w-[10%]',
      render: (row) => <span className="text-neutral-700">{row.totalBookings}</span>,
    },
    {
      key: 'violations',
      header: 'Vi phạm',
      className: 'w-[10%]',
      render: (row) =>
        row.violationCount > 0 ? (
          <span className="inline-flex items-center px-2 h-5 rounded-full bg-sumi-100 text-neutral-800 text-[11px] font-semibold">
            {row.violationCount}
          </span>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      className: 'w-[12%]',
      render: (row) => (
        <span className="text-text-muted text-[12px]">
          {new Date(row.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
  ];

  return (
    <>
      {user && <AdminTopbar user={user} title="Users" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <AdminFilterTabs param="status" items={statusTabs} defaultValue="ALL" />
            <AdminFilterTabs param="role" items={roleTabs} defaultValue="ALL" />
          </div>
          <AdminSearchInput param="q" placeholder="Tìm tên / email / id..." />
        </div>

        <DataTable
          columns={columns}
          rows={result.rows}
          getRowKey={(r) => r.userId}
          emptyLabel={q ? `Không tìm thấy user khớp "${q}"` : 'Không có user'}
        />

        <AdminPagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
