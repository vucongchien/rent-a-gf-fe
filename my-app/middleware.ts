import { NextRequest, NextResponse } from 'next/server'
import { refreshTokensFromCookie, shouldRefreshAccessToken } from './src/shared/lib/tokenRefresh'
import {
  accessTokenCookieOptions,
  AUTH_COOKIE_NAME,
  refreshTokenCookieOptions,
  REFRESH_COOKIE_NAME,
} from './src/shared/lib/authCookies'

/**
 * Middleware — decode JWT từ cookie HttpOnly, inject header `user-id`
 * vào request forwarded sang Server Component / Route Handler / Server Action.
 *
 * Lý do tách:
 * - Next 16 `'use cache'` cấm gọi `cookies()` bên trong; userId phải đến từ arg.
 * - Decode 1 lần / request, mọi service tiêu thụ qua `getCurrentUserId()`.
 * - KHÔNG verify chữ ký ở FE/BFF (chưa cấp JWT_SECRET). Tin cookie HttpOnly
 *   do BE set; BE thật vẫn re-verify khi nhận Bearer token.
 *
 * Auto-refresh (P0-1):
 * - Nếu access_token sắp/đã hết hạn hoặc đã bị browser drop do maxAge,
 *   AND có refresh_token → gọi BE /auth/refresh server-to-server, set lại
 *   cookie + dùng access_token mới cho request hiện tại.
 * - Skip cho `/api/auth/*` (tránh recursion với chính refresh endpoint).
 * - Refresh fail → clear cả 2 cookie, forward tiếp; downstream sẽ thấy unauth.
 *
 * Cookie thiếu hoặc payload không có `sub`/`userId` → bỏ header, không reject.
 * Việc enforce auth vẫn thuộc về service / route handler tiếp theo.
 */

const USER_ID_HEADER = 'user-id'
const USER_ROLE_HEADER = 'user-role'
const USER_EMAIL_HEADER = 'user-email'

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), '=')
    const json = atob(payload)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function extractUserId(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null
  const candidate = payload['userId'] ?? payload['sub'] ?? payload['user_id']
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null
}

function extractString(payload: Record<string, unknown> | null, keys: string[]): string | null {
  if (!payload) return null
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return null
}

function buildRequestHeaders(req: NextRequest, accessToken: string | null | undefined): Headers {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.delete(USER_ID_HEADER)
  requestHeaders.delete(USER_ROLE_HEADER)
  requestHeaders.delete(USER_EMAIL_HEADER)
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken)
    const userId = extractUserId(payload)
    const userRole = extractString(payload, ['role', 'userRole', 'user_role'])
    const userEmail = extractString(payload, ['email'])
    if (userId) requestHeaders.set(USER_ID_HEADER, userId)
    if (userRole) requestHeaders.set(USER_ROLE_HEADER, userRole)
    if (userEmail) requestHeaders.set(USER_EMAIL_HEADER, userEmail)
  }
  return requestHeaders
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const accessToken = req.cookies.get(AUTH_COOKIE_NAME)?.value ?? null
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value ?? null

  // Skip refresh logic cho các endpoint tự quản cookie (refresh/callback/logout/mock-switch)
  // — tránh recursion (refresh tự call /auth/refresh) hoặc ghi đè cookie họ vừa set.
  // /api/auth/me KHÔNG nằm trong skip list — nó là thin reader, để middleware refresh giúp.
  const skipRefresh =
    pathname === '/api/auth/refresh' ||
    pathname === '/api/auth/callback' ||
    pathname === '/api/auth/logout' ||
    pathname === '/api/auth/mock-switch'

  const debugAuth =
    process.env.NODE_ENV !== 'production' &&
    (pathname.startsWith('/api/auth') || pathname === '/' || pathname.startsWith('/me'))

  if (debugAuth) {
    console.log('[mw]', pathname, {
      hasAccess: !!accessToken,
      hasRefresh: !!refreshToken,
      shouldRefresh: accessToken ? shouldRefreshAccessToken(accessToken, 60) : 'no-access',
      apiUrl: !!process.env.API_URL,
      skipRefresh,
    })
  }

  if (
    !skipRefresh &&
    process.env.API_URL &&
    refreshToken &&
    (!accessToken || shouldRefreshAccessToken(accessToken, 60))
  ) {
    if (debugAuth) console.log('[mw-refresh] try', pathname)
    const fresh = await refreshTokensFromCookie(refreshToken)
    if (debugAuth) console.log('[mw-refresh] result', pathname, fresh ? 'OK' : 'FAIL')
    if (fresh) {
      // Forward request với access_token mới (inject Bearer downstream qua cookie header).
      const requestHeaders = buildRequestHeaders(req, fresh.accessToken)
      // Patch cookie header để serverFetch downstream đọc được access_token mới.
      const existingCookie = requestHeaders.get('cookie') ?? ''
      const patched = patchCookieHeader(existingCookie, AUTH_COOKIE_NAME, fresh.accessToken)
      requestHeaders.set('cookie', patched)

      const res = NextResponse.next({ request: { headers: requestHeaders } })
      res.cookies.set(AUTH_COOKIE_NAME, fresh.accessToken, accessTokenCookieOptions(fresh.expiresIn ?? 3600))
      res.cookies.set(REFRESH_COOKIE_NAME, fresh.refreshToken, refreshTokenCookieOptions())
      return res
    } else {
      // Refresh fail → clear cookies. Downstream service sẽ thấy unauth và 401.
      const requestHeaders = buildRequestHeaders(req, null)
      const existingCookie = requestHeaders.get('cookie') ?? ''
      const stripped = stripCookieHeader(existingCookie, [AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME])
      requestHeaders.set('cookie', stripped)
      const res = NextResponse.next({ request: { headers: requestHeaders } })
      res.cookies.delete(AUTH_COOKIE_NAME)
      res.cookies.delete(REFRESH_COOKIE_NAME)
      return res
    }
  }

  // Default path: chỉ inject user context headers.
  return NextResponse.next({ request: { headers: buildRequestHeaders(req, accessToken) } })
}

/** Thay value của 1 cookie trong header `cookie`. Append nếu chưa có. */
function patchCookieHeader(header: string, name: string, value: string): string {
  const parts = header
    .split(';')
    .map(p => p.trim())
    .filter(Boolean)
  let found = false
  const next = parts.map(p => {
    if (p.startsWith(`${name}=`)) {
      found = true
      return `${name}=${value}`
    }
    return p
  })
  if (!found) next.push(`${name}=${value}`)
  return next.join('; ')
}

/** Loại các cookie theo name khỏi header `cookie`. */
function stripCookieHeader(header: string, names: string[]): string {
  const set = new Set(names)
  return header
    .split(';')
    .map(p => p.trim())
    .filter(Boolean)
    .filter(p => {
      const eq = p.indexOf('=')
      const key = eq >= 0 ? p.slice(0, eq) : p
      return !set.has(key)
    })
    .join('; ')
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
