import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/shared/services/notificationService'
import { toErrorPayload } from '@/shared/lib/apiClient'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/shared/lib/cacheTags'

/** PATCH /api/notifications/read-all — Đánh dấu tất cả đã đọc */
export async function PATCH(req: NextRequest) {
  try {
    const data = await notificationService.markAllAsRead({ req })
    revalidateTag(CACHE_TAGS.NOTIFICATIONS, { expire: 0 })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
