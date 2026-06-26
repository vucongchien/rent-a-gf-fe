import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/shared/lib/authSession'

/**
 * GET /api/auth/me — thin reader.
 *
 * Trả về current user dựa trên access_token cookie hiện tại. Middleware đã
 * refresh + patch cookie header trước khi tới đây (xem middleware.ts), nên
 * route này KHÔNG tự refresh, KHÔNG Set-Cookie. Trả `null` nếu không có session.
 *
 * Client cần ép rotation → POST /api/auth/refresh (riêng biệt).
 */
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  return NextResponse.json(user)
}
