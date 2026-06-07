import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/shared/services/notificationService'
import { toErrorPayload } from '@/shared/lib/apiClient'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/shared/lib/cacheTags'

/** PATCH /api/notifications/[notifId]/read — Đánh dấu đã đọc 1 notification */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notifId: string }> },
) {
  const { notifId } = await params
  try {
    const data = await notificationService.markAsRead(notifId, { req })
    // Invalidate notification cache ngay sau khi mark-read (Next.js 16 API)
    revalidateTag(CACHE_TAGS.NOTIFICATIONS, { expire: 0 })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
