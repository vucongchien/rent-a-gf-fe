import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/shared/services/notificationService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/**
 * PATCH /api/notifications/[notifId]/read — Đánh dấu đã đọc 1 notification.
 * Không revalidateTag (notifications không cache, xem read-all/route.ts).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notifId: string }> },
) {
  const { notifId } = await params
  try {
    const data = await notificationService.markAsRead(notifId, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
