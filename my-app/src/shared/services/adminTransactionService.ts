/**
 * adminTransactionService — đọc/lọc transactions cho admin.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  AdminTransactionListParams,
  AdminTransactionListResponse,
  AdminTransactionRow,
  ServiceRequestOptions,
} from '@/shared/types';

export const adminTransactionService = {
  async list(
    params: AdminTransactionListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminTransactionListResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const sp = new URLSearchParams();
    if (params.type) sp.set('type', params.type);
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));

    interface ApiAdminTransactionItem {
      transactionId: string;
      userId: string;
      amount: number;
      type: 'TOPUP' | 'BOOKING_RESERVATION' | 'ESCROW_RELEASE' | 'PENALTY_DEDUCTION' | 'REFUND';
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      referenceId: string;
      createdAt: string;
    }

    interface ApiAdminTransactionsResponse {
      data?: ApiAdminTransactionItem[];
      transactions?: ApiAdminTransactionItem[];
      total?: number;
      page?: number;
      pageSize?: number;
    }

    try {
      const raw = await serverFetch<ApiAdminTransactionsResponse>('/admin/transactions', {
        searchParams: sp,
        req,
      });

      const rawItems = raw.data ?? raw.transactions ?? [];
      const typeLabels: Record<string, string> = {
        TOPUP: 'Nạp tiền vào ví',
        BOOKING_RESERVATION: 'Tạm khóa thanh toán (Đặt cọc)',
        ESCROW_RELEASE: 'Nhận thanh toán (Giải ngân)',
        PENALTY_DEDUCTION: 'Khấu trừ do vi phạm',
        REFUND: 'Hoàn tiền',
      };

      const typeMapping: Record<string, 'TOPUP' | 'BOOKING' | 'REFUND' | 'PAYOUT'> = {
        TOPUP: 'TOPUP',
        BOOKING_RESERVATION: 'BOOKING',
        ESCROW_RELEASE: 'PAYOUT',
        PENALTY_DEDUCTION: 'PAYOUT',
        REFUND: 'REFUND',
      };

      const rows: AdminTransactionRow[] = rawItems.map((tx): AdminTransactionRow => {
        const isCredit = ['TOPUP', 'ESCROW_RELEASE', 'REFUND'].includes(tx.type);
        const amount = isCredit ? Math.abs(tx.amount) : -Math.abs(tx.amount);
        return {
          transactionId: tx.transactionId,
          type: typeMapping[tx.type] || 'BOOKING',
          status: tx.status || 'SUCCESS',
          amount,
          userId: tx.userId,
          userName: `User #${tx.userId.slice(0, 6)}`,
          description: typeLabels[tx.type] || `Giao dịch ${tx.type}`,
          reference: tx.referenceId || null,
          createdAt: tx.createdAt,
        };
      });

      // Tính toán counts
      const counts = {
        PENDING: rows.filter((r) => r.status === 'PENDING').length,
        SUCCESS: rows.filter((r) => r.status === 'SUCCESS').length,
        FAILED: rows.filter((r) => r.status === 'FAILED').length,
      };

      // Tính toán totals cho các giao dịch thành công (SUCCESS)
      const successTransactions = rows.filter((r) => r.status === 'SUCCESS');
      const grossCredit = successTransactions
        .filter((r) => r.amount > 0)
        .reduce((sum, r) => sum + r.amount, 0);
      const grossDebit = successTransactions
        .filter((r) => r.amount < 0)
        .reduce((sum, r) => sum + Math.abs(r.amount), 0);
      const netFlow = grossCredit - grossDebit;

      return {
        rows,
        total: raw.total ?? rows.length,
        page: raw.page ?? params.page ?? 1,
        pageSize: raw.pageSize ?? params.pageSize ?? 15,
        counts,
        totals: {
          grossCredit,
          grossDebit,
          netFlow,
        },
      };
    } catch (err) {
      console.error('[adminTransactionService.list] Lỗi gọi API giao dịch Admin:', err);
      return {
        rows: [],
        total: 0,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 15,
        counts: { PENDING: 0, SUCCESS: 0, FAILED: 0 },
        totals: { grossCredit: 0, grossDebit: 0, netFlow: 0 },
      };
    }
  },
};
