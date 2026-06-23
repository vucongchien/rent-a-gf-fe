import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { mockWallet } from '@/mocks/fixtures/data';
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
    if (isMockMode()) {
      return {
        walletId: mockWallet.walletId,
        userId: mockWallet.userId,
        availableBalance: mockWallet.availableBalance,
        frozenBalance: mockWallet.frozenBalance,
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<Wallet>('/finance/wallet', { req });
    } catch (err: unknown) {
      console.error('[walletService] Lỗi fetch wallet:', err);
      throw err;
    }
  },

  /**
   * Khởi tạo nạp tiền qua VNPay.
   *
   * BE đọc userId từ JWT (Bearer). FE KHÔNG đặt userId trong body — gửi BE giải
   * sẽ tránh giả mạo. `idempotencyKey` forward từ Route Handler / Server Action
   * để BE chống double-charge khi client retry.
   */
  async initiateTopup(body: { amount: number }, options?: InitiateTopupOptions): Promise<TopupResponse> {
    if (isMockMode()) {
      return {
        paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${body.amount * 1000 * 100}&vnp_TxnRef=mock_tx_${Date.now()}`
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<TopupResponse>('/finance/topup', {
        req,
        method: 'POST',
        body: { amount: body.amount },
        extraHeaders: options?.idempotencyKey
          ? { 'x-idempotency-key': options.idempotencyKey }
          : undefined,
      });
    } catch (err: unknown) {
      console.error('[walletService] Lỗi initiate topup:', err);
      throw err;
    }
  },

  /**
   * Lấy lịch sử giao dịch của user hiện tại. KHÔNG cache.
   */
  async getTransactions(options?: ServiceRequestOptions): Promise<WalletTransaction[]> {
    if (isMockMode()) {
      return mockWallet.transactions;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<WalletTransaction[]>('/finance/transactions', { req });
    } catch (err: unknown) {
      console.error('[walletService] Lỗi fetch transactions:', err);
      return [];
    }
  }
};
