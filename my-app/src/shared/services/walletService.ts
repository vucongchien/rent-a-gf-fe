import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { getCurrentUserId } from '@/shared/lib/userContext';
import type { Wallet, TopupResponse, WalletTransaction, ServiceRequestOptions } from '@/shared/types';

export interface InitiateTopupOptions extends ServiceRequestOptions {
  /** Idempotency key forward từ client để chống double-charge ở BE. */
  idempotencyKey?: string;
}

export const walletService = {
  /**
   * Lấy thông tin ví của user hiện tại.
   * KHÔNG cache (user-specific + tài chính cần fresh).
   */
  async getWallet(options?: ServiceRequestOptions): Promise<Wallet> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<Wallet>('/finance/wallet', { req });
  },

  /**
   * Khởi tạo nạp tiền qua VNPay.
   *
   * SSOT yêu cầu body `{ userId, amount }`. userId lấy từ header `user-id`
   * (do middleware decode JWT) qua `getCurrentUserId()`. BE vẫn có thể tự
   * verify khớp với JWT để chống giả mạo. `idempotencyKey` forward từ Route
   * Handler / Server Action để BE chống double-charge khi client retry.
   */
  async initiateTopup(body: { amount: number }, options?: InitiateTopupOptions): Promise<TopupResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const userId = (await getCurrentUserId()) ?? '';
    return serverFetch<TopupResponse>('/finance/topup', {
      req,
      method: 'POST',
      body: { userId, amount: body.amount },
      extraHeaders: options?.idempotencyKey
        ? { 'x-idempotency-key': options.idempotencyKey }
        : undefined,
    });
  },

  /**
   * Lấy lịch sử giao dịch của user hiện tại. KHÔNG cache.
   */
  async getTransactions(options?: ServiceRequestOptions): Promise<WalletTransaction[]> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<WalletTransaction[]>('/finance/transactions', { req });
  }
};
