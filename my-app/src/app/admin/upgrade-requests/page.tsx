import React from 'react';
import Link from 'next/link';
import { authService } from '@/shared/services/authService';
import { adminUpgradeRequestService } from '@/shared/services/adminUpgradeRequestService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { AdminPagination } from '@/shared/components/admin/AdminPagination';
import { DataTable, type DataTableColumn } from '@/shared/components/admin/DataTable';
import type {
  AdminUpgradeRequest,
  AdminUpgradeRequestStatus,
} from '@/shared/types';
import { UpgradeRequestActions } from './UpgradeRequestActions';

const STATUS_META: Record<
  AdminUpgradeRequestStatus,
  { label: string; bg: string; text: string }
> = {
  UPGRADE_STATUS_PENDING: { label: 'Đang chờ', bg: 'bg-amber-100', text: 'text-amber-800' },
  UPGRADE_STATUS_APPROVED: { label: 'Đã duyệt', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  UPGRADE_STATUS_REJECTED: { label: 'Từ chối', bg: 'bg-rose-100', text: 'text-rose-700' },
};

function truncate(s: string, max = 80): string {
  if (!s) return '';
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

function formatDateVN(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default async function AdminUpgradeRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const user = await authService.getMe();
  const page = Math.max(1, Number(sp.page ?? '1'));
  const pageSize = 12;

  const result = await adminUpgradeRequestService.listUpgradeRequests({ page, pageSize });

  const columns: DataTableColumn<AdminUpgradeRequest>[] = [
    {
      key: 'userId',
      header: 'User',
      className: 'w-[20%]',
      render: (row) => (
        <Link
          href={`/admin/users/${row.userId}`}
          className="font-mono text-[12.5px] text-neutral-800 hover:underline"
        >
          {row.userId}
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-[12%]',
      render: (row) => {
        const meta = STATUS_META[row.status];
        return (
          <span
            className={`inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold ${meta.bg} ${meta.text}`}
          >
            {meta.label}
          </span>
        );
      },
    },
    {
      key: 'reason',
      header: 'Lý do',
      className: 'w-[34%]',
      render: (row) => (
        <span className="text-neutral-700 text-[12.5px]" title={row.reason}>
          {truncate(row.reason ?? '', 100)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      className: 'w-[16%]',
      render: (row) => (
        <span className="text-text-muted text-[12px]">{formatDateVN(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      className: 'w-[18%]',
      render: (row) =>
        row.status === 'UPGRADE_STATUS_PENDING' ? (
          <UpgradeRequestActions id={row.id} />
        ) : (
          <span className="text-text-muted text-[12px]">
            {row.rejectReason ? `Lý do: ${truncate(row.rejectReason, 40)}` : '—'}
          </span>
        ),
    },
  ];

  return (
    <>
      {user && <AdminTopbar user={user} title="Upgrade Requests" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] text-text-muted">
            Yêu cầu nâng cấp từ Client lên Companion. Duyệt sẽ kích hoạt role COMPANION.
          </p>
        </div>

        <DataTable
          columns={columns}
          rows={result.data}
          getRowKey={(r) => r.id}
          emptyLabel="Không có yêu cầu nâng cấp"
        />

        <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} />
      </div>
    </>
  );
}
