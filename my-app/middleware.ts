import { NextRequest, NextResponse } from 'next/server'

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
 * Cookie thiếu hoặc payload không có `sub`/`userId` → bỏ header, không reject.
 * Việc enforce auth vẫn thuộc về service / route handler tiếp theo.
 */

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'access_token'
const USER_ID_HEADER = 'user-id'

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

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.delete(USER_ID_HEADER)

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  if (token) {
    const userId = extractUserId(decodeJwtPayload(token))
    if (userId) requestHeaders.set(USER_ID_HEADER, userId)
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
