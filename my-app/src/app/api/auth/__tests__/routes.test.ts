import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Mock env helpers
vi.mock('@/shared/lib/env', () => ({
  isMockMode: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
  }),
}))

describe('BFF OAuth Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('GET /api/auth/google', () => {
    it('Mock Mode: redirect về /api/auth/callback kèm mock token', async () => {
      const { isMockMode } = await import('@/shared/lib/env')
      vi.mocked(isMockMode).mockReturnValue(true)

      const { GET } = await import('../google/route')
      const req = new NextRequest('http://localhost:3000/api/auth/google')
      const response = await GET(req)

      expect(response.status).toBe(307) // Temporary Redirect
      const location = response.headers.get('location')
      expect(location).toContain('/api/auth/callback')
      expect(location).toContain('token=')
    })

    it('Real Mode: redirect sang Backend Google Init endpoint', async () => {
      const { isMockMode } = await import('@/shared/lib/env')
      vi.mocked(isMockMode).mockReturnValue(false)
      process.env.API_URL = 'http://mock-backend.com'

      const { GET } = await import('../google/route')
      const req = new NextRequest('http://localhost:3000/api/auth/google')
      const response = await GET(req)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://mock-backend.com/api/v1/auth/google/init')
    })
  })

  describe('GET /api/auth/callback', () => {
    it('trả về 400 nếu thiếu token query parameter', async () => {
      const { GET } = await import('../callback/route')
      const req = new NextRequest('http://localhost:3000/api/auth/callback')
      const response = await GET(req)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Thiếu token xác thực')
    })

    it('ghi cookie access_token và redirect về trang chủ khi có token hợp lệ', async () => {
      const { cookies } = await import('next/headers')
      const mockCookieSet = vi.fn()
      vi.mocked(cookies).mockResolvedValue({
        set: mockCookieSet,
      } as unknown as ReadonlyRequestCookies)

      const { GET } = await import('../callback/route')
      const req = new NextRequest('http://localhost:3000/api/auth/callback?token=mock-backend-jwt-token')
      const response = await GET(req)

      expect(mockCookieSet).toHaveBeenCalledWith('access_token', 'mock-backend-jwt-token', expect.objectContaining({
        httpOnly: true,
        path: '/',
      }))
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/')
    })
  })
})
