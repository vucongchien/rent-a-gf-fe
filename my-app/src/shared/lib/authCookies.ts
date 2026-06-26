import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'access_token'
export const REFRESH_COOKIE_NAME = 'refresh_token'
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60

export function isSecureCookieEnv() {
  return process.env.NODE_ENV === 'production'
}

export function accessTokenCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isSecureCookieEnv(),
    sameSite: 'lax',
    path: '/',
    maxAge: Math.max(maxAge, 60),
  }
}

export function refreshTokenCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isSecureCookieEnv(),
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  }
}
