import { serverFetch } from '@/shared/lib/apiClient';
import { mockWallet } from '@/mocks/fixtures/data';
import type { Wallet, TopupResult, TopupStatus, ApiResponse } from '@/shared/types';
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
   * Lấy thông tin ví và lịch sử giao dịch
   */
  async getWallet(options?: { req?: any }): Promise<ApiResponse<Wallet>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return {
        data: mockWallet as Wallet,
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ApiResponse<Wallet>>('/wallet', { req });
    } catch (err) {
      console.error('[walletService] Lỗi fetch wallet:', err);
      throw err;
    }
  },

  /**
   * Khởi tạo nạp tiền qua VNPay
   */
  async initiateTopup(body: { amountInCoin: number }, options?: { req?: any }): Promise<ApiResponse<TopupResult>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return {
        data: {
          success: true,
          transactionId: `tx-${Math.floor(Math.random() * 100000)}`,
          newBalance: mockWallet.balance + body.amountInCoin,
        }
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ApiResponse<TopupResult>>('/wallet/topup/initiate', {
        req,
        method: 'POST',
        body,
      });
    } catch (err) {
      console.error('[walletService] Lỗi initiate topup:', err);
      throw err;
    }
  },

  /**
   * Poll trạng thái thanh toán VNPay
   */
  async getTopupStatus(txId: string, options?: { req?: any }): Promise<ApiResponse<TopupStatus>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return {
        data: {
          status: 'success',
          creditedCoin: 1000,
        }
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ApiResponse<TopupStatus>>(`/wallet/topup/${txId}/status`, { req });
    } catch (err) {
      console.error(`[walletService] Lỗi fetch topup status ${txId}:`, err);
      throw err;
    }
  }
};
