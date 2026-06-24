import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/apiClient', () => ({
  serverFetch: vi.fn(),
}));

vi.mock('@/shared/lib/cookieHelper', () => ({
  getRequestCookieHeader: vi.fn(() => Promise.resolve({ Cookie: 'mock-cookie' })),
}));

const { walletService } = await import('../walletService');
const { serverFetch } = await import('@/shared/lib/apiClient');

describe('walletService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWallet', () => {
    it('nên gọi API /finance/wallet', async () => {
      const apiWalletResponse = { walletId: 'wall_real_999', userId: 'user_real', availableBalance: 100, frozenBalance: 0 };
      vi.mocked(serverFetch).mockResolvedValueOnce(apiWalletResponse);

      const wallet = await walletService.getWallet();

      expect(serverFetch).toHaveBeenCalledWith('/finance/wallet', expect.any(Object));
      expect(wallet).toEqual(apiWalletResponse);
    });
  });

  describe('getTransactions', () => {
    it('nên gọi API /finance/transactions', async () => {
      const apiTxResponse = [
        { transactionId: 'tx-real', walletId: 'wall_real', description: 'Booking', amount: -200, type: 'DEBIT', status: 'SUCCESS', createdAt: '2026-06-23T10:00:00Z' }
      ];
      vi.mocked(serverFetch).mockResolvedValueOnce(apiTxResponse);

      const transactions = await walletService.getTransactions();

      expect(serverFetch).toHaveBeenCalledWith('/finance/transactions', expect.any(Object));
      expect(transactions).toEqual(apiTxResponse);
    });
  });

  describe('initiateTopup', () => {
    it('nên gọi API POST /finance/topup', async () => {
      const apiTopupResponse = { paymentUrl: 'https://real.vnpay.vn/pay' };
      vi.mocked(serverFetch).mockResolvedValueOnce(apiTopupResponse);

      const response = await walletService.initiateTopup({ amount: 500 });

      expect(serverFetch).toHaveBeenCalledWith('/finance/topup', expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ amount: 500 }),
      }));
      expect(response).toEqual(apiTopupResponse);
    });
  });
});
