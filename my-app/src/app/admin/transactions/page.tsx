import React from 'react';
import { authService } from '@/shared/services/authService';
import { adminTransactionService } from '@/shared/services/adminTransactionService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { AdminFilterTabs } from '@/shared/components/admin/AdminFilterTabs';
import { AdminSearchInput } from '@/shared/components/admin/AdminSearchInput';
import { AdminPagination } from '@/shared/components/admin/AdminPagination';
import { DataTable, type DataTableColumn } from '@/shared/components/admin/DataTable';
import type {
  AdminTransactionListParams,
  AdminTransactionRow,
  AdminTransactionStatus,
  AdminTransactionType,
} from '@/shared/types';

const STATUS_LIST: AdminTransactionStatus[] = ['PENDING', 'SUCCESS', 'FAILED'];
const TYPE_LIST: AdminTransactionType[] = ['TOPUP', 'BOOKING', 'REFUND', 'PAYOUT'];

function parseStatus(raw: string | undefined): AdminTransactionListParams['status'] {
  if (!raw) return 'ALL';
  const upper = raw.toUpperCase();
  if (upper === 'ALL') return 'ALL';
  if ((STATUS_LIST as string[]).includes(upper)) return upper as AdminTransactionStatus;
  return 'ALL';
}
function parseType(raw: string | undefined): AdminTransactionListParams['type'] {
  if (!raw) return 'ALL';
  const upper = raw.toUpperCase();
  if (upper === 'ALL') return 'ALL';
  if ((TYPE_LIST as string[]).includes(upper)) return upper as AdminTransactionType;
  return 'ALL';
}

const TYPE_CONFIG: Record<AdminTransactionType, { label: string; bg: string }> = {
  TOPUP: { label: 'Nạp tiền', bg: 'bg-ruka-100' },
  BOOKING: { label: 'Booking', bg: 'bg-mami-100' },
  REFUND: { label: 'Hoàn tiền', bg: 'bg-chizuru-100' },
  PAYOUT: { label: 'Rút tiền', bg: 'bg-neutral-100' },
};

const STATUS_CONFIG: Record<AdminTransactionStatus, { label: string; bg: string; text: string }> = {
  SUCCESS: { label: 'Thành công', bg: 'bg-ruka-100', text: 'text-neutral-800' },
  PENDING: { label: 'Đang xử lý', bg: 'bg-mami-100', text: 'text-neutral-800' },
  FAILED: { label: 'Thất bại', bg: 'bg-sumi-100', text: 'text-neutral-800' },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await authService.getMe();
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const type = parseType(sp.type);
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, Number(sp.page ?? '1'));

  const result = await adminTransactionService.list({
    status,
    type,
    q,
    page,
    pageSize: 15,
  });

  const statusTabs = [
    { value: 'ALL', label: 'Tất cả', count: result.counts.PENDING + result.counts.SUCCESS + result.counts.FAILED },
    { value: 'SUCCESS', label: 'Thành công', count: result.counts.SUCCESS },
    { value: 'PENDING', label: 'Đang xử lý', count: result.counts.PENDING },
    { value: 'FAILED', label: 'Thất bại', count: result.counts.FAILED },
  ];

  const typeTabs = [
    { value: 'ALL', label: 'Mọi loại' },
    { value: 'TOPUP', label: 'Nạp tiền' },
    { value: 'BOOKING', label: 'Booking' },
    { value: 'REFUND', label: 'Hoàn tiền' },
    { value: 'PAYOUT', label: 'Rút tiền' },
  ];

  const columns: DataTableColumn<AdminTransactionRow>[] = [
    {
      key: 'id',
      header: 'Mã GD',
      className: 'w-[14%]',
      render: (row) => (
        <span className="font-mono text-[12px] text-neutral-700">{row.transactionId}</span>
      ),
    },
    {
      key: 'type',
      header: 'Loại',
      className: 'w-[10%]',
      render: (row) => (
        <span
          className={[
            'inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold text-neutral-800',
            TYPE_CONFIG[row.type].bg,
          ].join(' ')}
        >
          {TYPE_CONFIG[row.type].label}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-[11%]',
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status];
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
      key: 'amount',
      header: 'Số tiền',
      className: 'w-[14%] text-right',
      render: (row) => (
        <span
          className={[
            'font-mono text-[13px] font-semibold',
            row.amount > 0 ? 'text-emerald-400' : 'text-rose-400',
          ].join(' ')}
        >
          {row.amount > 0 ? '+' : ''}
          {row.amount.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      className: 'w-[18%]',
      render: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-[12.5px] text-neutral-900 truncate">{row.userName}</span>
          <span className="text-[10.5px] text-text-muted font-mono">{row.userId}</span>
        </div>
      ),
    },
    {
      key: 'desc',
      header: 'Mô tả',
      className: 'w-[20%]',
      render: (row) => (
        <div className="min-w-0">
          <span className="text-[12.5px] text-neutral-700 block truncate">
            {row.description}
          </span>
          {row.reference && (
            <span className="text-[10.5px] text-text-muted font-mono">
              ref: {row.reference}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Thời gian',
      className: 'w-[12%]',
      render: (row) => (
        <span className="text-[12px] text-text-muted">{formatDateTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <>
      {user && <AdminTopbar user={user} title="Transactions" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Tổng nạp (SUCCESS)"
            value={`+${result.totals.grossCredit.toLocaleString('vi-VN')} coin`}
            tone="pos"
          />
          <SummaryCard
            label="Tổng chi (SUCCESS)"
            value={`-${result.totals.grossDebit.toLocaleString('vi-VN')} coin`}
            tone="neg"
          />
          <SummaryCard
            label="Net flow"
            value={`${result.totals.netFlow >= 0 ? '+' : ''}${result.totals.netFlow.toLocaleString('vi-VN')} coin`}
            tone={result.totals.netFlow >= 0 ? 'pos' : 'neg'}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <AdminFilterTabs param="status" items={statusTabs} defaultValue="ALL" />
            <AdminFilterTabs param="type" items={typeTabs} defaultValue="ALL" />
          </div>
          <AdminSearchInput param="q" placeholder="Tìm mã GD / user / ref..." />
        </div>

        <DataTable
          columns={columns}
          rows={result.rows}
          getRowKey={(r) => r.transactionId}
          emptyLabel={q ? `Không có giao dịch khớp "${q}"` : 'Không có giao dịch'}
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

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'pos' | 'neg';
}) {
  return (
    <div className="border border-border rounded-lg bg-surface p-4">
      <p className="text-[11px] text-text-muted uppercase tracking-wider">{label}</p>
      <p
        className={[
          'text-[18px] font-semibold mt-1 font-mono',
          tone === 'pos' ? 'text-emerald-400' : 'text-rose-400',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}
