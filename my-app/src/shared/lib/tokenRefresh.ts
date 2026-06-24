/**
 * tokenRefresh.ts — Helper server-to-server gọi BE /auth/refresh.
 *
 * Tách hẳn khỏi `serverFetch` để tránh recursion (vì `serverFetch` retry sẽ
 * gọi lại helper này khi gặp 401, nếu helper gọi `serverFetch` thì loop).
 *
 * Dùng ở 2 nơi:
 *  - `middleware.ts`: proactive refresh khi access_token sắp hết hạn.
 *  - `apiClient.ts` (serverFetch): reactive refresh khi BE trả 401.
 */

export interface RefreshedTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

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
 * Decode payload từ JWT token dưới dạng Object. KHÔNG verify signature.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const seg = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = seg.padEnd(seg.length + ((4 - (seg.length % 4)) % 4), '=')
    const json = typeof atob === 'function'
      ? atob(pad)
      : Buffer.from(pad, 'base64').toString('utf8')
    return JSON.parse(json) as Record<string, unknown>
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
  if (exp == null) return false // decode fail → để downstream handle, tránh loop
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

  try {
    const url = `${apiUrl.replace(/\/$/, '')}/api/v1/auth/refresh`
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
      if (!res.ok) return null
      const data = (await res.json()) as Partial<RefreshedTokens>
      if (!data?.accessToken || !data?.refreshToken) return null
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: typeof data.expiresIn === 'number' ? data.expiresIn : 3600,
      }
    } finally {
      clearTimeout(timer)
    }
  } catch {
    return null
  }
}
