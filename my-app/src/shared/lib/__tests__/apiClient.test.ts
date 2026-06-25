import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { serverFetch } from '../apiClient'
import { ApiError } from '../apiError'

describe('serverFetch', () => {
  const originalApiUrl = process.env.API_URL

  beforeEach(() => {
    process.env.API_URL = 'https://api.example.test/api/v1'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  afterEach(() => {
    process.env.API_URL = originalApiUrl
    vi.restoreAllMocks()
  })

  it('gắn Authorization Bearer từ access_token cookie', async () => {
    await serverFetch('/bookings', {
      req: {
        headers: {
          get: (name: string) => name.toLowerCase() === 'cookie'
            ? 'foo=bar; access_token=jwt-token'
            : null,
        },
      },
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/bookings',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token',
        }),
      }),
    )
  })

  it('không gắn Authorization khi không có access_token', async () => {
    await serverFetch('/companions', {
      req: {
        headers: {
          get: (name: string) => name.toLowerCase() === 'cookie' ? 'foo=bar' : null,
        },
      },
    })

    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('throw ApiError.unauthorized khi BE trả 401 (không tự retry)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      serverFetch('/bookings', {
        req: {
          headers: {
            get: (name: string) =>
              name.toLowerCase() === 'cookie' ? 'access_token=jwt; refresh_token=rt' : null,
          },
        },
      }),
    ).rejects.toBeInstanceOf(ApiError)

    // KHÔNG được retry: chỉ đúng 1 lần fetch.
    expect(vi.mocked(globalThis.fetch).mock.calls.length).toBe(1)
  })

  it('forward user-id từ request header sang backend', async () => {
    await serverFetch('/finance/wallet', {
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
})
