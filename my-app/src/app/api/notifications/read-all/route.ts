import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/shared/services/notificationService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/**
 * PATCH /api/notifications/read-all — Đánh dấu tất cả đã đọc.
 *
 * KHÔNG revalidateTag: notifications là user-specific, không cache (AGENTS.md
 * 2026-06 cấm `'use cache'` cho user data). Trước đây dùng `CACHE_TAGS.NOTIFICATIONS`
 * global string → leak cross-user khi cache bật. Đã xoá.
 */
export async function PATCH(req: NextRequest) {
  try {
    const data = await notificationService.markAllAsRead({ req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
