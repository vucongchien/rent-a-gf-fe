import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '@/shared/services/authService';
import { adminCompanionService } from '@/shared/services/adminCompanionService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { AdminFilterTabs } from '@/shared/components/admin/AdminFilterTabs';
import { AdminSearchInput } from '@/shared/components/admin/AdminSearchInput';
import { AdminPagination } from '@/shared/components/admin/AdminPagination';
import { AdminStatusPill } from '@/shared/components/admin/AdminStatusPill';
import { DataTable, type DataTableColumn } from '@/shared/components/admin/DataTable';
import type {
  AdminCompanionListParams,
  AdminCompanionRow,
  ModerationStatus,
} from '@/shared/types';

const STATUS_LIST: ModerationStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
];

function parseStatus(raw: string | undefined): AdminCompanionListParams['status'] {
  if (!raw) return 'ALL';
  const upper = raw.toUpperCase();
  if (upper === 'ALL') return 'ALL';
  if ((STATUS_LIST as string[]).includes(upper)) return upper as ModerationStatus;
  return 'ALL';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function AdminCompanionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await authService.getMe();
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, Number(sp.page ?? '1'));

  const result = await adminCompanionService.list({
    status,
    q,
    page,
    pageSize: 12,
  });

  const tabItems = [
    { value: 'ALL', label: 'Tất cả', count: result.counts.PENDING + result.counts.APPROVED + result.counts.REJECTED + result.counts.SUSPENDED },
    { value: 'PENDING', label: 'Chờ duyệt', count: result.counts.PENDING },
    { value: 'APPROVED', label: 'Đã duyệt', count: result.counts.APPROVED },
    { value: 'REJECTED', label: 'Từ chối', count: result.counts.REJECTED },
    { value: 'SUSPENDED', label: 'Bị khóa', count: result.counts.SUSPENDED },
  ];

  const columns: DataTableColumn<AdminCompanionRow>[] = [
    {
      key: 'companion',
      header: 'Companion',
      className: 'w-[36%]',
      render: (row) => (
        <Link
          href={`/admin/companions/${row.companionId}`}
          className="inline-flex items-center gap-3 group"
        >
          <Image
            src={row.avatarUrl}
            alt={row.displayName}
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-neutral-900 group-hover:underline">
              {row.displayName}
            </span>
            <span className="text-[11px] text-text-muted font-mono">
              {row.companionId}
            </span>
          </div>
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-[12%]',
      render: (row) => <AdminStatusPill status={row.status} />,
    },
    {
      key: 'cities',
      header: 'Khu vực',
      className: 'w-[14%]',
      render: (row) => (
        <span className="text-neutral-700">{row.availableCities.join(', ')}</span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      className: 'w-[12%]',
      render: (row) => (
        <span className="text-neutral-700">
          ⭐ {row.averageRating.toFixed(1)}{' '}
          <span className="text-text-muted text-[11px]">({row.totalReviews})</span>
        </span>
      ),
    },
    {
      key: 'reports',
      header: 'Báo cáo',
      className: 'w-[10%]',
      render: (row) =>
        row.reportCount > 0 ? (
          <span className="inline-flex items-center px-2 h-5 rounded-full bg-sumi-100 text-neutral-800 text-[11px] font-semibold">
            {row.reportCount}
          </span>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      key: 'submittedAt',
      header: 'Nộp đơn',
      className: 'w-[12%]',
      render: (row) => (
        <span className="text-text-muted">{formatDate(row.submittedAt)}</span>
      ),
    },
  ];

  return (
    <>
      {user && <AdminTopbar user={user} title="Companions" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminFilterTabs param="status" items={tabItems} defaultValue="ALL" />
          <AdminSearchInput param="q" placeholder="Tìm theo tên / id..." />
        </div>

        <DataTable
          columns={columns}
          rows={result.rows}
          getRowKey={(r) => r.companionId}
          emptyLabel={
            q
              ? `Không tìm thấy companion khớp "${q}"`
              : 'Không có hồ sơ ở trạng thái này'
          }
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
