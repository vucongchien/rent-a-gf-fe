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
  async getTransactions(_options?: ServiceRequestOptions): Promise<WalletTransaction[]> {
    return [];
  }
};
