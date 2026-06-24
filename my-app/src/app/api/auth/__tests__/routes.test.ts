import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

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

  describe('GET /api/auth/google (init)', () => {
    it('Mock Mode: redirect sang /api/auth/callback kèm mock code+state', async () => {
      const { isMockMode } = await import('@/shared/lib/env')
      vi.mocked(isMockMode).mockReturnValue(true)

      const { GET } = await import('../google/route')
      const req = new NextRequest('http://localhost:3000/api/auth/google')
      const response = await GET(req)

      expect(response.status).toBe(307)
      const location = response.headers.get('location') ?? ''
      expect(location).toContain('/api/auth/callback')
      expect(location).toContain('code=')
      expect(location).toContain('state=')
    })

    it('Real Mode: redirect sang BE /auth/google/init', async () => {
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

    it('Mock Mode: set cookie access_token + refresh_token và trả bridge success', async () => {
      const { isMockMode } = await import('@/shared/lib/env')
      vi.mocked(isMockMode).mockReturnValue(true)

      const { cookies } = await import('next/headers')
      const mockCookieSet = vi.fn()
      vi.mocked(cookies).mockResolvedValue({
        set: mockCookieSet,
      } as unknown as ReadonlyRequestCookies)

      const { GET } = await import('../callback/route')
      const req = new NextRequest(
        'http://localhost:3000/api/auth/callback?code=mock_code_abc.def.ghi&state=mock_state',
      )
      const response = await GET(req)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')

      const accessCall = mockCookieSet.mock.calls.find(([name]) => name === 'access_token')
      const refreshCall = mockCookieSet.mock.calls.find(([name]) => name === 'refresh_token')
      expect(accessCall).toBeTruthy()
      expect(refreshCall).toBeTruthy()
      expect(accessCall?.[2]).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
      expect(refreshCall?.[2]).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })

      const body = await response.text()
      expect(body).toContain('postMessage')
      expect(body).toContain('"status":"success"')
    })
  })
})
