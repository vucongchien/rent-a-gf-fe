import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/shared/services/authService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/auth/me — Lấy thông tin user hiện tại từ session */
export async function GET(req: NextRequest) {
  try {
    const data = await authService.getMe({ req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
