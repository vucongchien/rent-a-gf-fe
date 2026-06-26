import { describe, expect, it } from 'vitest'
import { getUserFromCookieHeader, parseCookieValue } from '../authSession'

function makeJwt(payload: Record<string, unknown>): string {
  const enc = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(payload)}.sig`
}

describe('authSession', () => {
  it('parseCookieValue đọc đúng cookie theo tên', () => {
    expect(parseCookieValue('foo=bar; access_token=abc%20123', 'access_token')).toBe('abc 123')
    expect(parseCookieValue('foo=bar', 'access_token')).toBeNull()
  })

  it('getUserFromCookieHeader map JWT payload thành User', () => {
    const token = makeJwt({
      sub: 'u-1',
      email: 'user@example.com',
      name: 'Demo User',
      picture: 'https://example.com/avatar.png',
      role: 'CLIENT',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    expect(getUserFromCookieHeader(`access_token=${encodeURIComponent(token)}`)).toEqual({
      userId: 'u-1',
      email: 'user@example.com',
      displayName: 'Demo User',
      avatarUrl: 'https://example.com/avatar.png',
      role: 'CLIENT',
    })
  })

  it('getUserFromCookieHeader trả null khi token thiếu role hợp lệ', () => {
    const token = makeJwt({ sub: 'u-1', role: 'UNKNOWN', exp: Math.floor(Date.now() / 1000) + 3600 })
    expect(getUserFromCookieHeader(`access_token=${token}`)).toBeNull()
  })

  it('getUserFromCookieHeader trả null khi access token hết hạn', () => {
    const token = makeJwt({
      sub: 'u-1',
      role: 'CLIENT',
      exp: Math.floor(Date.now() / 1000) - 10,
    })
    expect(getUserFromCookieHeader(`access_token=${token}`)).toBeNull()
  })
})
