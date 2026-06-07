import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/shared/services/authService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** POST /api/auth/logout */
export async function POST(req: NextRequest) {
  try {
    const data = await authService.logout({ req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
