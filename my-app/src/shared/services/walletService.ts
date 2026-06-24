import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { getCurrentUserId } from '@/shared/lib/userContext';
import { decodeJwtPayload } from '@/shared/lib/tokenRefresh';
import type { Wallet, TopupResponse, WalletTransaction, ServiceRequestOptions } from '@/shared/types';

export interface InitiateTopupOptions extends ServiceRequestOptions {
  /** Idempotency key forward từ client để chống double-charge ở BE. */
  idempotencyKey?: string;
}

function parseCookie(cookieString: string | null, name: string): string | null {
  if (!cookieString) return null;
  const match = cookieString.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export const walletService = {
  /**
   * Lấy thông tin ví của user hiện tại.
   * KHÔNG cache (user-specific + tài chính cần fresh).
   */
  async getWallet(options?: ServiceRequestOptions): Promise<Wallet> {
    const req = await getRequestCookieHeader(options?.req);
    
    // Tự động lấy userId từ token trong cookie để truyền vào query params của Backend
    let userId = '';
    let cookieHeader = '';
    if (req) {
      if (req.headers && typeof req.headers.get === 'function') {
        cookieHeader = req.headers.get('cookie') ?? '';
      } else if ('Cookie' in req) {
        cookieHeader = (req as any).Cookie ?? '';
      } else if ('cookie' in req) {
        cookieHeader = (req as any).cookie ?? '';
      }
    }
    const token = parseCookie(cookieHeader, 'access_token');
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload) {
        userId = (payload.userId || payload.sub || payload.user_id) as string;
      }
    }

    const searchParams = new URLSearchParams();
    if (userId) {
      searchParams.set('userId', userId);
    }

    return serverFetch<Wallet>('/finance/wallet', { req, searchParams });
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
