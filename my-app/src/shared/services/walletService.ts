import { serverFetch } from '@/shared/lib/apiClient';
import { ApiError } from '@/shared/lib/apiError';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { getUserFromRequest } from '@/shared/lib/authSession';
import { getCurrentUserId } from '@/shared/lib/userContext';
import type { Wallet, TopupResponse, WalletTransaction, ServiceRequestOptions } from '@/shared/types';

export interface InitiateTopupOptions extends ServiceRequestOptions {
  /** Idempotency key forward từ client để chống double-charge ở BE. */
  idempotencyKey?: string;
}

async function resolveFinanceUserId(req?: ServiceRequestOptions['req']): Promise<string> {
  const userIdFromHeader = req?.headers.get('user-id');
  if (userIdFromHeader) return userIdFromHeader;

  const userIdFromCookie = req ? getUserFromRequest(req)?.userId : null;
  if (userIdFromCookie) return userIdFromCookie;

  const userIdFromContext = await getCurrentUserId();
  if (userIdFromContext) return userIdFromContext;

  throw ApiError.unauthorized('Không xác định được user-id cho Finance API');
}

export const walletService = {
  /**
   * Lấy thông tin ví của user hiện tại.
   * KHÔNG cache (user-specific + tài chính cần fresh).
   */
  async getWallet(options?: ServiceRequestOptions): Promise<Wallet> {
    const req = await getRequestCookieHeader(options?.req);
    const userId = await resolveFinanceUserId(req);
    return serverFetch<Wallet>('/finance/wallet', {
      req,
      extraHeaders: { 'user-id': userId },
    });
  },

  /**
   * Khởi tạo nạp tiền qua VNPay.
   *
   * OpenAPI yêu cầu header `user-id` và body `{ amount }`. Bearer token vẫn
   * được `serverFetch` tự gắn từ cookie HttpOnly.
   */
  async initiateTopup(body: { amount: number }, options?: InitiateTopupOptions): Promise<TopupResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const userId = await resolveFinanceUserId(req);
    return serverFetch<TopupResponse>('/finance/topup', {
      req,
      method: 'POST',
      body: { amount: body.amount },
      extraHeaders: {
        'user-id': userId,
        ...(options?.idempotencyKey ? { 'x-idempotency-key': options.idempotencyKey } : {}),
      },
    });
  },

  /**
   * OpenAPI hiện chưa expose `/finance/transactions`; trả rỗng để UI không
   * gọi endpoint ngoài contract và không làm vỡ trang ví/earnings.
   */
  async getTransactions(options?: ServiceRequestOptions): Promise<WalletTransaction[]> {
    const req = await getRequestCookieHeader(options?.req);
    const userId = await resolveFinanceUserId(req);

    interface ApiTransactionItem {
      transactionId: string;
      userId: string;
      amount: number;
      type: 'TOPUP' | 'BOOKING_RESERVATION' | 'ESCROW_RELEASE' | 'PENALTY_DEDUCTION' | 'REFUND';
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      referenceId: string;
      createdAt: string;
    }

    interface ApiTransactionsResponse {
      transactions: ApiTransactionItem[];
      page: number;
      pageSize: number;
      total: number;
    }

    try {
      const res = await serverFetch<ApiTransactionsResponse>('/finance/transactions', {
        req,
        extraHeaders: { 'user-id': userId },
      });

      const typeLabels: Record<string, string> = {
        TOPUP: 'Nạp tiền vào ví',
        BOOKING_RESERVATION: 'Tạm khóa thanh toán (Đặt cọc)',
        ESCROW_RELEASE: 'Nhận thanh toán (Giải ngân)',
        PENALTY_DEDUCTION: 'Khấu trừ do vi phạm',
        REFUND: 'Hoàn tiền',
      };

      return (res.transactions || []).map((tx): WalletTransaction => {
        const isCredit = ['TOPUP', 'ESCROW_RELEASE', 'REFUND'].includes(tx.type);
        return {
          transactionId: tx.transactionId,
          walletId: tx.userId,
          amount: tx.amount,
          type: isCredit ? 'CREDIT' : 'DEBIT',
          status: tx.status,
          createdAt: tx.createdAt,
          description: typeLabels[tx.type] || `Giao dịch ${tx.type}`,
        };
      });
    } catch (err) {
      console.error('[walletService.getTransactions] Lỗi gọi API giao dịch:', err);
      return [];
    }
  }
};
