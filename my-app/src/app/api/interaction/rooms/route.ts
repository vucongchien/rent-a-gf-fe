import { NextRequest, NextResponse } from 'next/server'
import { chatService } from '@/shared/services/chatService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/interaction/rooms — Danh sách phòng chat của user */
export async function GET(req: NextRequest) {
  try {
    const data = await chatService.getChatRooms({ req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
