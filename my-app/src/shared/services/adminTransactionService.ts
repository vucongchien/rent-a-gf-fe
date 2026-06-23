/**
 * adminTransactionService — đọc/lọc transactions cho admin.
 *
 * Read-only ở MVP (không cho admin sửa transaction từ UI).
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { adminTransactions } from '@/mocks/fixtures/admin';
import type {
  AdminTransactionListParams,
  AdminTransactionListResponse,
  AdminTransactionStatus,
  ServiceRequestOptions,
} from '@/shared/types';

const isMock = () =>
  process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

export const adminTransactionService = {
  async list(
    params: AdminTransactionListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminTransactionListResponse> {
    if (isMock()) {
      const rows = [...adminTransactions].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );

      const counts: Record<AdminTransactionStatus, number> = {
        PENDING: 0,
        SUCCESS: 0,
        FAILED: 0,
      };
      let grossCredit = 0;
      let grossDebit = 0;
      rows.forEach((r) => {
        counts[r.status]++;
        if (r.status === 'SUCCESS') {
          if (r.amount > 0) grossCredit += r.amount;
          else grossDebit += -r.amount;
        }
      });

      const type = params.type ?? 'ALL';
      const status = params.status ?? 'ALL';
      const q = (params.q ?? '').trim().toLowerCase();
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 20));

      let filtered = rows;
      if (type !== 'ALL') filtered = filtered.filter((r) => r.type === type);
      if (status !== 'ALL') filtered = filtered.filter((r) => r.status === status);
      if (q)
        filtered = filtered.filter(
          (r) =>
            r.transactionId.toLowerCase().includes(q) ||
            r.userName.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            (r.reference?.toLowerCase().includes(q) ?? false),
        );

      const total = filtered.length;
      const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);
      return {
        rows: sliced,
        total,
        page,
        pageSize,
        counts,
        totals: { grossCredit, grossDebit, netFlow: grossCredit - grossDebit },
      };
    }

    const sp = new URLSearchParams();
    if (params.type) sp.set('type', params.type);
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    return serverFetch<AdminTransactionListResponse>('/admin/transactions', {
      searchParams: sp,
      req: options?.req,
    });
  },
};
