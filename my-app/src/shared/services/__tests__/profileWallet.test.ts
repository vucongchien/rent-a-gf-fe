import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks các thành phần liên quan
vi.mock('@/shared/lib/apiClient', () => ({
  serverFetch: vi.fn(),
}));

vi.mock('@/shared/lib/cookieHelper', () => ({
  getRequestCookieHeader: vi.fn(() => Promise.resolve({ Cookie: 'mock-cookie' })),
}));

vi.mock('@/shared/lib/env', () => ({
  isMockMode: vi.fn(),
}));

vi.mock('@/mocks/fixtures/data', () => ({
  mockWallet: {
    walletId: 'wall_mock_001',
    userId: 'u-client-1',
    availableBalance: 5000,
    frozenBalance: 1000,
    transactions: [
      { transactionId: 'tx-1', walletId: 'wall_mock_001', description: 'Nạp tiền', amount: 5000, type: 'CREDIT', status: 'SUCCESS', createdAt: '2026-06-23T12:00:00Z' },
      { transactionId: 'tx-2', walletId: 'wall_mock_001', description: 'Thanh toán', amount: -1000, type: 'DEBIT', status: 'SUCCESS', createdAt: '2026-06-23T13:00:00Z' },
    ],
  },
  mockPendingTopups: new Map(),
  currentMockUser: { userId: 'u-client-1', role: 'CLIENT', displayName: 'Mock User', email: 'mock@example.com', avatarUrl: '' },
}));

// Import walletService và các mocks để mockResolvedValue
const { walletService } = await import('../walletService');
const { isMockMode } = await import('@/shared/lib/env');
const { serverFetch } = await import('@/shared/lib/apiClient');
const { mockWallet } = await import('@/mocks/fixtures/data');

describe('walletService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWallet', () => {
    it('nên trả về mockWallet khi ở mock mode', async () => {
      vi.mocked(isMockMode).mockReturnValue(true);

      const wallet = await walletService.getWallet();

      expect(isMockMode).toHaveBeenCalled();
      expect(wallet).toEqual({
        walletId: mockWallet.walletId,
        userId: mockWallet.userId,
        availableBalance: mockWallet.availableBalance,
        frozenBalance: mockWallet.frozenBalance,
      });
      expect(serverFetch).not.toHaveBeenCalled();
    });

    it('nên gọi API /finance/wallet khi không phải mock mode', async () => {
      vi.mocked(isMockMode).mockReturnValue(false);
      const apiWalletResponse = { walletId: 'wall_real_999', userId: 'user_real', availableBalance: 100, frozenBalance: 0 };
      vi.mocked(serverFetch).mockResolvedValueOnce(apiWalletResponse);

      const wallet = await walletService.getWallet();

      expect(isMockMode).toHaveBeenCalled();
      expect(serverFetch).toHaveBeenCalledWith('/finance/wallet', expect.any(Object));
      expect(wallet).toEqual(apiWalletResponse);
    });
  });

  describe('getTransactions', () => {
    it('nên trả về mockWallet transactions khi ở mock mode', async () => {
      vi.mocked(isMockMode).mockReturnValue(true);

      const transactions = await walletService.getTransactions();

      expect(isMockMode).toHaveBeenCalled();
      expect(transactions).toEqual(mockWallet.transactions);
      expect(serverFetch).not.toHaveBeenCalled();
    });

    it('nên gọi API /finance/transactions khi không phải mock mode', async () => {
      vi.mocked(isMockMode).mockReturnValue(false);
      const apiTxResponse = [
        { transactionId: 'tx-real', walletId: 'wall_real', description: 'Booking', amount: -200, type: 'DEBIT', status: 'SUCCESS', createdAt: '2026-06-23T10:00:00Z' }
      ];
      vi.mocked(serverFetch).mockResolvedValueOnce(apiTxResponse);

      const transactions = await walletService.getTransactions();

      expect(isMockMode).toHaveBeenCalled();
      expect(serverFetch).toHaveBeenCalledWith('/finance/transactions', expect.any(Object));
      expect(transactions).toEqual(apiTxResponse);
    });
  });

  describe('initiateTopup', () => {
    it('nên tạo link mock VNPay checkout khi ở mock mode', async () => {
      vi.mocked(isMockMode).mockReturnValue(true);

      const response = await walletService.initiateTopup({ amount: 500 });

      expect(isMockMode).toHaveBeenCalled();
      expect(response.paymentUrl).toContain('/mock/vnpay/checkout');
      expect(response.paymentUrl).toContain('orderId=');
      expect(response.paymentUrl).toContain('amount=500');
      expect(serverFetch).not.toHaveBeenCalled();
    });

    it('nên gọi API POST /finance/topup khi không phải mock mode', async () => {
      vi.mocked(isMockMode).mockReturnValue(false);
      const apiTopupResponse = { paymentUrl: 'https://real.vnpay.vn/pay' };
      vi.mocked(serverFetch).mockResolvedValueOnce(apiTopupResponse);

      const response = await walletService.initiateTopup({ amount: 500 });

      expect(isMockMode).toHaveBeenCalled();
      expect(serverFetch).toHaveBeenCalledWith('/finance/topup', expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ amount: 500 }),
      }));
      expect(response).toEqual(apiTopupResponse);
    });
  });
});
