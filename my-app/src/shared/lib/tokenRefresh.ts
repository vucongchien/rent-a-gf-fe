import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from './authCookies'

/**
 * tokenRefresh.ts — Helper server-to-server gọi BE /auth/refresh.
 *
 * Tách hẳn khỏi `serverFetch` để tránh recursion (vì `serverFetch` retry sẽ
 * gọi lại helper này khi gặp 401, nếu helper gọi `serverFetch` thì loop).
 *
 * Single refresh point: chỉ `middleware.ts` (proactive cho mọi request matched)
 * và `/api/auth/refresh` route (explicit force-rotation từ client) gọi helper này.
 * Service layer + serverFetch KHÔNG được tự refresh — đã refactor để chỉ đọc.
 *
 * ⚠️ Multi-instance caveat: `pendingRefreshes` + `recentRefreshes` là Map
 * in-memory PER-INSTANCE. Khi chạy nhiều Node instance (cluster / serverless
 * scale-out), hai instance khác nhau cùng dùng 1 refresh_token sẽ race: BE
 * rotation invalidate token cũ ngay khi instance đầu thành công → instance thứ
 * hai nhận 401, user bị bounce. Fix triệt để cần distributed lock (Redis SETNX
 * + grace window 5-10s) — không scope refactor này. Workaround tạm: sticky
 * session theo refresh_token cookie ở load balancer.
 */

export interface RefreshedTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME }

const RECENT_REFRESH_TTL_MS = 10_000
const pendingRefreshes = new Map<string, Promise<RefreshedTokens | null>>()
const recentRefreshes = new Map<string, { tokens: RefreshedTokens; expiresAt: number }>()

/**
 * Decode `exp` (giây Unix) từ JWT payload. KHÔNG verify signature
 * (BE thật mới giữ JWT_SECRET; FE/BFF tin cookie HttpOnly).
 */
export function decodeJwtExp(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const seg = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = seg.padEnd(seg.length + ((4 - (seg.length % 4)) % 4), '=')
    // atob có ở Node 18+ và Edge runtime; middleware chạy Edge runtime.
    const json = typeof atob === 'function'
      ? atob(pad)
      : Buffer.from(pad, 'base64').toString('utf8')
    const payload = JSON.parse(json) as { exp?: number }
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

/**
 * Trả true nếu access_token sắp hết hạn (within leadSeconds) hoặc đã hết hạn,
 * hoặc decode fail (an toàn: prefer refresh hơn là để request fail).
 */
export function shouldRefreshAccessToken(
  accessToken: string | null | undefined,
  leadSeconds = 60,
): boolean {
  if (!accessToken) return false // không có token → middleware không refresh
  const exp = decodeJwtExp(accessToken)
  if (exp == null) return true // token lạ/không có exp → thử refresh thay vì để guard đá logout
  const nowSec = Math.floor(Date.now() / 1000)
  return exp - nowSec < leadSeconds
}

/**
 * Gọi BE POST /auth/refresh body `{ refreshToken }`. Trả null nếu fail.
 *
 * KHÔNG dùng `serverFetch` ở đây (tránh recursion). Dùng `fetch` thuần.
 */
export async function refreshTokensFromCookie(
  refreshToken: string,
): Promise<RefreshedTokens | null> {
  if (!refreshToken) return null
  const apiUrl = process.env.API_URL
  if (!apiUrl) return null

  const now = Date.now()
  const recent = recentRefreshes.get(refreshToken)
  if (recent && recent.expiresAt > now) {
    return recent.tokens
  }
  if (recent) {
    recentRefreshes.delete(refreshToken)
  }

  const pending = pendingRefreshes.get(refreshToken)
  if (pending) return pending

  const debug = process.env.NODE_ENV !== 'production'

  const refreshPromise = (async (): Promise<RefreshedTokens | null> => {
    const url = `${apiUrl.replace(/\/$/, '')}/auth/refresh`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!res.ok) {
        if (debug) {
          const body = await res.text().catch(() => '')
          console.log('[refresh] BE non-OK', res.status, body.slice(0, 300))
        }
        return null
      }
      const data = (await res.json()) as Partial<RefreshedTokens>
      if (!data?.accessToken || !data?.refreshToken) {
        if (debug) console.log('[refresh] shape mismatch', Object.keys(data ?? {}))
        return null
      }
      const tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: typeof data.expiresIn === 'number' ? data.expiresIn : 3600,
      }
      recentRefreshes.set(refreshToken, {
        tokens,
        expiresAt: Date.now() + RECENT_REFRESH_TTL_MS,
      })
      if (debug) console.log('[refresh] OK expiresIn=', tokens.expiresIn)
      return tokens
    } catch (err) {
      if (debug) console.log('[refresh] fetch error', (err as Error)?.message)
      return null
    } finally {
      clearTimeout(timer)
    }
  })().catch(() => null).finally(() => {
    pendingRefreshes.delete(refreshToken)
  })

  pendingRefreshes.set(refreshToken, refreshPromise)
  return refreshPromise
}
