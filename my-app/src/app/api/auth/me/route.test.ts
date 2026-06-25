import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

function makeJwt(payload: Record<string, unknown>): string {
  const enc = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(payload)}.sig`
}

describe('GET /api/auth/me (thin reader)', () => {
  it('trả user hiện tại từ access_token cookie', async () => {
    const token = makeJwt({
      userId: 'u-1',
      email: 'user@example.com',
      displayName: 'Demo User',
      avatarUrl: 'https://example.com/avatar.png',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    const req = new NextRequest('http://localhost/api/auth/me', {
      headers: { cookie: `access_token=${encodeURIComponent(token)}` },
    })

    const res = await GET(req)

    expect(await res.json()).toEqual({
      userId: 'u-1',
      email: 'user@example.com',
      displayName: 'Demo User',
      avatarUrl: 'https://example.com/avatar.png',
      role: 'ADMIN',
    })
  })

  it('trả null khi access_token hết hạn — middleware/refresh route lo việc refresh', async () => {
    const expiredToken = makeJwt({
      userId: 'u-1',
      role: 'CLIENT',
      exp: Math.floor(Date.now() / 1000) - 10,
    })
    const req = new NextRequest('http://localhost/api/auth/me', {
      headers: { cookie: `access_token=${encodeURIComponent(expiredToken)}; refresh_token=old-refresh` },
    })

    const res = await GET(req)

    expect(await res.json()).toBeNull()
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('trả null khi không có cookie', async () => {
    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    expect(await res.json()).toBeNull()
  })
})
