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

  it('getTransactions không gọi endpoint ngoài OpenAPI', async () => {
    const transactions = await walletService.getTransactions()
    expect(transactions).toEqual([])
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
