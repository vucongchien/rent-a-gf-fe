import { serverFetch } from '@/shared/lib/apiClient';
import { mockWallet } from '@/mocks/fixtures/data';
import type { Wallet, TopupResponse, WalletTransaction, ServiceRequestOptions } from '@/shared/types';
import { cookies } from 'next/headers';

async function getRequestCookieHeader(req?: { headers: { get(name: string): string | null } }) {
  if (req) return req;
  try {
    const cookieStore = await cookies();
    return {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'cookie') {
            return cookieStore.toString();
          }
          return null;
        }
      }
    };
  } catch {
    return undefined;
  }
}

export const walletService = {
  /**
   * Lấy thông tin ví
   */
  async getWallet(options?: ServiceRequestOptions): Promise<Wallet> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
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
    } catch (err) {
      console.error('[walletService] Lỗi fetch wallet:', err);
      throw err;
    }
  },

  /**
   * Khởi tạo nạp tiền qua VNPay
   */
  async initiateTopup(body: { amount: number }, options?: ServiceRequestOptions): Promise<TopupResponse> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return {
        paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${body.amount * 1000 * 100}&vnp_TxnRef=mock_tx_${Date.now()}`
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<TopupResponse>('/finance/topup', {
        req,
        method: 'POST',
        body: {
          userId: 'u-client-1', // Mock client-id nếu chạy backend thực tế sẽ tự lấy từ session
          amount: body.amount
        },
      });
    } catch (err) {
      console.error('[walletService] Lỗi initiate topup:', err);
      throw err;
    }
  },

  /**
   * Lấy lịch sử giao dịch
   */
  async getTransactions(options?: ServiceRequestOptions): Promise<WalletTransaction[]> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return mockWallet.transactions;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<WalletTransaction[]>('/finance/transactions', { req });
    } catch (err) {
      console.error('[walletService] Lỗi fetch transactions:', err);
      return [];
    }
  }
};

