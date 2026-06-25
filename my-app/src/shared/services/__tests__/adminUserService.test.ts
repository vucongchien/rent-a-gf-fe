import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))

vi.mock('@/shared/lib/tokenRefresh', () => ({
  refreshTokensFromCookie: vi.fn(),
}))

import { cookies, headers } from 'next/headers'
import { adminUserService } from '../adminUserService'

describe('adminUserService', () => {
  const originalApiUrl = process.env.API_URL

  beforeEach(() => {
    process.env.API_URL = 'https://api.example.test/api/v1'
    vi.mocked(cookies).mockResolvedValue({
      toString: () => 'access_token=admin-token; refresh_token=refresh-token',
    } as never)
    vi.mocked(headers).mockResolvedValue({
      get: () => null,
    } as never)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        rows: [],
        total: 0,
        page: 1,
        pageSize: 12,
        counts: { ACTIVE: 0, LOCKED: 0 },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  afterEach(() => {
    process.env.API_URL = originalApiUrl
    vi.restoreAllMocks()
  })

  it('tự forward cookie và gửi Bearer khi Server Component không truyền req', async () => {
    await adminUserService.list({ page: 1, pageSize: 12 })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/admin/accounts?page=1&pageSize=12',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer admin-token',
        }),
      }),
    )
  })
})
