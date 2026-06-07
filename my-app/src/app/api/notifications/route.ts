import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/shared/services/notificationService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/notifications */
export async function GET(req: NextRequest) {
  try {
    const data = await notificationService.getNotifications({
      req,
      searchParams: req.nextUrl.searchParams,
    })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
