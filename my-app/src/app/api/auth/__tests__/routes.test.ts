import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
  }),
}))

describe('BFF OAuth Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env.API_URL = 'http://mock-backend.com'
  })

  describe('GET /api/auth/google (init)', () => {
    it('Real Mode: gọi BE init lấy authUrl rồi redirect popup sang IdP', async () => {
      const idpUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test'
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ authUrl: idpUrl }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const { GET } = await import('../google/route')
      const req = new NextRequest('http://localhost:3000/api/auth/google')
      const response = await GET(req)

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://mock-backend.com/api/v1/auth/google/init',
        expect.objectContaining({ method: 'GET' }),
      )
      expect(response.status).toBe(307)
      
      const expectedUrl = new URL(idpUrl)
      expectedUrl.searchParams.set('redirect_uri', 'http://localhost:3000/api/auth/callback')
      expect(response.headers.get('location')).toBe(expectedUrl.toString())

      fetchSpy.mockRestore()
    })

    it('Real Mode: trả 502 khi BE init không có authUrl', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const { GET } = await import('../google/route')
      const req = new NextRequest('http://localhost:3000/api/auth/google')
      const response = await GET(req)

      expect(response.status).toBe(502)
      fetchSpy.mockRestore()
    })
  })

  describe('GET /api/auth/callback (bridge)', () => {
    it('Trả bridge page error khi thiếu code', async () => {
      const { GET } = await import('../callback/route')
      const req = new NextRequest('http://localhost:3000/api/auth/callback')
      const response = await GET(req)

      expect(response.status).toBe(400)
      expect(response.headers.get('content-type')).toContain('text/html')
      const body = await response.text()
      expect(body).toContain('postMessage')
      expect(body).toContain('MISSING_CODE')
    })

    it('Real Mode: gọi BE callback, set cookie access_token + refresh_token và trả bridge success', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          accessToken: 'real_access_token',
          refreshToken: 'real_refresh_token',
          expiresIn: 3600
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const { cookies } = await import('next/headers')
      const mockCookieSet = vi.fn()
      vi.mocked(cookies).mockResolvedValue({
        set: mockCookieSet,
      } as unknown as ReadonlyRequestCookies)

      const { GET } = await import('../callback/route')
      const req = new NextRequest(
        'http://localhost:3000/api/auth/callback?code=some_auth_code&state=some_state',
      )
      const response = await GET(req)

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://mock-backend.com/api/v1/auth/google/callback?code=some_auth_code&state=some_state&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback',
        expect.objectContaining({ method: 'GET' }),
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')

      const accessCall = mockCookieSet.mock.calls.find(([name]) => name === 'access_token')
      const refreshCall = mockCookieSet.mock.calls.find(([name]) => name === 'refresh_token')
      expect(accessCall).toBeTruthy()
      expect(refreshCall).toBeTruthy()
      expect(accessCall?.[1]).toBe('real_access_token')
      expect(refreshCall?.[1]).toBe('real_refresh_token')

      const body = await response.text()
      expect(body).toContain('postMessage')
      expect(body).toContain('"status":"success"')

      fetchSpy.mockRestore()
    })

    it('Real Mode: trả 502 khi BE callback lỗi', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Internal Server Error', {
          status: 500,
        }),
      )

      const { GET } = await import('../callback/route')
      const req = new NextRequest(
        'http://localhost:3000/api/auth/callback?code=some_auth_code&state=some_state',
      )
      const response = await GET(req)

      expect(response.status).toBe(502)
      const body = await response.text()
      expect(body).toContain('postMessage')
      expect(body).toContain('"status":"error"')
      expect(body).toContain('EXCHANGE_FAILED')

      fetchSpy.mockRestore()
    })
  })
})
