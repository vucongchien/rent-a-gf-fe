import { describe, it, expect } from 'vitest'
import { decodeJwtExp, shouldRefreshAccessToken } from '../tokenRefresh'

function makeJwt(payload: Record<string, unknown>): string {
  const enc = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(payload)}.sig`
}

describe('decodeJwtExp', () => {
  it('extract exp từ JWT payload hợp lệ', () => {
    const exp = 1_900_000_000
    expect(decodeJwtExp(makeJwt({ sub: 'u1', exp }))).toBe(exp)
  })

  it('trả null khi format không phải JWT 3 parts', () => {
    expect(decodeJwtExp('abc.def')).toBeNull()
    expect(decodeJwtExp('abc')).toBeNull()
  })

  it('trả null khi payload không có exp', () => {
    expect(decodeJwtExp(makeJwt({ sub: 'u1' }))).toBeNull()
  })

  it('trả null khi payload không decode được', () => {
    expect(decodeJwtExp('aaa.!!!.zzz')).toBeNull()
  })
})

describe('shouldRefreshAccessToken', () => {
  it('false khi không có token', () => {
    expect(shouldRefreshAccessToken(null)).toBe(false)
    expect(shouldRefreshAccessToken('')).toBe(false)
    expect(shouldRefreshAccessToken(undefined)).toBe(false)
  })

  it('true khi exp đã qua', () => {
    const past = Math.floor(Date.now() / 1000) - 10
    expect(shouldRefreshAccessToken(makeJwt({ exp: past }))).toBe(true)
  })

  it('true khi exp trong leadSeconds', () => {
    const soon = Math.floor(Date.now() / 1000) + 30
    expect(shouldRefreshAccessToken(makeJwt({ exp: soon }), 60)).toBe(true)
  })

  it('false khi exp còn xa hơn leadSeconds', () => {
    const far = Math.floor(Date.now() / 1000) + 3600
    expect(shouldRefreshAccessToken(makeJwt({ exp: far }), 60)).toBe(false)
  })

  it('false (không refresh) khi decode fail để tránh loop', () => {
    expect(shouldRefreshAccessToken('not.a.jwt')).toBe(false)
  })
})
