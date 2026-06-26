import { NextRequest, NextResponse } from 'next/server'
import { chatService } from '@/shared/services/chatService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/interaction/rooms — Danh sách phòng chat của user */
export async function GET(req: NextRequest) {
  try {
    // Ưu tiên query param `role` do client truyền (phản ánh UI context: /chat vs /dashboard/chat)
    // Fallback sang user-role header từ middleware (JWT decoded role)
    const queryRole = req.nextUrl.searchParams.get('role')?.toUpperCase()
    const headerRole = req.headers.get('user-role')?.toUpperCase()
    const rawRole = queryRole ?? headerRole
    const role: 'CLIENT' | 'COMPANION' =
      rawRole === 'COMPANION' ? 'COMPANION' : 'CLIENT'

    const data = await chatService.getChatRooms(role, { req })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
