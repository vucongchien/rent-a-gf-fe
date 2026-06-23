import React from 'react';
import Link from 'next/link';
import { authService } from '@/shared/services/authService';
import { adminDisputeService } from '@/shared/services/adminDisputeService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { AdminFilterTabs } from '@/shared/components/admin/AdminFilterTabs';
import { AdminSearchInput } from '@/shared/components/admin/AdminSearchInput';
import { AdminPagination } from '@/shared/components/admin/AdminPagination';
import { DataTable, type DataTableColumn } from '@/shared/components/admin/DataTable';
import type {
  AdminDisputeListParams,
  AdminDisputeRow,
  AdminDisputeStatus,
  AdminDisputeSeverity,
} from '@/shared/types';

const STATUS_LIST: AdminDisputeStatus[] = ['OPEN', 'INVESTIGATING', 'RESOLVED'];

function parseStatus(raw: string | undefined): AdminDisputeListParams['status'] {
  if (!raw) return 'ALL';
  const upper = raw.toUpperCase();
  if (upper === 'ALL') return 'ALL';
  if ((STATUS_LIST as string[]).includes(upper)) return upper as AdminDisputeStatus;
  return 'ALL';
}

const STATUS_CONFIG: Record<AdminDisputeStatus, { label: string; bg: string }> = {
  OPEN: { label: 'Mở', bg: 'bg-sumi-100' },
  INVESTIGATING: { label: 'Đang xử lý', bg: 'bg-mami-100' },
  RESOLVED: { label: 'Đã giải quyết', bg: 'bg-ruka-100' },
};

const SEVERITY_CONFIG: Record<AdminDisputeSeverity, { label: string; bg: string; text: string }> = {
  HIGH: { label: 'Cao', bg: 'bg-rose-400/15', text: 'text-rose-400' },
  MEDIUM: { label: 'Trung bình', bg: 'bg-mami-100', text: 'text-neutral-800' },
  LOW: { label: 'Thấp', bg: 'bg-neutral-100', text: 'text-neutral-700' },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString('vi-VN');
}

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await authService.getMe();
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, Number(sp.page ?? '1'));

  const result = await adminDisputeService.list({
    status,
    q,
    page,
    pageSize: 12,
  });

  const tabItems = [
    {
      value: 'ALL',
      label: 'Tất cả',
      count: result.counts.OPEN + result.counts.INVESTIGATING + result.counts.RESOLVED,
    },
    { value: 'OPEN', label: 'Mở', count: result.counts.OPEN },
    { value: 'INVESTIGATING', label: 'Đang xử lý', count: result.counts.INVESTIGATING },
    { value: 'RESOLVED', label: 'Đã giải quyết', count: result.counts.RESOLVED },
  ];

  const columns: DataTableColumn<AdminDisputeRow>[] = [
    {
      key: 'id',
      header: 'Mã',
      className: 'w-[12%]',
      render: (row) => (
        <Link
          href={`/admin/disputes/${row.disputeId}`}
          className="font-mono text-[12px] text-neutral-900 hover:underline"
        >
          {row.disputeId}
        </Link>
      ),
    },
    {
      key: 'reason',
      header: 'Lý do',
      className: 'w-[34%]',
      render: (row) => (
        <Link
          href={`/admin/disputes/${row.disputeId}`}
          className="text-[13px] text-neutral-900 hover:underline line-clamp-2"
        >
          {row.reason}
        </Link>
      ),
    },
    {
      key: 'parties',
      header: 'Các bên',
      className: 'w-[20%]',
      render: (row) => (
        <div className="flex flex-col text-[12px]">
          <span className="text-neutral-700">{row.clientName}</span>
          <span className="text-text-muted">↔ {row.companionName}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Mức',
      className: 'w-[10%]',
      render: (row) => {
        const cfg = SEVERITY_CONFIG[row.severity];
        return (
          <span
            className={[
              'inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold',
              cfg.bg,
              cfg.text,
            ].join(' ')}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-[12%]',
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status];
        return (
          <span
            className={[
              'inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold text-neutral-800',
              cfg.bg,
            ].join(' ')}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'openedAt',
      header: 'Mở lúc',
      className: 'w-[12%]',
      render: (row) => (
        <span className="text-[12px] text-text-muted">{formatDateTime(row.openedAt)}</span>
      ),
    },
  ];

  return (
    <>
      {user && <AdminTopbar user={user} title="Disputes" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminFilterTabs param="status" items={tabItems} defaultValue="ALL" />
          <AdminSearchInput param="q" placeholder="Tìm mã / booking / tên..." />
        </div>

        <DataTable
          columns={columns}
          rows={result.rows}
          getRowKey={(r) => r.disputeId}
          emptyLabel={q ? `Không có dispute khớp "${q}"` : 'Không có dispute'}
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
