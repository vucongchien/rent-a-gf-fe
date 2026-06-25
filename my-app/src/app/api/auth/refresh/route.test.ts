import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

describe('POST /api/auth/refresh', () => {
  const originalApiUrl = process.env.API_URL

  beforeEach(() => {
    process.env.API_URL = 'https://api.example.test/api/v1'
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    process.env.API_URL = originalApiUrl
    vi.restoreAllMocks()
  })

  it('refresh bằng refresh_token cookie mà không gửi Bearer access token cũ', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 900,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const req = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: {
        cookie: 'access_token=expired-access-token; refresh_token=old-refresh-token',
      },
    })

    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        headers: expect.not.objectContaining({
          Authorization: expect.any(String),
        }),
        body: JSON.stringify({ refreshToken: 'old-refresh-token' }),
      }),
    )

    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('access_token=new-access-token')
    expect(setCookie).toContain('refresh_token=new-refresh-token')
  })

  it('trả 401 và clear session cookie khi không refresh được', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const req = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: {
        cookie: 'access_token=expired-access-token; refresh_token=invalid-refresh-token',
      },
    })

    const res = await POST(req)

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      code: 'REFRESH_FAILED',
      message: 'Không thể làm mới phiên đăng nhập.',
    })

    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('access_token=')
    expect(setCookie).toContain('refresh_token=')
    expect(setCookie).toContain('Max-Age=0')
  })
})
