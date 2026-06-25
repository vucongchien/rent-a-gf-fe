import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))

vi.mock('@/shared/lib/tokenRefresh', () => ({
  refreshTokensFromCookie: vi.fn(),
}))

import { walletService } from '../walletService'

describe('walletService finance contract', () => {
  const originalApiUrl = process.env.API_URL

  beforeEach(() => {
    process.env.API_URL = 'https://api.example.test/api/v1'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ paymentUrl: 'https://sandbox.vnpay.test/checkout' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  afterEach(() => {
    process.env.API_URL = originalApiUrl
    vi.restoreAllMocks()
  })

  it('initiateTopup gửi user-id header và body chỉ có amount', async () => {
    const req = {
      headers: {
        get: (name: string) => {
          const key = name.toLowerCase()
          if (key === 'cookie') return 'access_token=jwt-token'
          if (key === 'user-id') return 'user-123'
          return null
        },
      },
    }

    await walletService.initiateTopup({ amount: 100 }, {
      req,
      idempotencyKey: 'idem-1',
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/finance/topup',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ amount: 100 }),
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token',
          'user-id': 'user-123',
          'x-idempotency-key': 'idem-1',
        }),
      }),
    )
  })

  it('getWallet gửi user-id header', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({
        walletId: 'w-1',
        userId: 'user-123',
        availableBalance: 100,
        frozenBalance: 0,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await walletService.getWallet({
      req: {
        headers: {
          get: (name: string) => {
            const key = name.toLowerCase()
            if (key === 'cookie') return 'access_token=jwt-token'
            if (key === 'user-id') return 'user-123'
            return null
          },
        },
      },
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/finance/wallet',
      expect.objectContaining({
        headers: expect.objectContaining({
          'user-id': 'user-123',
        }),
      }),
    )
  })

  it('getTransactions gửi user-id header và map đúng Credit/Debit', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          transactions: [
            {
              transactionId: 'tx-1',
              userId: 'user-123',
              amount: 100,
              type: 'TOPUP',
              status: 'SUCCESS',
              referenceId: 'ref-1',
              createdAt: '2026-06-25T13:00:00Z',
            },
            {
              transactionId: 'tx-2',
              userId: 'user-123',
              amount: 200,
              type: 'BOOKING_RESERVATION',
              status: 'PENDING',
              referenceId: 'ref-2',
              createdAt: '2026-06-25T14:00:00Z',
            },
          ],
          page: 1,
          pageSize: 10,
          total: 2,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const txs = await walletService.getTransactions({
      req: {
        headers: {
          get: (name: string) => {
            const key = name.toLowerCase();
            if (key === 'cookie') return 'access_token=jwt-token';
            if (key === 'user-id') return 'user-123';
            return null;
          },
        },
      },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/finance/transactions',
      expect.objectContaining({
        headers: expect.objectContaining({
          'user-id': 'user-123',
          Authorization: 'Bearer jwt-token',
        }),
      }),
    );

    expect(txs).toHaveLength(2);
    expect(txs[0]).toEqual({
      transactionId: 'tx-1',
      walletId: 'user-123',
      amount: 100,
      type: 'CREDIT',
      status: 'SUCCESS',
      createdAt: '2026-06-25T13:00:00Z',
      description: 'Nạp tiền vào ví',
    });
    expect(txs[1]).toEqual({
      transactionId: 'tx-2',
      walletId: 'user-123',
      amount: 200,
      type: 'DEBIT',
      status: 'PENDING',
      createdAt: '2026-06-25T14:00:00Z',
      description: 'Tạm khóa thanh toán (Đặt cọc)',
    });
  });
})
