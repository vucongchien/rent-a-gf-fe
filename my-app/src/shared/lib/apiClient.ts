/**
 * apiClient.ts — Server-side BFF fetch helper.
 *
 * CHỈ dùng trong Next.js Route Handlers (server-side).
 * KHÔNG import file này ở 'use client' components.
 *
 * Auth flow (theo backend-api-design.md):
 *   Browser → BFF: HTTPS + HttpOnly Cookie (chứa JWT session)
 *   BFF → API Gateway: HTTP + Authorization: Bearer <JWT>
 *
 * apiClient tự đọc JWT từ cookie tên AUTH_COOKIE_NAME
 * (mặc định: "access_token") và inject vào Bearer header.
 *
 * Toggle mock/real:
 *   - API_URL không set → MSW intercept ở browser (dev offline)
 *   - API_URL có giá trị → Route Handler proxy sang backend thực
 */

import { ApiError } from './apiError'
import type { ApiErrorDetail } from '@/shared/types'

const TIMEOUT_MS = 10_000
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'access_token'

export interface ServerFetchOptions {
  /** NextRequest để extract JWT từ Cookie header */
  req?: { headers: { get(name: string): string | null } }
  /** Query params forward từ client request */
  searchParams?: URLSearchParams
  /** Request body cho POST/PATCH */
  body?: unknown
  /** HTTP method, mặc định GET */
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  /** Header bổ sung forward sang BE (ví dụ x-idempotency-key). Cookie/Authorization tự thêm. */
  extraHeaders?: Record<string, string>
  /** Next.js cache option */
  cache?: RequestCache
  /** Next.js revalidate + tags */
  next?: NextFetchRequestConfig
}

/**
 * Trích xuất giá trị của một cookie cụ thể từ cookie string.
 */
function extractCookieValue(cookieHeader: string, name: string): string | null {
  const match = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : null
}

/**
 * Server-side fetch tới backend theo BFF pattern.
 * - Tự extract JWT từ cookie → thêm Authorization: Bearer header
 * - Timeout 10s với AbortController
 * - Log chi tiết ở development
 * - Throw ApiError cho mọi trường hợp lỗi
 *
 * @param path - Đường dẫn tương đối, ví dụ: '/companions', '/bookings/bk-123'
 * @param options - Tùy chọn fetch
 */
export async function serverFetch<T = unknown>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const apiUrl = process.env.API_URL

  if (!apiUrl) {
    throw ApiError.serviceUnavailable(
      '[BFF] API_URL chưa được set. ' +
      'Dev offline: không set API_URL để MSW tự intercept tại browser.',
    )
  }

  const { req, searchParams, body, method = 'GET', extraHeaders, cache, next } = options

  // Build URL
  const url = new URL(apiUrl.replace(/\/$/, '') + path)
  if (searchParams) {
    searchParams.forEach((value, key) => url.searchParams.set(key, value))
  }

  // Extract JWT từ cookie → thêm Bearer header (theo backend-api-design.md §1.1)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const cookieHeader = req?.headers.get('cookie') ?? ''
  const token = extractCookieValue(cookieHeader, AUTH_COOKIE_NAME)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) headers[k] = v
  }

  // Timeout
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const startAt = Date.now()

  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache,
      next,
    })

    const elapsed = Date.now() - startAt
    if (process.env.NODE_ENV === 'development') {
      console.log(`[BFF] ${method} ${path} → ${res.status} (${elapsed}ms)`)
    }

    if (!res.ok) {
      // Parse Naked JSON Error format ở root level: { code, message, details }
      let code: string | number = `HTTP_${res.status}`
      let message = `Backend trả về ${res.status} cho ${method} ${path}`
      let details: ApiErrorDetail[] = []
      let raw: unknown = null
      try {
        raw = await res.json()
        const errBody = raw as { code?: string | number; message?: string; details?: ApiErrorDetail[] }
        if (errBody?.code !== undefined) code = errBody.code
        if (errBody?.message) message = errBody.message
        if (errBody?.details) details = errBody.details
      } catch { /* ignore parse error */ }

      throw new ApiError(res.status, code, message, details, raw)
    }

    // Trả về trực tiếp JSON payload ở root level (Naked JSON)
    return res.json() as Promise<T>
  } catch (err) {
    if (err instanceof ApiError) throw err
    const isTimeout = (err as Error)?.name === 'AbortError'
    throw ApiError.serviceUnavailable(
      isTimeout
        ? `[BFF] Timeout sau ${TIMEOUT_MS}ms: ${method} ${path}`
        : `[BFF] Không thể kết nối backend: ${(err as Error)?.message}`,
    )
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Tạo error response chuẩn để trả về client từ Route Handler.
 * Import từ next/server ở nơi dùng.
 */
export function toErrorPayload(err: unknown): { status: number; code: string | number; message: string } {
  if (err instanceof ApiError) {
    return { status: err.status, code: err.code, message: err.message }
  }
  return { status: 500, code: 'INTERNAL_ERROR', message: 'Lỗi hệ thống không xác định' }
}
